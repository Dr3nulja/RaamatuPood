import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { normalizeSessionCartItems } from '@/lib/cart/sessionCart';
import { mergeSessionCartIntoDb } from '@/lib/cart/sync';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';

const syncUserSchema = strictObject({
  cartItems: z.array(
    strictObject({
      id: z.number().int().positive(),
      quantity: z.number().int().positive().max(999),
    })
  ).max(50).optional(),
});

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

async function optionsSyncUser(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  });
}

async function postSyncUser(request: Request) {
  const corsHeaders = getCorsHeaders(request.headers.get('origin'));

  try {
    const payload = (await request.json().catch(() => null)) as { cartItems?: unknown } | null;
    const sessionCartItems = normalizeSessionCartItems(payload?.cartItems);
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

    // Fallback sync after callback: merge client-side session cart into cart_items for this user.
    const mergedCart = await mergeSessionCartIntoDb(user.id, sessionCartItems);

    return NextResponse.json(
      {
        user,
        cart: {
          items: mergedCart.map((item) => ({
            id: item.bookId,
            title: item.book.title,
            author: item.book.bookAuthors[0]?.author?.name ?? undefined,
            price: Number(item.book.price),
            cover_image: item.book.coverImage ?? undefined,
            quantity: item.quantity,
            stock: item.book.stock,
          })),
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sync user';
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}

export const OPTIONS = withApiSecurity(optionsSyncUser, {
  requireCaptcha: false,
  skipBotCheck: true,
  rateLimitBucket: 'auth',
});

export const POST = withApiSecurity(postSyncUser, {
  requireCaptcha: false,
  skipBotCheck: true,
  rateLimitBucket: 'auth',
  maxBodyBytes: 48 * 1024,
  schemaByMethod: {
    POST: syncUserSchema,
  },
});