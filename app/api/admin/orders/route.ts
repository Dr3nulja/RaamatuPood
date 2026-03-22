import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoute } from '@/lib/admin/guard';
import type { AdminOrdersResponse } from '@/lib/api/adminTypes';

export const runtime = 'nodejs';

export async function GET() {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          email: true,
        },
      },
      orderItems: {
        include: {
          book: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const response: AdminOrdersResponse = {
    orders: orders.map((order) => ({
      id: order.id,
      user_email: order.user?.email || 'unknown',
      total_price: Number(order.totalPrice ?? 0),
      status: order.status.toLowerCase() as 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled',
      created_at: order.createdAt.toISOString(),
      items: order.orderItems.map((item) => ({
        id: item.id,
        book_id: item.bookId,
        title: item.book?.title || 'Книга',
        quantity: item.quantity ?? 0,
        price: Number(item.price ?? 0),
      })),
    })),
  };

  return NextResponse.json(response, { status: 200 });
}
