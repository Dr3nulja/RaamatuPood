import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';

export async function getAdminDbUser() {
  const session = await auth0.getSession();
  const auth0Id = session?.user?.sub;

  if (!auth0Id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { auth0Id },
  });

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return user;
}

export async function requireAdminRoute() {
  const session = await auth0.getSession();
  const auth0Id = session?.user?.sub;

  if (!auth0Id) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { auth0Id },
  });

  if (!user || user.role !== 'ADMIN') {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    user,
  };
}
