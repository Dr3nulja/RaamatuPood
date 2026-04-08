import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserFromSession } from '@/lib/auth/getDbUserFromSession';
import type { ApiErrorResponse, CartResponse } from '@/lib/api/types';

function unauthorized() {
  const response: ApiErrorResponse = { error: 'Unauthorized' };
  return NextResponse.json(response, { status: 401 });
}

export async function GET() {
  const user = await getDbUserFromSession();

  if (!user) {
    return unauthorized();
  }

<<<<<<< HEAD
  // Authenticated cart is always loaded from cart_items by user_id.
=======
>>>>>>> origin/main
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
}

export async function PATCH(request: NextRequest) {
  const user = await getDbUserFromSession();

  if (!user) {
    return unauthorized();
  }

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
