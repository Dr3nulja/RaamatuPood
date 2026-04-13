export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || 'unknown';
}

export function getPathname(request: Request): string {
  try {
    return new URL(request.url).pathname;
  } catch {
    return '/';
  }
}
