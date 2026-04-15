import { NextResponse, type NextRequest } from 'next/server';
import { auth0, resolvedAuth0Config } from '@/lib/auth0';
import { logSecurityEvent } from '@/lib/security/logger';

export const runtime = 'nodejs';

function getAppBaseUrl() {
  return resolvedAuth0Config.appBaseUrl;
}

function getIncomingOrigin(request: NextRequest) {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host');

  if (host) {
    return `${forwardedProto || request.nextUrl.protocol.replace(':', '')}://${host}`;
  }

  return request.nextUrl.origin;
}

function isSafeReturnTo(value: string) {
  return value.startsWith('/') && !value.startsWith('//');
}

export async function GET(request: NextRequest) {
  const appBaseUrl = getAppBaseUrl();
  const requestUrl = new URL(request.url);
  const incomingOrigin = getIncomingOrigin(request);

  if (incomingOrigin !== appBaseUrl) {
    const redirectUrl = new URL(requestUrl.pathname + requestUrl.search, appBaseUrl);
    return NextResponse.redirect(redirectUrl, { status: 307 });
  }

  const returnTo = requestUrl.searchParams.get('returnTo');
  if (returnTo && !isSafeReturnTo(returnTo)) {
    logSecurityEvent('auth.login.invalid_return_to', {
      returnTo,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    const safeRedirect = new URL('/auth/login', appBaseUrl);
    const prompt = requestUrl.searchParams.get('prompt');
    const screenHint = requestUrl.searchParams.get('screen_hint');
    if (prompt) {
      safeRedirect.searchParams.set('prompt', prompt);
    }
    if (screenHint) {
      safeRedirect.searchParams.set('screen_hint', screenHint);
    }

    return NextResponse.redirect(safeRedirect, { status: 307 });
  }

  try {
    // For the /auth/login route, SDK middleware dispatches to its internal handleLogin implementation.
    return await auth0.middleware(request);
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown Auth0 login error';
    console.error('[auth.login] Failed to initialize login flow:', details);
    logSecurityEvent('auth.login.failed', {
      details,
      pathname: requestUrl.pathname,
    });

    const failedUrl = new URL('/?auth_error=login_failed', appBaseUrl);
    return NextResponse.redirect(failedUrl, { status: 302 });
  }
}
