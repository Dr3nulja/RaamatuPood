export async function verifyCaptchaToken(token: string, remoteIp: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  // Cloudflare Turnstile
  if (process.env.TURNSTILE_SECRET_KEY) {
    const body = new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: remoteIp,
    });

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });

    const payload = (await response.json().catch(() => null)) as { success?: boolean } | null;
    return Boolean(payload?.success);
  }

  // Google reCAPTCHA v2/v3
  if (process.env.RECAPTCHA_SECRET_KEY) {
    const body = new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: token,
      remoteip: remoteIp,
    });

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });

    const payload = (await response.json().catch(() => null)) as { success?: boolean; score?: number } | null;
    if (!payload?.success) {
      return false;
    }

    if (typeof payload.score === 'number') {
      return payload.score >= 0.4;
    }

    return true;
  }

  // If captcha is not configured we do not hard fail, but the caller can enforce env checks.
  return true;
}
