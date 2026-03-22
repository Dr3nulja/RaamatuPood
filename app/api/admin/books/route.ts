import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoute } from '@/lib/admin/guard';
import type { AdminBooksResponse } from '@/lib/api/adminTypes';

export const runtime = 'nodejs';

export async function GET() {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const books = await prisma.book.findMany({
    include: {
      author: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
    orderBy: { id: 'desc' },
  });

  const response: AdminBooksResponse = {
    books: books.map((book) => ({
      id: book.id,
      title: book.title,
      price: Number(book.price),
      stock: book.stock,
      description: book.description,
      cover_image: book.coverImage,
      author_id: book.authorId,
      category_id: book.categoryId,
      author_name: book.author?.name ?? null,
      category_name: book.category?.name ?? null,
    })),
  };

  return NextResponse.json(response, { status: 200 });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const body = (await request.json().catch(() => null)) as {
    title?: string;
    price?: number;
    stock?: number;
    description?: string | null;
    author_id?: number | string | null;
    category_id?: number | string | null;
    cover_image?: string | null;
  } | null;

  const title = String(body?.title || '').trim();
  const price = Number(body?.price);
  const stock = Number(body?.stock);
  const description = body?.description ? String(body.description).trim() : null;
  const coverImage = body?.cover_image ? String(body.cover_image).trim() : null;

  const authorIdRaw = body?.author_id;
  const categoryIdRaw = body?.category_id;

  const authorId = authorIdRaw === null || authorIdRaw === undefined || authorIdRaw === ''
    ? null
    : Number(authorIdRaw);

  const categoryId = categoryIdRaw === null || categoryIdRaw === undefined || categoryIdRaw === ''
    ? null
    : Number(categoryIdRaw);

  if (!title || !Number.isFinite(price) || !Number.isInteger(stock) || stock < 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (authorId !== null && (!Number.isInteger(authorId) || authorId <= 0)) {
    return NextResponse.json({ error: 'Invalid author_id' }, { status: 400 });
  }

  if (categoryId !== null && (!Number.isInteger(categoryId) || categoryId <= 0)) {
    return NextResponse.json({ error: 'Invalid category_id' }, { status: 400 });
  }

  const created = await prisma.book.create({
    data: {
      title,
      price,
      stock,
      description,
      coverImage,
      authorId,
      categoryId,
    },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
