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

  const response = await auth0.middleware(request);
  applySecurityHeaders(response.headers);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|auth/callback).*)',
  ],
};
