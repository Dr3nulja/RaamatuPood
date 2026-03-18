'use server';

import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth0 } from '@/lib/auth0';
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

function parseAddress(formData: FormData) {
  const combinedAddress = String(formData.get('address') || '').trim();
  let street = String(formData.get('street') || '').trim();
  let postalCode = String(formData.get('postalCode') || '').trim();
  let city = String(formData.get('city') || '').trim();
  let country = String(formData.get('country') || '').trim();

  if ((!street || !postalCode || !city || !country) && combinedAddress) {
    const [streetPart = '', postalCityPart = '', countryPart = ''] = combinedAddress
      .split(',')
      .map((part) => part.trim());

    if (!street) {
      street = streetPart;
    }

    if (!country) {
      country = countryPart;
    }

    if ((!postalCode || !city) && postalCityPart) {
      const match = postalCityPart.match(/^(\S+)\s+(.+)$/);
      if (match) {
        if (!postalCode) {
          postalCode = match[1].trim();
        }
        if (!city) {
          city = match[2].trim();
        }
      } else if (!city) {
        city = postalCityPart;
      }
    }
  }

  return {
    combinedAddress,
    street: street || null,
    postalCode: postalCode || null,
    city: city || null,
    country: country || null,
  };
}

export async function createCheckoutSession(formData: FormData) {
  // Вычисляем URL назначения в try/catch, затем redirect() вызываем снаружи.
  // Это КРИТИЧНО: redirect() в Next.js работает через throw NEXT_REDIRECT,
  // поэтому вызов внутри catch приводит к бесконечному перехвату ошибки.
  let redirectTo = '/checkout?error=checkout_failed';

  try {
    const authSession = await auth0.getSession();
    const authUser = authSession?.user;

    if (!authUser?.sub) {
      redirectTo = '/checkout?error=unauthorized';
      return;
    }

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: authUser.sub },
    });

    if (!dbUser) {
      redirectTo = '/checkout?error=user_not_found';
      return;
    }

    const guestName = String(formData.get('name') || '').trim();
    const guestEmail = String(formData.get('email') || '').trim() || authUser.email?.trim() || '';
    const phone = String(formData.get('phone') || '').trim();
    const deliveryMethod = String(formData.get('delivery') || '').trim();
    const cartItemsRaw = String(formData.get('cartItems') || '[]');
    const parsedAddress = parseAddress(formData);

    if (!guestName || !guestEmail || !deliveryMethod) {
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

    let addressId: number | null = null;
    const hasAddress = Boolean(
      parsedAddress.combinedAddress ||
      parsedAddress.street ||
      parsedAddress.postalCode ||
      parsedAddress.city ||
      parsedAddress.country
    );

    if (hasAddress) {
      const addressRecord = await prisma.address.create({
        data: {
          userId: dbUser.id,
          country: parsedAddress.country,
          city: parsedAddress.city,
          street: parsedAddress.street ?? (parsedAddress.combinedAddress || null),
          postalCode: parsedAddress.postalCode,
        },
      });
      addressId = addressRecord.id;
    }

    let shippingMethodId: number | null = null;
    if (deliveryMethod) {
      const numericDeliveryId = Number(deliveryMethod);
      const shippingMethod = await prisma.shippingMethod.findFirst({
        where: Number.isInteger(numericDeliveryId) && numericDeliveryId > 0
          ? {
              OR: [
                { id: numericDeliveryId },
                { name: deliveryMethod },
              ],
            }
          : { name: deliveryMethod },
        select: { id: true },
      });

      if (shippingMethod) {
        shippingMethodId = shippingMethod.id;
      }
    }

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

    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: guestEmail,
      line_items: lineItems,
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?canceled=true`,
      metadata: {
        guestName,
        guestEmail,
        phone,
        address: parsedAddress.combinedAddress,
        deliveryMethod,
      },
    });

    const order = await prisma.order.create({
      data: {
        userId: dbUser.id,
        addressId,
        shippingMethodId,
        status: 'PENDING',
        totalPrice: total,
        stripePaymentId: stripeSession.id,
      },
    });

    await stripe.checkout.sessions.update(stripeSession.id, {
      metadata: {
        orderId: String(order.id),
        guestName,
        guestEmail,
        phone,
        address: parsedAddress.combinedAddress,
        deliveryMethod,
      },
    });

    revalidatePath('/account');
    redirectTo = stripeSession.url || '/checkout?error=checkout_failed';
  } catch (error) {
    console.error('createCheckoutSession failed:', error);
    // redirectTo уже равен '/checkout?error=checkout_failed'
  }

  redirect(redirectTo);
}