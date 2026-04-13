import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserFlowAccessForApi } from '@/lib/auth/flow';

export async function getAdminDbUser() {
  const access = await requireUserFlowAccessForApi();
  if (!access.ok || !access.user) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: access.user.id },
  });

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return user;
}

export async function requireAdminRoute() {
  const access = await requireUserFlowAccessForApi();
  if (!access.ok || !access.user) {
    return {
      ok: false as const,
      response: access.ok
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : access.response,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: access.user.id },
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
