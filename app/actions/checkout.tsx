'use server';

import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { CheckoutCartItem } from '@/stores/cartStore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

function normalizeSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

function toPositiveInt(value: unknown, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const normalized = Math.floor(parsed);
  return normalized > 0 ? normalized : fallback;
}

function sanitizeCartItems(raw: string): CheckoutCartItem[] {
  const parsed = JSON.parse(raw || '[]') as unknown;
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item) => {
      const source = item as Partial<CheckoutCartItem>;
      const price = Number(source.price);

      return {
        id: toPositiveInt(source.id, 0),
        title: (source.title || '').trim(),
        price: Number.isFinite(price) && price > 0 ? price : 0,
        quantity: toPositiveInt(source.quantity, 1),
        image: source.image && typeof source.image === 'string' ? source.image : undefined,
      };
    })
    .filter((item) => item.id > 0 && item.title.length > 0 && item.price > 0 && item.quantity > 0);
}

export async function createCheckoutSession(formData: FormData) {
  // Вычисляем URL назначения в try/catch, затем redirect() вызываем снаружи.
  // Это КРИТИЧНО: redirect() в Next.js работает через throw NEXT_REDIRECT,
  // поэтому вызов внутри catch приводит к бесконечному перехвату ошибки.
  let redirectTo = '/checkout?error=checkout_failed';

  try {
    const guestName = String(formData.get('name') || '').trim();
    const guestEmail = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const address = String(formData.get('address') || '').trim();
    const deliveryMethod = String(formData.get('delivery') || '').trim();
    const cartItemsRaw = String(formData.get('cartItems') || '[]');

    if (!guestName || !guestEmail || !address || !deliveryMethod) {
      redirectTo = '/checkout?error=missing_fields';
      return;
    }

    const cartItems = sanitizeCartItems(cartItemsRaw);

    if (cartItems.length === 0) {
      redirectTo = '/checkout?error=empty_cart';
      return;
    }

    const siteUrl = normalizeSiteUrl();
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        status: 'PENDING',
        totalPrice: total,
      },
    });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.title,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: guestEmail,
      line_items: lineItems,
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?canceled=true`,
      metadata: {
        orderId: String(order.id),
        guestName,
        guestEmail,
        phone,
        address,
        deliveryMethod,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentId: session.id },
    });

    revalidatePath('/account');
    redirectTo = session.url!;
  } catch (error) {
    console.error('createCheckoutSession failed:', error);
    // redirectTo уже равен '/checkout?error=checkout_failed'
  }

  redirect(redirectTo);
}