import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoute } from '@/lib/admin/guard';
import type { AdminBooksResponse } from '@/lib/api/adminTypes';
import { uploadImageToStorage } from '@/lib/storage/upload';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';

const adminCreateBookSchema = strictObject({
  title: z.string().min(1).max(300),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  description: z.string().max(5000).nullable().optional(),
  author_id: z.union([z.number().int().positive(), z.string()]).nullable().optional(),
  author_ids: z.union([z.array(z.union([z.number().int().positive(), z.string()])), z.string()]).nullable().optional(),
  category_id: z.union([z.number().int().positive(), z.string()]).nullable().optional(),
  cover_image: z.string().max(1000).nullable().optional(),
  uploaded_cover_url: z.string().max(1000).nullable().optional(),
}).passthrough();

export const runtime = 'nodejs';

type BookPayload = {
  title: string;
  price: number;
  stock: number;
  description: string | null;
  authorIds: number[];
  categoryId: number | null;
  coverImage: string | null;
  coverFile: File | null;
};

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

function parseAuthorIds(values: unknown[]): number[] | null {
  if (values.length === 0) {
    return [];
  }

  const result: number[] = [];

  for (const value of values) {
    if (value === null || value === undefined || value === '') {
      continue;
    }

    const chunks = String(value)
      .split(',')
      .map((chunk) => chunk.trim())
      .filter(Boolean);

    for (const chunk of chunks) {
      const parsed = Number(chunk);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
      }
      result.push(parsed);
    }
  }

  return [...new Set(result)];
}

async function normalizePayload(request: NextRequest): Promise<BookPayload | null> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const title = String(form.get('title') || '').trim();
    const price = Number(form.get('price'));
    const stock = Number(form.get('stock'));
    const descriptionRaw = String(form.get('description') || '').trim();
    const authorIds = parseAuthorIds([...form.getAll('author_ids'), form.get('author_id')]);
    const categoryId = parseNullableInt(form.get('category_id'));
    const coverField = form.get('cover');
    const uploadedCoverUrl = String(form.get('uploaded_cover_url') || '').trim();
    const coverUrlRaw = String(form.get('cover_image') || '').trim();

    if (!title || !Number.isFinite(price) || !Number.isInteger(stock) || stock < 0) {
      return null;
    }

    if (!authorIds || Number.isNaN(categoryId)) {
      return null;
    }

    return {
      title,
      price,
      stock,
      description: descriptionRaw || null,
      authorIds,
      categoryId,
      coverImage: uploadedCoverUrl || coverUrlRaw || null,
      coverFile: coverField instanceof File && coverField.size > 0 ? coverField : null,
    };
  }

  const body = (await request.json().catch(() => null)) as {
    title?: string;
    price?: number;
    stock?: number;
    description?: string | null;
    author_id?: number | string | null;
    author_ids?: Array<number | string> | string | null;
    category_id?: number | string | null;
    cover_image?: string | null;
    uploaded_cover_url?: string | null;
  } | null;

  const title = String(body?.title || '').trim();
  const price = Number(body?.price);
  const stock = Number(body?.stock);
  const description = body?.description ? String(body.description).trim() : null;
  const coverImage =
    (body?.uploaded_cover_url ? String(body.uploaded_cover_url).trim() : '')
    || (body?.cover_image ? String(body.cover_image).trim() : '')
    || null;
  const authorIds = parseAuthorIds(
    body?.author_ids !== undefined
      ? Array.isArray(body.author_ids)
        ? body.author_ids
        : [body.author_ids]
      : [body?.author_id]
  );
  const categoryId = parseNullableInt(body?.category_id);

  if (!title || !Number.isFinite(price) || !Number.isInteger(stock) || stock < 0) {
    return null;
  }

  if (!authorIds || Number.isNaN(categoryId)) {
    return null;
  }

  return {
    title,
    price,
    stock,
    description,
    authorIds,
    categoryId,
    coverImage,
    coverFile: null,
  };
}

async function getAdminBooks() {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const [books, authors, categories] = await Promise.all([
    prisma.book.findMany({
      include: {
        bookAuthors: {
          orderBy: { authorId: 'asc' },
          include: {
            author: { select: { id: true, name: true } },
          },
        },
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
      author_id: book.bookAuthors[0]?.authorId ?? null,
      author_ids: book.bookAuthors.map((link) => link.authorId),
      category_id: book.categoryId,
      author_name: book.bookAuthors[0]?.author?.name ?? null,
      author_names: book.bookAuthors.map((link) => link.author.name),
      category_name: book.category?.name ?? null,
    })),
    authors,
    categories,
  };

  return NextResponse.json(response, { status: 200 });
}

async function createAdminBook(request: NextRequest) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const payload = await normalizePayload(request);

  if (!payload) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (payload.authorIds.length > 0) {
    const authorCount = await prisma.author.count({
      where: { id: { in: payload.authorIds } },
    });

    if (authorCount !== payload.authorIds.length) {
      return NextResponse.json({ error: 'One or more author_ids are invalid' }, { status: 400 });
    }
  }

  if (payload.categoryId !== null) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: payload.categoryId },
      select: { id: true },
    });

    if (!categoryExists) {
      return NextResponse.json({ error: 'Invalid category_id' }, { status: 400 });
    }
  }

  let coverImageUrl = payload.coverImage;
  if (payload.coverFile) {
    const uploaded = await uploadImageToStorage(payload.coverFile);
    coverImageUrl = uploaded.url;
  }

  const created = await prisma.book.create({
    data: {
      title: payload.title,
      price: payload.price,
      stock: payload.stock,
      description: payload.description,
      coverImage: coverImageUrl,
      categoryId: payload.categoryId,
      ...(payload.authorIds.length > 0
        ? {
            bookAuthors: {
              create: payload.authorIds.map((authorId) => ({
                author: { connect: { id: authorId } },
              })),
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}

export const GET = withApiSecurity(getAdminBooks, {
  bucket: 'api',
});

export const POST = withApiSecurity(createAdminBook, {
  bucket: 'api',
  maxBodyBytes: 12 * 1024 * 1024,
  schemaByMethod: {
    POST: adminCreateBookSchema,
  },
  requireCaptcha: false,
});
