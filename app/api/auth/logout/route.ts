import { NextResponse } from 'next/server';
import { withApiSecurity } from '@/lib/security/api-guard';

export const runtime = 'nodejs';

function appendExpiredCookieHeader(response: NextResponse, rawName: string, rawValue = '') {
  const encodedName = encodeURIComponent(rawName);
  const encodedValue = encodeURIComponent(rawValue);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';

  const cookieHeader = [
    `${encodedName}=${encodedValue}`,
    'Path=/',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'HttpOnly',
    'SameSite=Lax',
    secure,
  ]
    .filter(Boolean)
    .join('; ');

  response.headers.append('Set-Cookie', cookieHeader);

  const cookieHeaderClient = [
    `${encodedName}=${encodedValue}`,
    'Path=/',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'SameSite=Lax',
    secure,
  ]
    .filter(Boolean)
    .join('; ');

  response.headers.append('Set-Cookie', cookieHeaderClient);
}

function buildLogoutResponse(request: Request) {
  const currentUrl = new URL(request.url);
  const appBaseUrl = process.env.AUTH0_BASE_URL || `${currentUrl.protocol}//${currentUrl.host}`;
  const returnToAbsolute = new URL('/', appBaseUrl).toString();

  const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL?.replace(/\/$/, '');
  const auth0ClientId = process.env.AUTH0_CLIENT_ID;

  const auth0LogoutUrl = issuerBaseUrl
    ? new URL('/v2/logout', issuerBaseUrl)
    : new URL('/auth/logout', appBaseUrl);

  if (issuerBaseUrl) {
    if (auth0ClientId) {
      auth0LogoutUrl.searchParams.set('client_id', auth0ClientId);
    }
    auth0LogoutUrl.searchParams.set('returnTo', returnToAbsolute);
  } else {
    auth0LogoutUrl.searchParams.set('returnTo', '/');
  }

  const response = NextResponse.redirect(auth0LogoutUrl, { status: 302 });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');

  // Auth0 + app cookies (ASCII + кириллица) очищаем безопасно через encoded Set-Cookie
  const cookiesToClear = [
    '__session',
    'appSession',
    'auth_verification',
    'raamatupood-session',
    'raamatupood-user',
    'raamatupood-сессия',
    'raamatupood-пользователь',
  ];

  for (const cookieName of cookiesToClear) {
    appendExpiredCookieHeader(response, cookieName);
  }

  return response;
}

async function getLogout(request: Request) {
  return buildLogoutResponse(request);
}

async function postLogout(request: Request) {
  const response = buildLogoutResponse(request);
  response.headers.set('Location', response.headers.get('Location') || '/');
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');

  return new NextResponse(null, {
    status: 303,
    headers: response.headers,
  });
}

export const GET = withApiSecurity(getLogout, {
  bucket: 'login',
});

export const POST = withApiSecurity(postLogout, {
  bucket: 'login',
  maxBodyBytes: 8 * 1024,
});
