import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiErrorResponse } from '@/lib/api/types';
import { requireUserFlowAccessForApi } from '@/lib/auth/flow';
import { withApiSecurity } from '@/lib/security/api-guard';

async function deleteOrder(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireUserFlowAccessForApi();
  if (!access.ok) {
    return access.response;
  }

  if (!access.user) {
    const response: ApiErrorResponse = { error: 'User not found' };
    return NextResponse.json(response, { status: 404 });
  }

  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    const response: ApiErrorResponse = { error: 'Invalid order ID' };
    return NextResponse.json(response, { status: 400 });
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: access.user.id,
      },
      select: {
        id: true,
        status: true,
        orderItems: {
          select: {
            bookId: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      const response: ApiErrorResponse = { error: 'Order not found' };
      return NextResponse.json(response, { status: 404 });
    }

    // Only allow cancellation of PAID orders
    if (order.status !== 'PAID') {
      const response: ApiErrorResponse = {
        error: 'Order cannot be cancelled',
        code: 'order_not_cancellable',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Update order status to CANCELLED and restore book stock in a transaction
    await prisma.$transaction(async (tx) => {
      // Restore stock for all books in this order
      for (const item of order.orderItems) {
        await tx.book.update({
          where: { id: item.bookId },
          data: {
            stock: { increment: item.quantity },
          },
        });
      }

      // Mark order as cancelled
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });
    });

    return NextResponse.json(
      { ok: true, message: 'Order cancelled successfully' },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Order cancellation failed';
    console.error('[orders.delete] error:', { orderId, userId: access.user.id, error: message });
    const response: ApiErrorResponse = { error: 'Failed to cancel order' };
    return NextResponse.json(response, { status: 500 });
  }
}

export const DELETE = withApiSecurity(deleteOrder, {
  bucket: 'api',
  requireCaptcha: false,
});
