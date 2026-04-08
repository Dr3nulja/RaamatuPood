import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import type { ApiErrorResponse, OrdersHistoryResponse } from '@/lib/api/types';

export async function GET() {
  const session = await auth0.getSession();

  if (!session?.user?.sub) {
    const response: ApiErrorResponse = { error: 'Unauthorized' };
    return NextResponse.json(response, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { auth0Id: session.user.sub },
    select: { id: true },
  });

  if (!user) {
    const response: ApiErrorResponse = { error: 'User not found' };
    return NextResponse.json(response, { status: 404 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      address: true,
      shippingMethod: true,
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
  });

  const response: OrdersHistoryResponse = {
    orders: orders.map((order) => ({
      id: order.id,
      total_price: Number(order.totalPrice ?? 0),
      status: order.status,
      stripe_payment_id: order.stripePaymentId,
      created_at: order.createdAt.toISOString(),
      address: order.address
        ? {
            id: order.address.id,
            country: order.address.country,
            city: order.address.city,
            street: order.address.street,
            postal_code: order.address.postalCode,
          }
        : null,
      shipping_method: order.shippingMethod
        ? {
            id: order.shippingMethod.id,
            name: order.shippingMethod.name,
            price: order.shippingMethod.price === null ? null : Number(order.shippingMethod.price),
          }
        : null,
      order_items: order.orderItems.map((item) => ({
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
