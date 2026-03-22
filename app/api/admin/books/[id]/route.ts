import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoute } from '@/lib/admin/guard';

export const runtime = 'nodejs';

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
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

  const body = (await request.json().catch(() => null)) as {
    title?: string;
    price?: number;
    stock?: number;
    description?: string | null;
    author_id?: number | string | null;
    category_id?: number | string | null;
    cover_image?: string | null;
  } | null;

  const data: {
    title?: string;
    price?: number;
    stock?: number;
    description?: string | null;
    authorId?: number | null;
    categoryId?: number | null;
    coverImage?: string | null;
  } = {};

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
