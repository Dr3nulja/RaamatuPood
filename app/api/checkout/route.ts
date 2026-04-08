import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { createCheckout } from '@/lib/checkout/createCheckout';
import type { ApiErrorResponse, CheckoutResponse } from '@/lib/api/types';

export async function POST(request: NextRequest) {
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
