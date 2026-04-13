export const CSP_VALUE = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com https://challenges.cloudflare.com https://www.google.com",
  "frame-src 'self' https://challenges.cloudflare.com https://www.google.com",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

export function applySecurityHeaders(headers: Headers) {
  headers.set('Content-Security-Policy', CSP_VALUE);
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
}
