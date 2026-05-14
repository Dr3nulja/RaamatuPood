import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRoute } from '@/lib/admin/guard';
import { prisma } from '@/lib/prisma';
import { withApiSecurity } from '@/lib/security/api-guard';

export const runtime = 'nodejs';

async function postUpload(request: NextRequest) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const form = await request.formData();
  const file = form.get('file');

  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File is too large (max 10MB)' }, { status: 400 });
  }

  try {
    const data = Buffer.from(await file.arrayBuffer());
    const uploaded = await prisma.pendingBookCoverUpload.create({
      data: {
        imageData: data,
        mimeType: file.type || 'application/octet-stream',
      },
    });

    return NextResponse.json({ url: `db-upload:${uploaded.id}` }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = withApiSecurity(postUpload, {
  bucket: 'api',
  maxBodyBytes: 12 * 1024 * 1024,
  requireCaptcha: false,
});
