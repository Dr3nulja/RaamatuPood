import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiSecurity } from '@/lib/security/api-guard';

export const runtime = 'nodejs';

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function getBookImage(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const book = await prisma.book.findUnique({
    where: { id },
    select: {
      coverImageData: true,
      coverImageMimeType: true,
    },
  });

  if (!book?.coverImageData || book.coverImageData.length === 0) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  const mimeType = book.coverImageMimeType || 'application/octet-stream';

  return new NextResponse(Buffer.from(book.coverImageData), {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export const GET = withApiSecurity(getBookImage, {
  bucket: 'api',
  requireCaptcha: false,
});