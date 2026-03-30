import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoute } from '@/lib/admin/guard';
import type { AdminBooksResponse } from '@/lib/api/adminTypes';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';

type BookPayload = {
  title: string;
  price: number;
  stock: number;
  description: string | null;
  authorId: number | null;
  categoryId: number | null;
  coverImage: string | null;
};

async function saveCoverFile(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const extension = extname(file.name || '').toLowerCase();
  const safeExtension = extension && extension.length <= 8 ? extension : '.jpg';
  const filename = `${Date.now()}-${randomUUID()}${safeExtension}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'books');

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), buffer);

  return `/uploads/books/${filename}`;
}

function parseNullableInt(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return NaN;
  }

  return parsed;
}

async function normalizePayload(request: NextRequest): Promise<BookPayload | null> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const title = String(form.get('title') || '').trim();
    const price = Number(form.get('price'));
    const stock = Number(form.get('stock'));
    const descriptionRaw = String(form.get('description') || '').trim();
    const authorId = parseNullableInt(form.get('author_id'));
    const categoryId = parseNullableInt(form.get('category_id'));
    const coverField = form.get('cover');
    const coverUrlRaw = String(form.get('cover_image') || '').trim();

    if (!title || !Number.isFinite(price) || !Number.isInteger(stock) || stock < 0) {
      return null;
    }

    if (Number.isNaN(authorId) || Number.isNaN(categoryId)) {
      return null;
    }

    let coverImage: string | null = coverUrlRaw || null;
    if (coverField instanceof File && coverField.size > 0) {
      coverImage = await saveCoverFile(coverField);
    }

    return {
      title,
      price,
      stock,
      description: descriptionRaw || null,
      authorId,
      categoryId,
      coverImage,
    };
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
  const authorId = parseNullableInt(body?.author_id);
  const categoryId = parseNullableInt(body?.category_id);

  if (!title || !Number.isFinite(price) || !Number.isInteger(stock) || stock < 0) {
    return null;
  }

  if (Number.isNaN(authorId) || Number.isNaN(categoryId)) {
    return null;
  }

  return {
    title,
    price,
    stock,
    description,
    authorId,
    categoryId,
    coverImage,
  };
}

export async function GET() {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const [books, authors, categories] = await Promise.all([
    prisma.book.findMany({
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { id: 'desc' },
    }),
    prisma.author.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

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
    authors,
    categories,
  };

  return NextResponse.json(response, { status: 200 });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const payload = await normalizePayload(request);

  if (!payload) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const created = await prisma.book.create({
    data: {
      title: payload.title,
      price: payload.price,
      stock: payload.stock,
      description: payload.description,
      coverImage: payload.coverImage,
      authorId: payload.authorId,
      categoryId: payload.categoryId,
    },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
