import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import type { ApiErrorResponse, OrdersHistoryResponse } from '@/lib/api/types';
import { getDbUserFromSession } from '@/lib/auth/getDbUserFromSession';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';
import { withPrismaProtection } from '@/lib/security/prisma';

const createOrderSchema = strictObject({
  shippingMethodId: z.number().int().positive().optional(),
  addressId: z.number().int().positive().optional(),
});

async function getOrders() {
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

  const orders = await withPrismaProtection(() => prisma.order.findMany({
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
  }));

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

async function createOrder(request: Request) {
  const user = await getDbUserFromSession();

  if (!user) {
    const response: ApiErrorResponse = { error: 'Unauthorized' };
    return NextResponse.json(response, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        shippingMethodId?: number;
        addressId?: number;
      }
    | null;

  const shippingMethodId = Number(body?.shippingMethodId);
  const addressId = Number(body?.addressId);

  const selectedAddress = Number.isInteger(addressId) && addressId > 0
    ? await prisma.address.findFirst({
        where: {
          id: addressId,
          userId: user.id,
        },
        select: { id: true },
      })
    : null;

  const selectedShippingMethod = Number.isInteger(shippingMethodId) && shippingMethodId > 0
    ? await prisma.shippingMethod.findUnique({
        where: { id: shippingMethodId },
        select: { id: true, price: true },
      })
    : null;

  // Purchase always reads the latest logged-in cart from cart_items in DB.
  const cartItems = await withPrismaProtection(() => prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          price: true,
          stock: true,
        },
      },
    },
  }));

  if (cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  for (const item of cartItems) {
    if (item.quantity > item.book.stock) {
      return NextResponse.json(
        { error: `Not enough stock for book ${item.book.id}` },
        { status: 400 }
      );
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.book.price) * item.quantity, 0);
  const shippingPrice = Number(selectedShippingMethod?.price ?? 0);
  const totalPrice = subtotal + shippingPrice;

  try {
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Atomic stock update: every book stock is decremented only if enough stock is still available.
      for (const item of cartItems) {
        const updated = await tx.book.updateMany({
          where: {
            id: item.bookId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw new Error(`INSUFFICIENT_STOCK:${item.bookId}`);
        }
      }

      const order = await tx.order.create({
        data: {
          userId: user.id,
          addressId: selectedAddress?.id ?? null,
          shippingMethodId: selectedShippingMethod?.id ?? null,
          totalPrice,
          status: 'PAID',
          stripePaymentId: null,
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      await tx.orderItem.createMany({
        data: cartItems.map((item) => ({
          orderId: order.id,
          bookId: item.bookId,
          quantity: item.quantity,
          price: Number(item.book.price),
        })),
      });

      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      });

      return order;
    });

    return NextResponse.json(
      {
        ok: true,
        orderId: createdOrder.id,
        totalPrice,
        createdAt: createdOrder.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Order creation failed';
    if (message.startsWith('INSUFFICIENT_STOCK:')) {
      return NextResponse.json({ error: 'Stock changed. Please review your cart.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
  }
}

export const GET = withApiSecurity(getOrders, {
  bucket: 'api',
});

export const POST = withApiSecurity(createOrder, {
  bucket: 'api',
  maxBodyBytes: 32 * 1024,
  schemaByMethod: {
    POST: createOrderSchema,
  },
  requireCaptcha: false,
});
