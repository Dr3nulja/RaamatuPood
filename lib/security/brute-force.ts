import { BRUTE_FORCE_SETTINGS } from '@/lib/security/config';

type FailedEntry = {
  count: number;
  lastFailedAt: number;
  blockedUntil: number;
};

const failedByKey = new Map<string, FailedEntry>();

export function getLoginDelayMs(key: string): number {
  const entry = failedByKey.get(key);
  if (!entry) {
    return 0;
  }

  const rawDelay = BRUTE_FORCE_SETTINGS.minDelayMs * Math.max(1, entry.count);
  return Math.min(rawDelay, BRUTE_FORCE_SETTINGS.maxDelayMs);
}

export function isLoginBlocked(key: string): boolean {
  const entry = failedByKey.get(key);
  if (!entry) {
    return false;
  }

  return entry.blockedUntil > Date.now();
}

export function registerFailedLoginAttempt(key: string): { blockedUntil: number | null; attempts: number } {
  const now = Date.now();
  const existing = failedByKey.get(key);

  const next: FailedEntry = existing
    ? {
        count: existing.count + 1,
        lastFailedAt: now,
        blockedUntil: existing.blockedUntil,
      }
    : {
        count: 1,
        lastFailedAt: now,
        blockedUntil: 0,
      };

  if (next.count >= BRUTE_FORCE_SETTINGS.maxFailedAttempts) {
    next.blockedUntil = now + BRUTE_FORCE_SETTINGS.banMs;
  }

  failedByKey.set(key, next);

  return {
    blockedUntil: next.blockedUntil || null,
    attempts: next.count,
  };
}

export function registerSuccessfulLoginAttempt(key: string) {
  failedByKey.delete(key);
}
