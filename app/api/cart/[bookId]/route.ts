import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuthenticatedSession } from '@/lib/auth/sessionGuard';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';

const cartItemPatchSchema = strictObject({
  quantity: z.number().int().max(999),
});

function parseBookId(value: string) {
  const bookId = Number(value);
  return Number.isInteger(bookId) && bookId > 0 ? bookId : null;
}

const patchCartItem = withAuthenticatedSession(async (
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
  { dbUser }
) => {
  const user = dbUser;

  const { bookId: rawBookId } = await params;
  const bookId = parseBookId(rawBookId);

  if (!bookId) {
    return NextResponse.json({ error: 'Invalid bookId' }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { quantity?: number } | null;
  const quantity = Number(body?.quantity);

  if (!Number.isInteger(quantity)) {
    return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
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
    await prisma.cartItem.delete({
      where: { id: existingItem.id },
    });

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

const deleteCartItem = withAuthenticatedSession(async (
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
  { dbUser }
) => {
  const user = dbUser;

  const { bookId: rawBookId } = await params;
  const bookId = parseBookId(rawBookId);

  if (!bookId) {
    return NextResponse.json({ error: 'Invalid bookId' }, { status: 400 });
  }

  await prisma.cartItem.deleteMany({
    where: {
      userId: user.id,
      bookId,
    },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
});

export const PATCH = withApiSecurity(patchCartItem, {
  bucket: 'api',
  maxBodyBytes: 8 * 1024,
  schemaByMethod: {
    PATCH: cartItemPatchSchema,
  },
  requireCaptcha: false,
});

export const DELETE = withApiSecurity(deleteCartItem, {
  bucket: 'api',
});
