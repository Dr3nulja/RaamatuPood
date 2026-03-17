import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const session = await auth0.getSession();
    const authUser = session?.user;

    if (!authUser?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = authUser.sub;
    const email = authUser.email?.trim() || `${auth0Id}@auth0.local`;
    const name = authUser.name?.trim() || null;
    const picture = authUser.picture?.trim() || null;
    void picture;

    const user = await prisma.user.upsert({
      where: { auth0Id },
      update: {
        email,
        name,
      },
      create: {
        auth0Id,
        email,
        name,
      },
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sync user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
