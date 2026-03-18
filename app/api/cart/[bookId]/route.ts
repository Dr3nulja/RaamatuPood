import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserFromSession } from '@/lib/auth/getDbUserFromSession';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function parseBookId(value: string) {
  const bookId = Number(value);
  return Number.isInteger(bookId) && bookId > 0 ? bookId : null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const user = await getDbUserFromSession();

  if (!user) {
    return unauthorized();
  }

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

  await prisma.cartItem.update({
    where: { id: existingItem.id },
    data: { quantity },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const user = await getDbUserFromSession();

  if (!user) {
    return unauthorized();
  }

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
}
