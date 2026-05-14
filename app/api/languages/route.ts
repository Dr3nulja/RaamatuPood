import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoute } from '@/lib/admin/guard';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';

const languageSchema = strictObject({
  name: z.string().min(1).max(100),
}).passthrough();

export const runtime = 'nodejs';

async function getLanguages() {
  const languages = await prisma.language.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ languages }, { status: 200 });
}

async function createLanguage(request: NextRequest) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const body = (await request.json().catch(() => null)) as { name?: string } | null;

  if (!body?.name || typeof body.name !== 'string') {
    return NextResponse.json({ error: 'Language name is required' }, { status: 400 });
  }

  const name = body.name.trim();
  if (!name || name.length > 100) {
    return NextResponse.json({ error: 'Invalid language name' }, { status: 400 });
  }

  try {
    const language = await prisma.language.create({
      data: { name },
      select: { id: true, name: true },
    });

    return NextResponse.json({ language }, { status: 201 });
  } catch (error) {
    console.error('Language creation error:', error);
    return NextResponse.json({ error: 'Failed to create language' }, { status: 500 });
  }
}

export const GET = withApiSecurity(getLanguages, { bucket: 'api' });
export const POST = withApiSecurity(createLanguage, {
  bucket: 'api',
  schemaByMethod: {
    POST: languageSchema,
  },
  requireCaptcha: false,
});
