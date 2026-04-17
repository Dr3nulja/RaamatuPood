import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoute } from '@/lib/admin/guard';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';

const createAuthorSchema = strictObject({
  name: z.string().min(1).max(180),
});

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

async function getAuthors() {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const authors = await prisma.author.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ authors }, { status: 200 });
}

async function createAuthor(request: NextRequest) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const body = (await request.json().catch(() => null)) as { name?: string } | null;
  const name = normalizeName(String(body?.name || ''));

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const existing = await prisma.author.findFirst({
    where: { name: { equals: name } },
    select: { id: true, name: true },
  });

  if (existing) {
    return NextResponse.json({ author: existing, created: false }, { status: 200 });
  }

  const author = await prisma.author.create({
    data: { name },
    select: { id: true, name: true },
  });

  return NextResponse.json({ author, created: true }, { status: 201 });
}

export const GET = withApiSecurity(getAuthors, {
  bucket: 'api',
  requireCaptcha: false,
});

export const POST = withApiSecurity(createAuthor, {
  bucket: 'api',
  maxBodyBytes: 8 * 1024,
  requireCaptcha: false,
  schemaByMethod: {
    POST: createAuthorSchema,
  },
});
