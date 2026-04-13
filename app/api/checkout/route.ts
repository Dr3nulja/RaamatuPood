import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { createCheckout } from '@/lib/checkout/createCheckout';
import type { ApiErrorResponse, CheckoutResponse } from '@/lib/api/types';
import { z } from 'zod';
import { strictObject, withApiSecurity } from '@/lib/security/api-guard';

const checkoutSchema = strictObject({
  name: z.string().max(120).optional(),
  email: z.string().email().max(180).optional(),
  phone: z.string().max(50).optional(),
  delivery: z.string().max(80).optional(),
  address: z.string().max(300).optional(),
  street: z.string().max(200).optional(),
  postalCode: z.string().max(40).optional(),
  city: z.string().max(120).optional(),
  country: z.string().max(120).optional(),
});

async function createCheckoutHandler(request: NextRequest) {
  const session = await auth0.getSession();

  if (!session?.user?.sub) {
    const response: ApiErrorResponse = { error: 'Unauthorized' };
    return NextResponse.json(response, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        name?: string;
        email?: string;
        phone?: string;
        delivery?: string;
        address?: string;
        street?: string;
        postalCode?: string;
        city?: string;
        country?: string;
      }
    | null;

  const result = await createCheckout({
    auth0Id: session.user.sub,
    fallbackEmail: session.user.email,
    guestName: String(body?.name || ''),
    guestEmail: String(body?.email || ''),
    phone: String(body?.phone || ''),
    deliveryMethod: String(body?.delivery || ''),
    address: String(body?.address || ''),
    street: String(body?.street || ''),
    postalCode: String(body?.postalCode || ''),
    city: String(body?.city || ''),
    country: String(body?.country || ''),
  });

  if (!result.ok) {
    const status =
      result.code === 'unauthorized'
        ? 401
        : result.code === 'user_not_found'
          ? 404
          : result.code === 'checkout_failed'
            ? 500
            : 400;

    return NextResponse.json(result, { status });
  }

  const response: CheckoutResponse = result;
  return NextResponse.json(response, { status: 200 });
}

export const POST = withApiSecurity(createCheckoutHandler, {
  bucket: 'api',
  maxBodyBytes: 64 * 1024,
  schemaByMethod: {
    POST: checkoutSchema,
  },
  requireCaptcha: true,
});
