import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import type { CheckoutErrorCode, CheckoutResponse } from '@/lib/api/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

type CheckoutInput = {
  auth0Id: string;
  fallbackEmail?: string | null;
  guestName: string;
  guestEmail: string;
  phone?: string;
  deliveryMethod: string;
  address?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  siteUrl?: string;
};

function toError(code: CheckoutErrorCode, error: string, details?: string): CheckoutResponse {
  return { ok: false, code, error, details };
}

function normalizeSiteUrl(siteUrl?: string) {
  return (siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

function normalizeShippingName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function buildShippingCandidates(value: string) {
  const raw = String(value || '').trim();
  const normalized = normalizeShippingName(raw);
  const aliases = new Set<string>([raw]);

  const legacyCourierRu = decodeURIComponent('%D0%9A%D1%83%D1%80%D1%8C%D0%B5%D1%80%20%D0%BF%D0%BE%20%D0%A2%D0%B0%D0%BB%D0%BB%D0%B8%D0%BD%D1%83');
  const legacyPickupRu = decodeURIComponent('%D0%A1%D0%B0%D0%BC%D0%BE%D0%B2%D1%8B%D0%B2%D0%BE%D0%B7');
  const legacyCourierKey = normalizeShippingName(legacyCourierRu);
  const legacyPickupKey = normalizeShippingName(legacyPickupRu);

  const aliasMap: Record<string, string[]> = {
    courier: ['Tallinn Courier', legacyCourierRu],
    pickup: ['Self-call', legacyPickupRu],
    'tallinn courier': ['Tallinn Courier', legacyCourierRu],
    'self-call': ['Self-call', legacyPickupRu],
    [legacyCourierKey]: ['Tallinn Courier', legacyCourierRu],
    [legacyPickupKey]: ['Self-call', legacyPickupRu],
    omniva: ['Omniva pakiautomaat'],
    itella: ['Itella Smartpost'],
    'omniva pakiautomaat': ['Omniva pakiautomaat'],
    'itella smartpost': ['Itella Smartpost'],
  };

  for (const alias of aliasMap[normalized] || []) {
    aliases.add(alias);
  }

  return {
    normalized,
    names: Array.from(aliases).filter(Boolean),
  };
}

function parseAddress(input: CheckoutInput) {
  const combinedAddress = String(input.address || '').trim();
  let street = String(input.street || '').trim();
  let postalCode = String(input.postalCode || '').trim();
  let city = String(input.city || '').trim();
  let country = String(input.country || '').trim();

  if ((!street || !postalCode || !city || !country) && combinedAddress) {
    const [streetPart = '', postalCityPart = '', countryPart = ''] = combinedAddress
      .split(',')
      .map((part) => part.trim());

    if (!street) street = streetPart;
    if (!country) country = countryPart;

    if ((!postalCode || !city) && postalCityPart) {
      const match = postalCityPart.match(/^(\S+)\s+(.+)$/);
      if (match) {
        if (!postalCode) postalCode = match[1].trim();
        if (!city) city = match[2].trim();
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

export async function createCheckout(input: CheckoutInput): Promise<CheckoutResponse> {
  const auth0Id = input.auth0Id?.trim();

  if (!auth0Id) {
    return toError('unauthorized', 'Unauthorized');
  }

  const dbUser = await prisma.user.findUnique({
    where: { auth0Id },
    select: { id: true },
  });

  if (!dbUser) {
    return toError('user_not_found', 'User not found');
  }

  const guestName = input.guestName.trim();
  const guestEmail = (input.guestEmail || input.fallbackEmail || '').trim();
  const phone = String(input.phone || '').trim();
  const deliveryMethod = String(input.deliveryMethod || '').trim();
  const parsedAddress = parseAddress(input);

  if (!guestName || !guestEmail || !deliveryMethod) {
    return toError('missing_fields', 'Missing required fields');
  }

  const hasAddress = Boolean(
    parsedAddress.combinedAddress ||
      parsedAddress.street ||
      parsedAddress.postalCode ||
      parsedAddress.city ||
      parsedAddress.country
  );

  if (!hasAddress) {
    return toError('missing_fields', 'Address is required');
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: dbUser.id },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          price: true,
          stock: true,
          coverImage: true,
        },
      },
    },
  });

  if (cartItems.length === 0) {
    return toError('empty_cart', 'Cart is empty');
  }

  for (const item of cartItems) {
    if (item.quantity > item.book.stock) {
      return toError(
        'stock_exceeded',
        'Requested quantity exceeds stock',
        `Book ${item.book.id} has only ${item.book.stock} in stock`
      );
    }
  }

  const numericDeliveryId = Number(deliveryMethod);
  const shippingCandidates = buildShippingCandidates(deliveryMethod);

  let shippingMethod = await prisma.shippingMethod.findFirst({
    where:
      Number.isInteger(numericDeliveryId) && numericDeliveryId > 0
        ? {
            OR: [{ id: numericDeliveryId }, { name: { in: shippingCandidates.names } }],
          }
        : { name: { in: shippingCandidates.names } },
    select: { id: true, name: true, price: true },
  });

  if (!shippingMethod) {
    const allShippingMethods = await prisma.shippingMethod.findMany({
      select: { id: true, name: true, price: true },
    });

    shippingMethod =
      allShippingMethods.find((method) =>
        shippingCandidates.names.some(
          (candidate) => normalizeShippingName(method.name || '') === normalizeShippingName(candidate)
        )
      ) || null;
  }

  if (!shippingMethod) {
    return toError('invalid_shipping_method', 'Invalid shipping method');
  }

  const shippingPrice = Number(shippingMethod.price ?? 0);
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.book.price) * item.quantity, 0);
  const total = subtotal + shippingPrice;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map((item) => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.book.title,
        ...(item.book.coverImage ? { images: [item.book.coverImage] } : {}),
      },
      unit_amount: Math.round(Number(item.book.price) * 100),
    },
    quantity: item.quantity,
  }));

  if (shippingPrice > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: { name: shippingMethod.name || 'Delivery' },
        unit_amount: Math.round(shippingPrice * 100),
      },
      quantity: 1,
    });
  }

  try {
    const siteUrl = normalizeSiteUrl(input.siteUrl);

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
        deliveryMethod: shippingMethod.name || deliveryMethod,
      },
    });

    const created = await prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: {
          userId: dbUser.id,
          country: parsedAddress.country,
          city: parsedAddress.city,
          street: parsedAddress.street ?? (parsedAddress.combinedAddress || null),
          postalCode: parsedAddress.postalCode,
        },
        select: { id: true },
      });

      const order = await tx.order.create({
        data: {
          userId: dbUser.id,
          addressId: address.id,
          shippingMethodId: shippingMethod.id,
          totalPrice: total,
          status: 'PENDING',
          stripePaymentId: stripeSession.id,
        },
        select: { id: true },
      });

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
          throw new Error(`Insufficient stock for book ${item.bookId}`);
        }
      }

      await tx.orderItem.createMany({
        data: cartItems.map((item) => ({
          orderId: order.id,
          bookId: item.bookId,
          quantity: item.quantity,
          price: Number(item.book.price),
        })),
      });

      await tx.cartItem.deleteMany({
        where: { userId: dbUser.id },
      });

      return order;
    });

    await stripe.checkout.sessions.update(stripeSession.id, {
      metadata: {
        orderId: String(created.id),
        guestName,
        guestEmail,
        phone,
        address: parsedAddress.combinedAddress,
        deliveryMethod: shippingMethod.name || deliveryMethod,
      },
    });

    if (!stripeSession.url) {
      return toError('checkout_failed', 'Stripe checkout URL is missing');
    }

    return {
      ok: true,
      orderId: created.id,
      stripePaymentId: stripeSession.id,
      checkoutUrl: stripeSession.url,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    if (message.startsWith('Insufficient stock')) {
      return toError('stock_exceeded', 'Requested quantity exceeds stock', message);
    }

    return toError('checkout_failed', 'Checkout failed', message);
  }
}
