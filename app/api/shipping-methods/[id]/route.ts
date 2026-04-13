import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserFromSession } from '@/lib/auth/getDbUserFromSession';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';

const shippingMethodPatchSchema = strictObject({
  name: z.string().min(1).max(120).optional(),
  price: z.number().min(0).max(10000).optional(),
});

async function ensureAdmin() {
  const user = await getDbUserFromSession();
  if (!user) {
    return { ok: false as const, status: 401 };
  }

  if (user.role !== 'ADMIN') {
    return { ok: false as const, status: 403 };
  }

  return { ok: true as const };
}

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function patchShippingMethod(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.ok) {
    return NextResponse.json({ error: adminCheck.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: adminCheck.status });
  }

  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { name?: string; price?: number } | null;
  const nextName = body?.name === undefined ? undefined : String(body.name).trim();
  const nextPrice = body?.price === undefined ? undefined : Number(body.price);

  if (nextName !== undefined && !nextName) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  }

  if (nextPrice !== undefined && (!Number.isFinite(nextPrice) || nextPrice < 0)) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }

  const updated = await prisma.shippingMethod.update({
    where: { id },
    data: {
      ...(nextName !== undefined ? { name: nextName } : {}),
      ...(nextPrice !== undefined ? { price: nextPrice } : {}),
    },
  });

  return NextResponse.json({
    shippingMethod: {
      id: updated.id,
      name: updated.name,
      price: updated.price === null ? null : Number(updated.price),
    },
  });
}

async function deleteShippingMethod(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.ok) {
    return NextResponse.json({ error: adminCheck.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: adminCheck.status });
  }

  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  await prisma.shippingMethod.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export const PATCH = withApiSecurity(patchShippingMethod, {
  bucket: 'api',
  maxBodyBytes: 8 * 1024,
  schemaByMethod: {
    PATCH: shippingMethodPatchSchema,
  },
  requireCaptcha: false,
});

export const DELETE = withApiSecurity(deleteShippingMethod, {
  bucket: 'api',
});
