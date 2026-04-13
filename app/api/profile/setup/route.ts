import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { createUserIfNotExists } from '@/lib/auth/createUserIfNotExists';
import { isValidUsername } from '@/lib/auth/flow';
import { updateAuth0ProfileMetadata } from '@/lib/auth/auth0Management';

export const runtime = 'nodejs';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars');

function getImageExtension(mimeType: string) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/gif') return 'gif';
  return null;
}

export async function POST(request: Request) {
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

  if (!isValidUsername(usernameRaw)) {
    return NextResponse.json(
      { error: 'invalid_username', message: 'Username must be 3-20 chars and use only letters, numbers, _ or -' },
      { status: 400 }
    );
  }

  if (!(avatar instanceof File)) {
    return NextResponse.json({ error: 'avatar_required', message: 'Avatar image is required' }, { status: 400 });
  }

  if (!avatar.type.startsWith('image/')) {
    return NextResponse.json({ error: 'invalid_avatar_type', message: 'Avatar must be an image file' }, { status: 400 });
  }

  if (avatar.size > MAX_AVATAR_BYTES) {
    return NextResponse.json({ error: 'avatar_too_large', message: 'Avatar must be <= 2MB' }, { status: 400 });
  }

  const extension = getImageExtension(avatar.type);
  if (!extension) {
    return NextResponse.json(
      { error: 'unsupported_avatar_type', message: 'Use jpg, png, webp or gif avatar image' },
      { status: 400 }
    );
  }

  const existingUser =
    (await prisma.user.findUnique({
      where: { auth0Id: authUser.sub },
    })) ?? (await createUserIfNotExists(authUser));

  if (!existingUser) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }

  const usernameTaken = await prisma.user.findFirst({
    where: {
      name: usernameRaw,
      NOT: {
        id: existingUser.id,
      },
    },
    select: { id: true },
  });

  if (usernameTaken) {
    return NextResponse.json({ error: 'username_taken', message: 'Username is already in use' }, { status: 409 });
  }

  await mkdir(AVATAR_DIR, { recursive: true });

  const safeId = authUser.sub.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${safeId}-${Date.now()}.${extension}`;
  const targetPath = path.join(AVATAR_DIR, fileName);
  const buffer = Buffer.from(await avatar.arrayBuffer());
  await writeFile(targetPath, buffer);

  const avatarUrl = `/uploads/avatars/${fileName}`;

  const user = await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      name: usernameRaw,
      picture: avatarUrl,
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
      username: usernameRaw,
      avatarUrl,
    });
  } catch (error) {
    metadataSyncWarning = error instanceof Error ? error.message : 'Failed to sync Auth0 metadata';
    console.error('Auth0 metadata sync failed after profile setup:', metadataSyncWarning);
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
