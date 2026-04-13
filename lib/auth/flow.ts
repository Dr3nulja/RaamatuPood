import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { createUserIfNotExists } from '@/lib/auth/createUserIfNotExists';

export const USERNAME_REGEX = /^[A-Za-z0-9_-]{3,20}$/;

export type AuthFlowState = 'unauthenticated' | 'verify-email' | 'profile-setup' | 'ready';

export function isValidUsername(value: string) {
  return USERNAME_REGEX.test(value);
}

export function hasCompleteProfile(user: { name: string | null; picture: string | null }) {
  const username = user.name?.trim() ?? '';
  const avatarUrl = user.picture?.trim() ?? '';
  return isValidUsername(username) && avatarUrl.length > 0;
}

export async function getAuthFlowState() {
  const session = await auth0.getSession();
  const auth0Id = session?.user?.sub;

  if (!auth0Id) {
    return {
      state: 'unauthenticated' as const,
      session: null,
      dbUser: null,
    };
  }

  if (session.user.email_verified !== true) {
    return {
      state: 'verify-email' as const,
      session,
      dbUser: null,
    };
  }

  const dbUser =
    (await prisma.user.findUnique({
      where: { auth0Id },
    })) ?? (await createUserIfNotExists(session.user));

  if (!dbUser || !hasCompleteProfile(dbUser)) {
    return {
      state: 'profile-setup' as const,
      session,
      dbUser,
    };
  }

  return {
    state: 'ready' as const,
    session,
    dbUser,
  };
}

function buildReturnToQuery(returnTo?: string) {
  return returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : '';
}

export async function requireUserFlowAccess({ returnTo }: { returnTo?: string } = {}) {
  const auth = await getAuthFlowState();

  if (auth.state === 'unauthenticated') {
    redirect(`/auth/login${buildReturnToQuery(returnTo)}`);
  }

  if (auth.state === 'verify-email') {
    redirect(`/verify-email${buildReturnToQuery(returnTo)}`);
  }

  if (auth.state === 'profile-setup') {
    redirect(`/profile-setup${buildReturnToQuery(returnTo)}`);
  }

  return {
    session: auth.session,
    user: auth.dbUser,
  };
}

export async function requireUserFlowAccessForApi() {
  const auth = await getAuthFlowState();

  if (auth.state === 'unauthenticated') {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'unauthorized' }, { status: 401 }),
    };
  }

  if (auth.state === 'verify-email') {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'email_not_verified' }, { status: 403 }),
    };
  }

  if (auth.state === 'profile-setup') {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'profile_setup_required' }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    session: auth.session,
    user: auth.dbUser,
  };
}
