import { NextResponse, type NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { applySecurityHeaders } from '@/lib/security/headers';
import { consumeIpLimit } from '@/lib/security/rate-limit';
import { isHardBlockedBot } from '@/lib/security/bot';
import { getClientIp } from '@/lib/security/ip';

function resolveBucket(pathname: string) {
  if (pathname.includes('/auth/login') || pathname.includes('/api/auth/')) {
    return 'login' as const;
  }

  if (pathname.includes('/api/books') || pathname.includes('/catalog')) {
    return 'search' as const;
  }

  if (pathname.includes('/api/webhooks/')) {
    return 'webhook' as const;
  }

  return 'api' as const;
}

function isLikelyAuthenticated(request: NextRequest) {
  return Boolean(request.cookies.get('appSession')?.value || request.cookies.get('__session')?.value);
}

function shouldBypassEarlyBlocking(pathname: string, request: NextRequest) {
  if (pathname === '/api/sync-user') {
    return true;
  }

  if (isLikelyAuthenticated(request)) {
    return true;
  }

  return false;
}

function isEmailFlowAllowedPath(pathname: string) {
  if (pathname === '/verify-email' || pathname.startsWith('/verify-email/')) {
    return true;
  }

  if (pathname === '/profile-setup' || pathname.startsWith('/profile-setup/')) {
    return true;
  }

  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/auth/')) {
    return true;
  }

  if (pathname.startsWith('/api/sync-user') || pathname.startsWith('/api/profile/setup') || pathname.startsWith('/api/auth/status')) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ip = getClientIp(request);
  const bypassEarlyBlocking = shouldBypassEarlyBlocking(pathname, request);

  if (!bypassEarlyBlocking && isHardBlockedBot(request)) {
    return NextResponse.json({ error: 'captcha_required' }, { status: 403 });
  }

  if (!bypassEarlyBlocking) {
    const limit = await consumeIpLimit(resolveBucket(pathname), ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'rate_limited' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limit.retryAfterSeconds),
          },
        }
      );
    }
  }

  const session = await auth0.getSession(request);
  if (session?.user?.sub && session.user.email_verified !== true && !isEmailFlowAllowedPath(pathname)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'email_not_verified' }, { status: 403 });
    }

    const verifyEmailUrl = request.nextUrl.clone();
    verifyEmailUrl.pathname = '/verify-email';
    verifyEmailUrl.search = '';
    verifyEmailUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(verifyEmailUrl);
  }

  const response = await auth0.middleware(request);
  applySecurityHeaders(response.headers);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|auth/login|auth/callback).*)',
  ],
};
