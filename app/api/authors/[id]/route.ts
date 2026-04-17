import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoute } from '@/lib/admin/guard';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';

const updateAuthorSchema = strictObject({
  name: z.string().min(1).max(180),
});

function parseId(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

async function patchAuthor(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) {
    return NextResponse.json({ error: 'Invalid author id' }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { name?: string } | null;
  const name = normalizeName(String(body?.name || ''));
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const author = await prisma.author.update({
    where: { id },
    data: { name },
    select: { id: true, name: true },
  });

  return NextResponse.json({ author }, { status: 200 });
}

async function deleteAuthor(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) {
    return NextResponse.json({ error: 'Invalid author id' }, { status: 400 });
  }

  const usageCount = await prisma.bookAuthor.count({ where: { authorId: id } });
  if (usageCount > 0) {
    return NextResponse.json(
      { error: 'Cannot delete author because it is used by books. Remove book links first.' },
      { status: 409 }
    );
  }

  await prisma.author.delete({ where: { id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}

export const PATCH = withApiSecurity(patchAuthor, {
  bucket: 'api',
  maxBodyBytes: 8 * 1024,
  requireCaptcha: false,
  schemaByMethod: { PATCH: updateAuthorSchema },
});

export const DELETE = withApiSecurity(deleteAuthor, {
  bucket: 'api',
  requireCaptcha: false,
});