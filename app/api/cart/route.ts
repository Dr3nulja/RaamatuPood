import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuthenticatedSession } from '@/lib/auth/sessionGuard';
import type { ApiErrorResponse, CartResponse } from '@/lib/api/types';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';

const cartPostSchema = strictObject({
  bookId: z.number().int().positive(),
  quantity: z.number().int().positive().max(50).optional(),
});

const cartPatchSchema = strictObject({
  bookId: z.number().int().positive(),
  quantity: z.number().int().max(999),
});

function unauthorized() {
  const response: ApiErrorResponse = { error: 'Unauthorized' };
  return NextResponse.json(response, { status: 401 });
}

const getCart = withAuthenticatedSession(async (_request, _context, { dbUser }) => {
  const user = dbUser;

  // Authenticated cart is always loaded from cart_items by user_id.
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          price: true,
          stock: true,
          coverImage: true,
          bookAuthors: {
            orderBy: {
              authorId: 'asc',
            },
            select: {
              author: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { id: 'asc' },
  });

  const items: CartResponse['items'] = cartItems.map((item) => ({
    id: item.bookId,
    title: item.book.title,
    author: item.book.bookAuthors[0]?.author?.name ?? undefined,
    price: Number(item.book.price),
    cover_image: item.book.coverImage ?? undefined,
    quantity: item.quantity,
    stock: item.book.stock,
  }));

  const response: CartResponse = { items };
  return NextResponse.json(response);
});

const addToCart = withAuthenticatedSession(async (request: NextRequest, _context, { dbUser }) => {
  const user = dbUser;

  const body = (await request.json().catch(() => null)) as { bookId?: number; quantity?: number } | null;
  const bookId = Number(body?.bookId);
  const quantity = Math.max(1, Number(body?.quantity ?? 1));

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return NextResponse.json({ error: 'Invalid bookId' }, { status: 400 });
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true, stock: true },
  });

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      userId: user.id,
      bookId,
    },
    select: {
      id: true,
      quantity: true,
    },
  });

  if (existingItem) {
    const nextQuantity = existingItem.quantity + quantity;
    if (nextQuantity > book.stock) {
      return NextResponse.json({ error: 'Requested quantity exceeds stock' }, { status: 400 });
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: nextQuantity },
    });
  } else {
    if (quantity > book.stock) {
      return NextResponse.json({ error: 'Requested quantity exceeds stock' }, { status: 400 });
    }

    await prisma.cartItem.create({
      data: {
        userId: user.id,
        bookId,
        quantity,
      },
    });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
});

const patchCart = withAuthenticatedSession(async (request: NextRequest, _context, { dbUser }) => {
  const user = dbUser;

  const body = (await request.json().catch(() => null)) as { bookId?: number; quantity?: number } | null;
  const bookId = Number(body?.bookId);
  const quantity = Number(body?.quantity);

  if (!Number.isInteger(bookId) || bookId <= 0 || !Number.isInteger(quantity)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      userId: user.id,
      bookId,
    },
    select: {
      id: true,
    },
  });

  if (!existingItem) {
    return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: existingItem.id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { stock: true },
  });

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  if (quantity > book.stock) {
    return NextResponse.json({ error: 'Requested quantity exceeds stock' }, { status: 400 });
  }

  await prisma.cartItem.update({
    where: { id: existingItem.id },
    data: { quantity },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
});

const clearCart = withAuthenticatedSession(async (_request, _context, { dbUser }) => {
  const user = dbUser;

  await prisma.cartItem.deleteMany({
    where: { userId: user.id },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
});

export const GET = withApiSecurity(getCart, {
  requireCaptcha: false,
  rateLimitBucket: 'api',
});

export const POST = withApiSecurity(addToCart, {
  requireCaptcha: false,
  rateLimitBucket: 'api',
  maxBodyBytes: 16 * 1024,
  schemaByMethod: {
    POST: cartPostSchema,
  },
});

export const PATCH = withApiSecurity(patchCart, {
  requireCaptcha: false,
  rateLimitBucket: 'api',
  maxBodyBytes: 16 * 1024,
  schemaByMethod: {
    PATCH: cartPatchSchema,
  },
});

export const DELETE = withApiSecurity(clearCart, {
  requireCaptcha: false,
  rateLimitBucket: 'api',
  maxBodyBytes: 8 * 1024,
});
