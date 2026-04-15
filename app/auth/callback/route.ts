import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextResponse, type NextRequest } from 'next/server';
import { auth0Options, resolvedAuth0Config } from '@/lib/auth0';
import { createUserIfNotExists } from '@/lib/auth/createUserIfNotExists';
import { mergeSessionCartIntoDb } from '@/lib/cart/sync';
import { CART_SYNC_COOKIE_NAME, parseSessionCartCookie } from '@/lib/cart/sessionCart';
import {
  getLoginDelayMs,
  isLoginBlocked,
  registerFailedLoginAttempt,
  registerSuccessfulLoginAttempt,
} from '@/lib/security/brute-force';
import { getClientIp } from '@/lib/security/ip';
import { logSecurityEvent } from '@/lib/security/logger';
import { hasCompleteProfile } from '@/lib/auth/flow';

export const runtime = 'nodejs';

function getIncomingOrigin(request: NextRequest) {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host');

  if (host) {
    return `${forwardedProto || request.nextUrl.protocol.replace(':', '')}://${host}`;
  }

  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const bruteForceKey = `login:${ip}`;
  const baseUrl = resolvedAuth0Config.appBaseUrl;
  const requestUrl = request.nextUrl;
  const incomingOrigin = getIncomingOrigin(request);

  if (incomingOrigin !== baseUrl) {
    const canonicalUrl = new URL(requestUrl.pathname + requestUrl.search, baseUrl);
    return NextResponse.redirect(canonicalUrl, { status: 307 });
  }

  const callbackError = request.nextUrl.searchParams.get('error');
  const callbackErrorDescription = request.nextUrl.searchParams.get('error_description');
  const callbackErrorCode = request.nextUrl.searchParams.get('error_code');

  if (callbackError) {
    console.error('[auth.callback] Auth0 returned callback error', {
      error: callbackError,
      errorCode: callbackErrorCode,
      errorDescription: callbackErrorDescription,
      url: request.url,
    });
  }

  if (isLoginBlocked(bruteForceKey)) {
    logSecurityEvent('auth.callback.blocked_ip', { ip });
    return NextResponse.redirect(new URL('/auth/login?error=blocked', baseUrl));
  }

  const loginDelayMs = getLoginDelayMs(bruteForceKey);
  if (loginDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, loginDelayMs));
  }

  const sessionCartItems = parseSessionCartCookie(request.cookies.get(CART_SYNC_COOKIE_NAME)?.value);

  const auth0Callback = new Auth0Client({
    ...auth0Options,
    onCallback: async (error, context, session) => {
      const baseUrl = context.appBaseUrl || resolvedAuth0Config.appBaseUrl;

      if (error) {
        const callbackErrorDetails = {
          message: error.message,
          name: error.name,
          code: (error as { code?: string }).code,
          cause: (error as { cause?: unknown }).cause,
          contextReturnTo: context.returnTo,
        };

        console.error('[auth.callback] Login callback processing failed', callbackErrorDetails);
        const failed = registerFailedLoginAttempt(bruteForceKey);
        logSecurityEvent('auth.callback.failed', {
          ip,
          attempts: failed.attempts,
          blockedUntil: failed.blockedUntil,
          error: callbackError,
          errorCode: callbackErrorCode,
          errorDescription: callbackErrorDescription,
          callbackErrorMessage: error.message,
        });
        return NextResponse.redirect(new URL('/auth/login?error=callback_failed', baseUrl));
      }

      registerSuccessfulLoginAttempt(bruteForceKey);

      const authUser = session?.user;
      const returnTo = context.returnTo || '/';

      if (!authUser?.sub) {
        return NextResponse.redirect(new URL('/auth/login?error=callback_failed', baseUrl));
      }

      if (authUser.email_verified !== true) {
        return NextResponse.redirect(new URL(`/verify-email?returnTo=${encodeURIComponent(returnTo)}`, baseUrl));
      }

      try {
        // Create/update user and merge pre-login cart payload into cart_items for this user.
        const dbUser = await createUserIfNotExists(authUser);
        if (dbUser?.id) {
          await mergeSessionCartIntoDb(dbUser.id, sessionCartItems);

          if (!hasCompleteProfile(dbUser)) {
            return NextResponse.redirect(new URL(`/profile-setup?returnTo=${encodeURIComponent(returnTo)}`, baseUrl));
          }
        }
      } catch (syncError) {
        console.error('Failed to sync Auth0 user/cart during callback', syncError);
      }

      return NextResponse.redirect(new URL(returnTo, baseUrl));
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