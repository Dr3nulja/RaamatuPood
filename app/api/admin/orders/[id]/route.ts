import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoute } from '@/lib/admin/guard';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';

const adminPatchOrderSchema = strictObject({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
});

export const runtime = 'nodejs';

const statusMap = {
  pending: 'PENDING',
  paid: 'PAID',
  shipped: 'SHIPPED',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
} as const;

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function patchAdminOrder(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { status?: keyof typeof statusMap } | null;
  const nextStatusRaw = body?.status;

  if (!nextStatusRaw || !(nextStatusRaw in statusMap)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const nextStatus = statusMap[nextStatusRaw];

  await prisma.order.update({
    where: { id },
    data: {
      status: nextStatus,
    },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

export const PATCH = withApiSecurity(patchAdminOrder, {
  bucket: 'api',
  maxBodyBytes: 8 * 1024,
  schemaByMethod: {
    PATCH: adminPatchOrderSchema,
  },
  requireCaptcha: false,
});
