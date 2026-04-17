import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoute } from '@/lib/admin/guard';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';

const updateCategorySchema = strictObject({
  name: z.string().min(1).max(180),
});

function parseId(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

async function patchCategory(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) {
    return NextResponse.json({ error: 'Invalid category id' }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { name?: string } | null;
  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const name = normalizeName(parsed.data.name);
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: { id },
    data: { name },
    select: { id: true, name: true },
  });

  return NextResponse.json({ category }, { status: 200 });
}

async function deleteCategory(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) {
    return NextResponse.json({ error: 'Invalid category id' }, { status: 400 });
  }

  const usageCount = await prisma.book.count({ where: { categoryId: id } });
  if (usageCount > 0) {
    return NextResponse.json(
      { error: 'Cannot delete category because it is used by books. Reassign books first.' },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}

export const PATCH = withApiSecurity(patchCategory, {
  bucket: 'api',
  maxBodyBytes: 8 * 1024,
  requireCaptcha: false,
  schemaByMethod: { PATCH: updateCategorySchema },
});

export const DELETE = withApiSecurity(deleteCategory, {
  bucket: 'api',
  requireCaptcha: false,
});