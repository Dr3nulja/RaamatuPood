import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoute } from '@/lib/admin/guard';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';

const adminPatchBookSchema = strictObject({
  title: z.string().min(1).max(300).optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  description: z.string().max(5000).nullable().optional(),
  author_id: z.union([z.number().int().positive(), z.string()]).nullable().optional(),
  author_ids: z.union([z.array(z.union([z.number().int().positive(), z.string()])), z.string()]).nullable().optional(),
  category_id: z.union([z.number().int().positive(), z.string()]).nullable().optional(),
  cover_image: z.string().max(1000).nullable().optional(),
}).passthrough();

export const runtime = 'nodejs';

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

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

async function patchAdminBook(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const data: {
    title?: string;
    price?: number;
    stock?: number;
    description?: string | null;
    categoryId?: number | null;
    coverImage?: string | null;
  } = {};
  let authorIdsToSet: number[] | undefined;

  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const titleValue = form.get('title');
    const priceValue = form.get('price');
    const stockValue = form.get('stock');
    const descriptionValue = form.get('description');
    const authorIdValues = [...form.getAll('author_ids'), form.get('author_id')];
    const categoryIdValue = form.get('category_id');
    const coverImageValue = form.get('cover_image');
    const coverFile = form.get('cover');

    if (titleValue !== null) {
      const title = String(titleValue).trim();
      if (!title) {
        return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
      }
      data.title = title;
    }

    if (priceValue !== null) {
      const price = Number(priceValue);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
      }
      data.price = price;
    }

    if (stockValue !== null) {
      const stock = Number(stockValue);
      if (!Number.isInteger(stock) || stock < 0) {
        return NextResponse.json({ error: 'Invalid stock' }, { status: 400 });
      }
      data.stock = stock;
    }

    if (descriptionValue !== null) {
      const normalized = String(descriptionValue).trim();
      data.description = normalized || null;
    }

    if (coverImageValue !== null) {
      const normalized = String(coverImageValue).trim();
      data.coverImage = normalized || null;
    }

    if (coverFile instanceof File && coverFile.size > 0) {
      data.coverImage = await saveCoverFile(coverFile);
    }

    if (authorIdValues.some((value) => value !== null && value !== undefined)) {
      const parsed = parseAuthorIds(authorIdValues);
      if (!parsed) {
        return NextResponse.json({ error: 'Invalid author_id' }, { status: 400 });
      }
      authorIdsToSet = parsed;
    }

    if (categoryIdValue !== null) {
      const parsed = parseNullableInt(categoryIdValue);
      if (Number.isNaN(parsed)) {
        return NextResponse.json({ error: 'Invalid category_id' }, { status: 400 });
      }
      data.categoryId = parsed;
    }
  } else {
    const body = (await request.json().catch(() => null)) as {
      title?: string;
      price?: number;
      stock?: number;
      description?: string | null;
      author_id?: number | string | null;
      author_ids?: Array<number | string> | string | null;
      category_id?: number | string | null;
      cover_image?: string | null;
    } | null;

    if (body?.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) {
        return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
      }
      data.title = title;
    }

    if (body?.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
      }
      data.price = price;
    }

    if (body?.stock !== undefined) {
      const stock = Number(body.stock);
      if (!Number.isInteger(stock) || stock < 0) {
        return NextResponse.json({ error: 'Invalid stock' }, { status: 400 });
      }
      data.stock = stock;
    }

    if (body?.description !== undefined) {
      data.description = body.description ? String(body.description).trim() : null;
    }

    if (body?.cover_image !== undefined) {
      data.coverImage = body.cover_image ? String(body.cover_image).trim() : null;
    }

    if (body?.author_id !== undefined) {
      const parsed = parseAuthorIds([body.author_id]);
      if (!parsed) {
        return NextResponse.json({ error: 'Invalid author_id' }, { status: 400 });
      }
      authorIdsToSet = parsed;
    }

    if (body?.author_ids !== undefined) {
      const parsed = parseAuthorIds(Array.isArray(body.author_ids) ? body.author_ids : [body.author_ids]);
      if (!parsed) {
        return NextResponse.json({ error: 'Invalid author_ids' }, { status: 400 });
      }
      authorIdsToSet = parsed;
    }

    if (body?.category_id !== undefined) {
      if (body.category_id === null || body.category_id === '') {
        data.categoryId = null;
      } else {
        const categoryId = Number(body.category_id);
        if (!Number.isInteger(categoryId) || categoryId <= 0) {
          return NextResponse.json({ error: 'Invalid category_id' }, { status: 400 });
        }
        data.categoryId = categoryId;
      }
    }
  }

  if (data.categoryId !== undefined && data.categoryId !== null) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });

    if (!categoryExists) {
      return NextResponse.json({ error: 'Invalid category_id' }, { status: 400 });
    }
  }

  if (authorIdsToSet) {
    const authorCount = await prisma.author.count({
      where: { id: { in: authorIdsToSet } },
    });

    if (authorCount !== authorIdsToSet.length) {
      return NextResponse.json({ error: 'One or more author_ids are invalid' }, { status: 400 });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.book.update({
      where: { id },
      data,
    });

    if (authorIdsToSet) {
      await tx.bookAuthor.deleteMany({ where: { bookId: id } });

      if (authorIdsToSet.length > 0) {
        await tx.bookAuthor.createMany({
          data: authorIdsToSet.map((authorId) => ({
            bookId: id,
            authorId,
          })),
        });
      }
    }
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

async function deleteAdminBook(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unable to delete book' }, { status: 400 });
  }
}

export const PATCH = withApiSecurity(patchAdminBook, {
  bucket: 'api',
  maxBodyBytes: 2 * 1024 * 1024,
  schemaByMethod: {
    PATCH: adminPatchBookSchema,
  },
  requireCaptcha: false,
});

export const DELETE = withApiSecurity(deleteAdminBook, {
  bucket: 'api',
  requireCaptcha: false,
});
