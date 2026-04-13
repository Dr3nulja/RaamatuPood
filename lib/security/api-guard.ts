import { NextResponse } from 'next/server';
import { z, type ZodTypeAny } from 'zod';
import { MAX_BODY_BYTES_DEFAULT } from '@/lib/security/config';
import { isHardBlockedBot } from '@/lib/security/bot';
import { getClientIp, getPathname } from '@/lib/security/ip';
import { consumeIpLimit, consumeUserLimit } from '@/lib/security/rate-limit';
import { acquireRequestSlot } from '@/lib/security/throttle';
import { detectAndLogAnomaly, logSecurityEvent } from '@/lib/security/logger';
import { verifyCaptchaToken } from '@/lib/security/captcha';

export type SecurityOptions = {
  requireCaptcha?: boolean;
  rateLimitBucket?: 'api' | 'auth' | 'search' | 'webhook';
  skipBotCheck?: boolean;
};

type GuardOptions = SecurityOptions & {
  bucket?: 'api' | 'login' | 'search' | 'webhook';
  maxBodyBytes?: number;
  schemaByMethod?: Partial<Record<'POST' | 'PUT' | 'PATCH' | 'DELETE', ZodTypeAny>>;
  resolveUserId?: (request: Request) => Promise<string | null>;
};

type RouteContext = { params?: Promise<Record<string, string>> };

function mapRateBucket(bucket: SecurityOptions['rateLimitBucket']) {
  // Internal limiter uses "login" bucket; external API exposes "auth" alias.
  if (bucket === 'auth') {
    return 'login' as const;
  }

  return (bucket || 'api') as 'api' | 'login' | 'search' | 'webhook';
}

function resolveRateBucket(options: GuardOptions) {
  if (options.rateLimitBucket) {
    return mapRateBucket(options.rateLimitBucket);
  }

  return options.bucket || 'api';
}

const dangerousKeys = new Set(['__proto__', 'constructor', 'prototype']);

function findDangerousKey(input: unknown): boolean {
  if (!input || typeof input !== 'object') {
    return false;
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      if (findDangerousKey(item)) {
        return true;
      }
    }
    return false;
  }

  for (const [key, value] of Object.entries(input)) {
    if (dangerousKeys.has(key)) {
      return true;
    }

    if (findDangerousKey(value)) {
      return true;
    }
  }

  return false;
}

function parseContentLength(request: Request): number {
  const value = request.headers.get('content-length');
  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

async function parseAndValidateBody(request: Request, schema?: ZodTypeAny) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return { ok: true as const, data: null };
  }

  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false as const, response: NextResponse.json({ error: 'Invalid JSON object payload' }, { status: 400 }) };
  }

  if (findDangerousKey(raw)) {
    return { ok: false as const, response: NextResponse.json({ error: 'Blocked JSON injection payload' }, { status: 400 }) };
  }

  if (!schema) {
    return { ok: true as const, data: raw };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: 'Payload validation failed',
          issues: parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
        },
        { status: 400 }
      ),
    };
  }

  return { ok: true as const, data: parsed.data };
}

export function strictObject<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).strict();
}

export function withApiSecurity(
  handler: (request: any, context?: any) => Promise<Response> | Response,
  options: GuardOptions
) {
  return async function securedHandler(request: any, context?: any) {
    const pathname = getPathname(request);
    const ip = getClientIp(request);
    const method = request.method.toUpperCase();

    detectAndLogAnomaly(`ip:${ip}`, { pathname, method });

    const shouldSkipBotCheck = options.skipBotCheck === true;
    if (!shouldSkipBotCheck && isHardBlockedBot(request)) {
      logSecurityEvent('request.blocked.bot', { ip, pathname, method });
      return NextResponse.json({ error: 'captcha_required' }, { status: 403 });
    }

    const effectiveBucket = resolveRateBucket(options);
    const ipLimit = await consumeIpLimit(effectiveBucket, ip);
    if (!ipLimit.allowed) {
      logSecurityEvent('request.blocked.ip_rate_limit', { ip, pathname, method, bucket: effectiveBucket });
      return NextResponse.json(
        { error: 'rate_limited' },
        {
          status: 429,
          headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) },
        }
      );
    }

    const maxBodyBytes = options.maxBodyBytes ?? MAX_BODY_BYTES_DEFAULT;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      const contentLength = parseContentLength(request);
      if (contentLength > maxBodyBytes) {
        return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
      }
    }

    if (options.requireCaptcha && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      const captchaToken = request.headers.get('x-captcha-token') || '';
      const captchaValid = await verifyCaptchaToken(captchaToken, ip);
      if (!captchaValid) {
        logSecurityEvent('request.blocked.captcha', { ip, pathname, method });
        return NextResponse.json({ error: 'captcha_required' }, { status: 403 });
      }
    }

    if (options.resolveUserId) {
      const userId = await options.resolveUserId(request);
      if (userId) {
        const userLimit = await consumeUserLimit(effectiveBucket, userId);
        if (!userLimit.allowed) {
          logSecurityEvent('request.blocked.user_rate_limit', { userId, pathname, method, bucket: effectiveBucket });
          return NextResponse.json(
            { error: 'rate_limited' },
            {
              status: 429,
              headers: { 'Retry-After': String(userLimit.retryAfterSeconds) },
            }
          );
        }
      }
    }

    const methodSchema = options.schemaByMethod?.[method as 'POST' | 'PUT' | 'PATCH' | 'DELETE'];
    if (methodSchema && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const validation = await parseAndValidateBody(request.clone(), methodSchema);
      if (!validation.ok) {
        return validation.response;
      }
    }

    let release: (() => void) | null = null;

    try {
      release = await acquireRequestSlot();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'QUEUE_FULL';
      return NextResponse.json({ error: message === 'QUEUE_TIMEOUT' ? 'Server busy, retry later' : 'Server overloaded' }, { status: 503 });
    }

    const startedAt = Date.now();

    try {
      const response = await handler(request, context);

      const durationMs = Date.now() - startedAt;
      logSecurityEvent('request.completed', {
        ip,
        pathname,
        method,
        status: response.status,
        durationMs,
      });

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unhandled route error';
      logSecurityEvent('request.error', { ip, pathname, method, error: message });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
      if (release) {
        release();
      }
    }
  };
}
