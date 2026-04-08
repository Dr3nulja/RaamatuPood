import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextResponse, type NextRequest } from 'next/server';
import { auth0Options } from '@/lib/auth0';
import { createUserIfNotExists } from '@/lib/auth/createUserIfNotExists';
import { mergeSessionCartIntoDb } from '@/lib/cart/sync';
import { CART_SYNC_COOKIE_NAME, parseSessionCartCookie } from '@/lib/cart/sessionCart';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const sessionCartItems = parseSessionCartCookie(request.cookies.get(CART_SYNC_COOKIE_NAME)?.value);

  const auth0Callback = new Auth0Client({
    ...auth0Options,
    onCallback: async (error, context, session) => {
      const baseUrl = context.appBaseUrl || process.env.AUTH0_BASE_URL || 'http://localhost:3000';

      if (error) {
        return NextResponse.redirect(new URL('/auth/login?error=callback_failed', baseUrl));
      }

      try {
        // Create/update user and merge pre-login cart payload into cart_items for this user.
        const dbUser = await createUserIfNotExists(session?.user);
        if (dbUser?.id) {
          await mergeSessionCartIntoDb(dbUser.id, sessionCartItems);
        }
      } catch (syncError) {
        console.error('Failed to sync Auth0 user/cart during callback', syncError);
      }

      return NextResponse.redirect(new URL(context.returnTo || '/', baseUrl));
    },
  });

  const response = await auth0Callback.middleware(request);
  response.cookies.set(CART_SYNC_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  return response;
}