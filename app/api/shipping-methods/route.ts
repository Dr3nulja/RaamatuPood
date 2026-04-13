import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserFromSession } from '@/lib/auth/getDbUserFromSession';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';

const shippingMethodSchema = strictObject({
  name: z.string().min(1).max(120),
  price: z.number().min(0).max(10000),
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

async function getShippingMethods() {
  const methods = await prisma.shippingMethod.findMany({
    orderBy: { id: 'asc' },
  });

  return NextResponse.json({
    shippingMethods: methods.map((method) => ({
      id: method.id,
      name: method.name,
      price: method.price === null ? null : Number(method.price),
    })),
  });
}

async function createShippingMethod(request: NextRequest) {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.ok) {
    return NextResponse.json({ error: adminCheck.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: adminCheck.status });
  }

  const body = (await request.json().catch(() => null)) as { name?: string; price?: number } | null;
  const name = String(body?.name ?? '').trim();
  const price = Number(body?.price);

  if (!name || !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const existing = await prisma.shippingMethod.findFirst({
    where: { name },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ error: 'Shipping method already exists' }, { status: 409 });
  }

  const created = await prisma.shippingMethod.create({
    data: {
      name,
      price,
    },
  });

  return NextResponse.json({
    shippingMethod: {
      id: created.id,
      name: created.name,
      price: created.price === null ? null : Number(created.price),
    },
  }, { status: 201 });
}

export const GET = withApiSecurity(getShippingMethods, {
  bucket: 'api',
});

export const POST = withApiSecurity(createShippingMethod, {
  bucket: 'api',
  maxBodyBytes: 8 * 1024,
  schemaByMethod: {
    POST: shippingMethodSchema,
  },
  requireCaptcha: false,
});
