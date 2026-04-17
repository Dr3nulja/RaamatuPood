import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { createUserIfNotExists } from '@/lib/auth/createUserIfNotExists';
import { isValidUsername } from '@/lib/auth/flow';
import { updateAuth0ProfileMetadata } from '@/lib/auth/auth0Management';

export const runtime = 'nodejs';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const SUPPORTED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

async function isUsernameTakenCaseInsensitive(username: string, excludeUserId: number) {
  const rows = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id
    FROM users
    WHERE LOWER(name) = LOWER(${username})
      AND id <> ${excludeUserId}
    LIMIT 1
  `;

  return rows.length > 0;
}

function parseFormAvatar(file: File) {
  if (!file.type.startsWith('image/')) {
    return { ok: false as const, error: 'invalid_avatar_type' };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false as const, error: 'avatar_too_large' };
  }

  if (!SUPPORTED_AVATAR_TYPES.has(file.type)) {
    return { ok: false as const, error: 'unsupported_avatar_type' };
  }

  return { ok: true as const };
}

export async function PATCH(request: Request) {
  const session = await auth0.getSession();
  const authUser = session?.user;

  if (!authUser?.sub) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (authUser.email_verified !== true) {
    return NextResponse.json({ error: 'email_not_verified' }, { status: 403 });
  }

  const formData = await request.formData();
  const usernameRaw = String(formData.get('username') || '').trim();
  const avatar = formData.get('avatar');

  const hasUsernameUpdate = usernameRaw.length > 0;
  const hasAvatarUpdate = avatar instanceof File && avatar.size > 0;

  if (!hasUsernameUpdate && !hasAvatarUpdate) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  }

  if (hasUsernameUpdate && !isValidUsername(usernameRaw)) {
    return NextResponse.json(
      { error: 'invalid_username', message: 'Username must be 3-20 chars and use only letters, numbers, _ or -' },
      { status: 400 }
    );
  }

  if (hasAvatarUpdate) {
    const avatarCheck = parseFormAvatar(avatar);
    if (!avatarCheck.ok) {
      const avatarErrors: Record<string, string> = {
        invalid_avatar_type: 'Avatar must be an image file',
        avatar_too_large: 'Avatar must be <= 2MB',
        unsupported_avatar_type: 'Use jpg, png, webp or gif avatar image',
      };

      return NextResponse.json(
        { error: avatarCheck.error, message: avatarErrors[avatarCheck.error] },
        { status: 400 }
      );
    }
  }

  const existingUser =
    (await prisma.user.findUnique({
      where: { auth0Id: authUser.sub },
    })) ?? (await createUserIfNotExists(authUser));

  if (!existingUser) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }

  if (hasUsernameUpdate) {
    const usernameTaken = await isUsernameTakenCaseInsensitive(usernameRaw, existingUser.id);

    if (usernameTaken) {
      return NextResponse.json({ error: 'username_taken', message: 'Username is already in use' }, { status: 409 });
    }
  }

  let avatarDataUrl: string | null = null;
  if (hasAvatarUpdate) {
    const buffer = Buffer.from(await avatar.arrayBuffer());
    avatarDataUrl = `data:${avatar.type};base64,${buffer.toString('base64')}`;
  }

  const user = await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      ...(hasUsernameUpdate ? { name: usernameRaw } : {}),
      ...(avatarDataUrl ? { picture: avatarDataUrl } : {}),
      email: authUser.email?.trim() || existingUser.email,
    },
    select: {
      id: true,
      auth0Id: true,
      name: true,
      picture: true,
      email: true,
    },
  });

  let metadataSyncWarning: string | null = null;
  try {
    await updateAuth0ProfileMetadata({
      auth0UserId: authUser.sub,
      username: user.name || usernameRaw || existingUser.name || '',
      avatarUrl: '/api/profile/avatar',
    });
  } catch (error) {
    metadataSyncWarning = error instanceof Error ? error.message : 'Failed to sync Auth0 metadata';
    console.error('Auth0 metadata sync failed after profile update:', metadataSyncWarning);
  }

  return NextResponse.json(
    {
      ok: true,
      user,
      metadataSyncWarning,
    },
    { status: 200 }
  );
}