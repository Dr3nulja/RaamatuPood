import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdminRoute } from '@/lib/admin/guard';
import type { AdminBooksResponse } from '@/lib/api/adminTypes';
import { buildBookCoverImageSrc, parsePendingBookCoverUploadId } from '@/lib/books/cover';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';

const adminCreateBookSchema = strictObject({
  title: z.string().min(1).max(300),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  description: z.string().max(5000).nullable().optional(),
  language_id: z.union([z.number().int().positive(), z.string()]).optional(),
  publication_year: z.union([z.number().int().min(1000).max(9999), z.string()]).optional(),
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
  languageId: number;
  publicationYear: number;
  authorIds: number[];
  categoryId: number | null;
  coverImage: string | null;
  coverFile: File | null;
};

async function syncBookCategoryLink(
  tx: Prisma.TransactionClient,
  bookId: number,
  categoryId: number | null
) {
  await tx.bookCategory.deleteMany({ where: { bookId } });

  if (categoryId !== null) {
    await tx.bookCategory.create({
      data: {
        bookId,
        categoryId,
      },
    });
  }
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
    const languageIdRaw = form.get('language_id');
    const languageId = languageIdRaw ? Number(languageIdRaw) : 0;
    const publicationYearRaw = form.get('publication_year');
    const publicationYear = publicationYearRaw 
      ? Number(publicationYearRaw) 
      : 1900;
    const authorIds = parseAuthorIds([...form.getAll('author_ids'), form.get('author_id')]);
    const categoryId = parseNullableInt(form.get('category_id'));
    const coverField = form.get('cover');
    const uploadedCoverUrl = String(form.get('uploaded_cover_url') || '').trim();
    const coverUrlRaw = String(form.get('cover_image') || '').trim();

    if (!title || !Number.isFinite(price) || !Number.isInteger(stock) || stock < 0) {
      return null;
    }

    if (!authorIds || Number.isNaN(categoryId) || !Number.isInteger(languageId) || languageId <= 0) {
      return null;
    }

    if (!Number.isInteger(publicationYear) || publicationYear < 1000 || publicationYear > 9999) {
      return null;
    }

    return {
      title,
      price,
      stock,
      description: descriptionRaw || null,
      languageId,
      publicationYear,
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
    language_id?: number | string;
    publication_year?: number | string;
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
  const languageId = body?.language_id ? Number(body.language_id) : 0;
  const publicationYear = body?.publication_year 
    ? Number(body.publication_year) 
    : 1900;
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

  if (!authorIds || Number.isNaN(categoryId) || !Number.isInteger(languageId) || languageId <= 0) {
    return null;
  }

  if (!Number.isInteger(publicationYear) || publicationYear < 1000 || publicationYear > 9999) {
    return null;
  }

  return {
    title,
    price,
    stock,
    description,
    languageId,
    publicationYear,
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

  const [books, authors, categories, languages] = await Promise.all([
    prisma.book.findMany({
      include: {
        bookAuthors: {
          orderBy: { authorId: 'asc' },
          include: {
            author: { select: { id: true, name: true } },
          },
        },
        bookCategories: {
          orderBy: { id: 'asc' },
          include: {
            category: { select: { id: true, name: true } },
          },
        },
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
    prisma.language.findMany({
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
      language: book.language,
      publication_year: book.publicationYear,
      cover_image: buildBookCoverImageSrc(book.id, book.coverImage, book.coverImageData),
      author_id: book.bookAuthors[0]?.authorId ?? null,
      author_ids: book.bookAuthors.map((link) => link.authorId),
      category_id: book.bookCategories[0]?.categoryId ?? null,
      author_name: book.bookAuthors[0]?.author?.name ?? null,
      author_names: book.bookAuthors.map((link) => link.author.name),
      category_name: book.bookCategories[0]?.category?.name ?? null,
    })),
    authors,
    categories,
    languages,
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

  // Validate language_id
  const language = await prisma.language.findUnique({
    where: { id: payload.languageId },
    select: { name: true },
  });

  if (!language) {
    return NextResponse.json({ error: 'Invalid language_id' }, { status: 400 });
  }

  const uploadedToken = parsePendingBookCoverUploadId(payload.coverImage);
  let coverImage = uploadedToken ? null : payload.coverImage;
  let coverImageData: Buffer | null = null;
  let coverImageMimeType: string | null = null;

  if (uploadedToken) {
    const pendingUpload = await prisma.pendingBookCoverUpload.findUnique({
      where: { id: uploadedToken },
    });

    if (!pendingUpload) {
      return NextResponse.json({ error: 'Uploaded cover was not found' }, { status: 400 });
    }

    coverImage = null;
    coverImageData = Buffer.from(pendingUpload.imageData);
    coverImageMimeType = pendingUpload.mimeType;
  } else if (payload.coverFile) {
    coverImage = null;
    coverImageData = Buffer.from(await payload.coverFile.arrayBuffer());
    coverImageMimeType = payload.coverFile.type || 'application/octet-stream';
  }

  const created = await prisma.$transaction(async (tx) => {
    const book = await tx.book.create({
      data: {
        title: payload.title,
        price: payload.price,
        stock: payload.stock,
        description: payload.description,
        language: language.name,
        publicationYear: payload.publicationYear,
        coverImage,
        coverImageData,
        coverImageMimeType,
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

    await syncBookCategoryLink(tx, book.id, payload.categoryId);

    if (uploadedToken) {
      await tx.pendingBookCoverUpload.delete({ where: { id: uploadedToken } });
    }

    return book;
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
