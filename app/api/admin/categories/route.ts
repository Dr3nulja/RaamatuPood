import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoute } from '@/lib/admin/guard';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';

const createCategorySchema = strictObject({
  name: z.string().min(1).max(180),
});

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

async function getCategories() {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ categories }, { status: 200 });
}

async function createCategory(request: NextRequest) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const body = (await request.json().catch(() => null)) as { name?: string } | null;
  const name = normalizeName(String(body?.name || ''));

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const existing = await prisma.category.findFirst({
    where: { name: { equals: name } },
    select: { id: true, name: true },
  });

  if (existing) {
    return NextResponse.json({ category: existing, created: false }, { status: 200 });
  }

  const category = await prisma.category.create({
    data: { name },
    select: { id: true, name: true },
  });

  return NextResponse.json({ category, created: true }, { status: 201 });
}

export const GET = withApiSecurity(getCategories, {
  bucket: 'api',
  requireCaptcha: false,
});

export const POST = withApiSecurity(createCategory, {
  bucket: 'api',
  maxBodyBytes: 8 * 1024,
  requireCaptcha: false,
  schemaByMethod: {
    POST: createCategorySchema,
  },
});
