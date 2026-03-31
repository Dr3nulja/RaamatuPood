import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoute } from '@/lib/admin/guard';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    authorId?: number | null;
    categoryId?: number | null;
    coverImage?: string | null;
  } = {};

  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const titleValue = form.get('title');
    const priceValue = form.get('price');
    const stockValue = form.get('stock');
    const descriptionValue = form.get('description');
    const authorIdValue = form.get('author_id');
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

    if (authorIdValue !== null) {
      const parsed = parseNullableInt(authorIdValue);
      if (Number.isNaN(parsed)) {
        return NextResponse.json({ error: 'Invalid author_id' }, { status: 400 });
      }
      data.authorId = parsed;
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
      if (body.author_id === null || body.author_id === '') {
        data.authorId = null;
      } else {
        const authorId = Number(body.author_id);
        if (!Number.isInteger(authorId) || authorId <= 0) {
          return NextResponse.json({ error: 'Invalid author_id' }, { status: 400 });
        }
        data.authorId = authorId;
      }
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

  await prisma.book.update({
    where: { id },
    data,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
