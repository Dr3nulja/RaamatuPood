import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoute } from '@/lib/admin/guard';
import { uploadImageToStorage } from '@/lib/storage/upload';
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
  uploaded_cover_url: z.string().max(1000).nullable().optional(),
}).passthrough();

export const runtime = 'nodejs';

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
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

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

type PatchPayload = {
  data: {
    title?: string;
    price?: number;
    stock?: number;
    description?: string | null;
    categoryId?: number | null;
    coverImage?: string | null;
  };
  authorIdsToSet?: number[];
  coverFile?: File | null;
};

async function parsePatchPayload(request: NextRequest): Promise<PatchPayload | null> {
  const data: PatchPayload['data'] = {};
  let authorIdsToSet: number[] | undefined;
  let coverFile: File | null = null;

  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const titleValue = form.get('title');
    const priceValue = form.get('price');
    const stockValue = form.get('stock');
    const descriptionValue = form.get('description');
    const authorIdValues = [...form.getAll('author_ids'), form.get('author_id')];
    const categoryIdValue = form.get('category_id');
    const uploadedCoverUrl = String(form.get('uploaded_cover_url') || '').trim();
    const coverImageValue = form.get('cover_image');
    const maybeCoverFile = form.get('cover');

    if (titleValue !== null) {
      const title = String(titleValue).trim();
      if (!title) {
        return null;
      }
      data.title = title;
    }

    if (priceValue !== null) {
      const price = Number(priceValue);
      if (!Number.isFinite(price) || price < 0) {
        return null;
      }
      data.price = price;
    }

    if (stockValue !== null) {
      const stock = Number(stockValue);
      if (!Number.isInteger(stock) || stock < 0) {
        return null;
      }
      data.stock = stock;
    }

    if (descriptionValue !== null) {
      const normalized = String(descriptionValue).trim();
      data.description = normalized || null;
    }

    const manualCover = coverImageValue !== null ? String(coverImageValue).trim() : '';
    if (uploadedCoverUrl || manualCover) {
      data.coverImage = uploadedCoverUrl || manualCover || null;
    }

    if (maybeCoverFile instanceof File && maybeCoverFile.size > 0) {
      coverFile = maybeCoverFile;
    }

    if (authorIdValues.some((value) => value !== null && value !== undefined)) {
      const parsed = parseAuthorIds(authorIdValues);
      if (!parsed) {
        return null;
      }
      authorIdsToSet = parsed;
    }

    if (categoryIdValue !== null) {
      const parsed = parseNullableInt(categoryIdValue);
      if (Number.isNaN(parsed)) {
        return null;
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
      uploaded_cover_url?: string | null;
    } | null;

    if (body?.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) {
        return null;
      }
      data.title = title;
    }

    if (body?.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return null;
      }
      data.price = price;
    }

    if (body?.stock !== undefined) {
      const stock = Number(body.stock);
      if (!Number.isInteger(stock) || stock < 0) {
        return null;
      }
      data.stock = stock;
    }

    if (body?.description !== undefined) {
      data.description = body.description ? String(body.description).trim() : null;
    }

    if (body?.cover_image !== undefined || body?.uploaded_cover_url !== undefined) {
      const cover =
        (body?.uploaded_cover_url ? String(body.uploaded_cover_url).trim() : '')
        || (body?.cover_image ? String(body.cover_image).trim() : '');
      data.coverImage = cover || null;
    }

    if (body?.author_id !== undefined) {
      const parsed = parseAuthorIds([body.author_id]);
      if (!parsed) {
        return null;
      }
      authorIdsToSet = parsed;
    }

    if (body?.author_ids !== undefined) {
      const parsed = parseAuthorIds(Array.isArray(body.author_ids) ? body.author_ids : [body.author_ids]);
      if (!parsed) {
        return null;
      }
      authorIdsToSet = parsed;
    }

    if (body?.category_id !== undefined) {
      if (body.category_id === null || body.category_id === '') {
        data.categoryId = null;
      } else {
        const categoryId = Number(body.category_id);
        if (!Number.isInteger(categoryId) || categoryId <= 0) {
          return null;
        }
        data.categoryId = categoryId;
      }
    }
  }

  return {
    data,
    authorIdsToSet,
    coverFile,
  };
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

  const payload = await parsePatchPayload(request);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (payload.coverFile) {
    const uploaded = await uploadImageToStorage(payload.coverFile);
    payload.data.coverImage = uploaded.url;
  }

  if (payload.data.categoryId !== undefined && payload.data.categoryId !== null) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: payload.data.categoryId },
      select: { id: true },
    });

    if (!categoryExists) {
      return NextResponse.json({ error: 'Invalid category_id' }, { status: 400 });
    }
  }

  if (payload.authorIdsToSet && payload.authorIdsToSet.length > 0) {
    const authorCount = await prisma.author.count({
      where: { id: { in: payload.authorIdsToSet } },
    });

    if (authorCount !== payload.authorIdsToSet.length) {
      return NextResponse.json({ error: 'One or more author_ids are invalid' }, { status: 400 });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.book.update({
      where: { id },
      data: payload.data,
    });

    if (payload.authorIdsToSet !== undefined) {
      await tx.bookAuthor.deleteMany({ where: { bookId: id } });

      if (payload.authorIdsToSet.length > 0) {
        await tx.bookAuthor.createMany({
          data: payload.authorIdsToSet.map((authorId) => ({
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
  maxBodyBytes: 12 * 1024 * 1024,
  schemaByMethod: {
    PATCH: adminPatchBookSchema,
  },
  requireCaptcha: false,
});

export const DELETE = withApiSecurity(deleteAdminBook, {
  bucket: 'api',
  requireCaptcha: false,
});
