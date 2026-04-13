export type SecurityBucket = 'api' | 'search' | 'login' | 'webhook';

export const RATE_LIMITS: Record<SecurityBucket, { capacity: number; refillPerMinute: number; windowMs: number; maxPerWindow: number }> = {
  api: { capacity: 120, refillPerMinute: 120, windowMs: 60_000, maxPerWindow: 120 },
  search: { capacity: 45, refillPerMinute: 45, windowMs: 60_000, maxPerWindow: 90 },
  login: { capacity: 10, refillPerMinute: 10, windowMs: 60_000, maxPerWindow: 12 },
  webhook: { capacity: 240, refillPerMinute: 240, windowMs: 60_000, maxPerWindow: 240 },
};

export const USER_RATE_LIMITS: Record<SecurityBucket, { capacity: number; refillPerMinute: number; windowMs: number; maxPerWindow: number }> = {
  api: { capacity: 180, refillPerMinute: 180, windowMs: 60_000, maxPerWindow: 180 },
  search: { capacity: 90, refillPerMinute: 90, windowMs: 60_000, maxPerWindow: 120 },
  login: { capacity: 8, refillPerMinute: 8, windowMs: 60_000, maxPerWindow: 10 },
  webhook: { capacity: 500, refillPerMinute: 500, windowMs: 60_000, maxPerWindow: 500 },
};

export const BRUTE_FORCE_SETTINGS = {
  maxFailedAttempts: 8,
  banMs: 15 * 60_000,
  minDelayMs: 400,
  maxDelayMs: 4_000,
};

export const MAX_BODY_BYTES_DEFAULT = 256 * 1024;

export const CONCURRENCY = {
  maxActiveApiRequests: 120,
  maxQueueSize: 250,
  queueTimeoutMs: 2_000,
};

export const ANOMALY = {
  requestsPerMinuteForAlert: 300,
};
