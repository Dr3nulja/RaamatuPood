import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserFromSession } from '@/lib/auth/getDbUserFromSession';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET() {
  const user = await getDbUserFromSession();

  if (!user) {
    return unauthorized();
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          price: true,
          coverImage: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { id: 'asc' },
  });

  const items = cartItems.map((item) => ({
    id: item.bookId,
    title: item.book.title,
    author: item.book.author?.name ?? undefined,
    price: Number(item.book.price),
    cover_image: item.book.coverImage ?? undefined,
    quantity: item.quantity,
  }));

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const user = await getDbUserFromSession();

  if (!user) {
    return unauthorized();
  }

  const body = (await request.json().catch(() => null)) as { bookId?: number; quantity?: number } | null;
  const bookId = Number(body?.bookId);
  const quantity = Math.max(1, Number(body?.quantity ?? 1));

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return NextResponse.json({ error: 'Invalid bookId' }, { status: 400 });
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true },
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
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId: user.id,
        bookId,
        quantity,
      },
    });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE() {
  const user = await getDbUserFromSession();

  if (!user) {
    return unauthorized();
  }

  await prisma.cartItem.deleteMany({
    where: { userId: user.id },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
