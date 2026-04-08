import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const allowedOrigins = [
  'http://localhost:3000',
  process.env.AUTH0_BASE_URL,
  process.env.NEXT_PUBLIC_SITE_URL,
].filter((value): value is string => Boolean(value));

function getCorsHeaders(origin: string | null) {
  const resolvedOrigin = origin && allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0] ?? 'http://localhost:3000';

  return {
    'Access-Control-Allow-Origin': resolvedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  });
}

export async function POST(request: Request) {
  const corsHeaders = getCorsHeaders(request.headers.get('origin'));

  try {
    const session = await auth0.getSession();
    const authUser = session?.user;

    if (!authUser?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const auth0Id = authUser.sub;
    const email = authUser.email?.trim() || `${auth0Id}@auth0.local`;
    const name = authUser.name?.trim() || null;
    const picture = authUser.picture?.trim() || null;

    const updateData = {
      email,
      name,
      picture,
    } as any;

    const createData = {
      auth0Id,
      email,
      name,
      picture,
    } as any;

    const user = await prisma.user.upsert({
      where: { auth0Id },
      update: updateData,
      create: createData,
    });

    return NextResponse.json({ user }, { status: 200, headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sync user';
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}