import { RATE_LIMITS, USER_RATE_LIMITS, type SecurityBucket } from '@/lib/security/config';

type TokenBucketState = {
  tokens: number;
  lastRefillAt: number;
};

type SlidingWindowState = {
  windowStart: number;
  count: number;
};

type RateState = {
  bucket: TokenBucketState;
  window: SlidingWindowState;
};

const memoryStore = new Map<string, RateState>();

type LimitConfig = {
  capacity: number;
  refillPerMinute: number;
  windowMs: number;
  maxPerWindow: number;
};

function refillTokens(bucket: TokenBucketState, config: LimitConfig, now: number) {
  const elapsedMs = Math.max(0, now - bucket.lastRefillAt);
  const refillRatePerMs = config.refillPerMinute / 60_000;
  const refill = elapsedMs * refillRatePerMs;

  bucket.tokens = Math.min(config.capacity, bucket.tokens + refill);
  bucket.lastRefillAt = now;
}

function checkAndConsume(state: RateState, config: LimitConfig, now: number): { allowed: boolean; retryAfterSeconds: number } {
  refillTokens(state.bucket, config, now);

  const elapsedInWindow = now - state.window.windowStart;
  if (elapsedInWindow >= config.windowMs) {
    state.window.windowStart = now;
    state.window.count = 0;
  }

  if (state.bucket.tokens < 1 || state.window.count >= config.maxPerWindow) {
    const secondsToWindowReset = Math.ceil((config.windowMs - Math.max(0, now - state.window.windowStart)) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, secondsToWindowReset) };
  }

  state.bucket.tokens -= 1;
  state.window.count += 1;

  return { allowed: true, retryAfterSeconds: 0 };
}

function getOrInitState(key: string, config: LimitConfig, now: number): RateState {
  const existing = memoryStore.get(key);
  if (existing) {
    return existing;
  }

  const created: RateState = {
    bucket: {
      tokens: config.capacity,
      lastRefillAt: now,
    },
    window: {
      windowStart: now,
      count: 0,
    },
  };

  memoryStore.set(key, created);
  return created;
}

async function consumeRedisToken(key: string, config: LimitConfig): Promise<{ allowed: boolean; retryAfterSeconds: number } | null> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return null;
  }

  // Simplified atomic script via EVAL endpoint.
  const script = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local refill_per_minute = tonumber(ARGV[3])
local window_ms = tonumber(ARGV[4])
local max_per_window = tonumber(ARGV[5])

local bucket_tokens = tonumber(redis.call('HGET', key, 'tokens'))
local bucket_last = tonumber(redis.call('HGET', key, 'last'))
local window_start = tonumber(redis.call('HGET', key, 'window_start'))
local window_count = tonumber(redis.call('HGET', key, 'window_count'))

if not bucket_tokens then bucket_tokens = capacity end
if not bucket_last then bucket_last = now end
if not window_start then window_start = now end
if not window_count then window_count = 0 end

local elapsed = math.max(0, now - bucket_last)
local refill = (elapsed * refill_per_minute) / 60000
bucket_tokens = math.min(capacity, bucket_tokens + refill)
bucket_last = now

if (now - window_start) >= window_ms then
  window_start = now
  window_count = 0
end

if bucket_tokens < 1 or window_count >= max_per_window then
  local retry = math.ceil((window_ms - math.max(0, now - window_start)) / 1000)
  if retry < 1 then retry = 1 end
  redis.call('PEXPIRE', key, window_ms)
  return {0, retry}
end

bucket_tokens = bucket_tokens - 1
window_count = window_count + 1

redis.call('HSET', key, 'tokens', bucket_tokens, 'last', bucket_last, 'window_start', window_start, 'window_count', window_count)
redis.call('PEXPIRE', key, window_ms)

return {1, 0}
`;

  const now = Date.now();

  const response = await fetch(`${redisUrl}/eval/${encodeURIComponent(script)}/1/${encodeURIComponent(key)}/${now}/${config.capacity}/${config.refillPerMinute}/${config.windowMs}/${config.maxPerWindow}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
    },
    cache: 'no-store',
  }).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as { result?: [number, number] } | null;
  const result = payload?.result;
  if (!result || result.length < 2) {
    return null;
  }

  return {
    allowed: result[0] === 1,
    retryAfterSeconds: Number(result[1]) || 0,
  };
}

async function consumeWithConfig(key: string, config: LimitConfig): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const redisResult = await consumeRedisToken(key, config);
  if (redisResult) {
    return redisResult;
  }

  const now = Date.now();
  const state = getOrInitState(key, config, now);
  return checkAndConsume(state, config, now);
}

export async function consumeIpLimit(bucket: SecurityBucket, ip: string) {
  const config = RATE_LIMITS[bucket];
  const key = `ip:${bucket}:${ip}`;
  return consumeWithConfig(key, config);
}

export async function consumeUserLimit(bucket: SecurityBucket, userId: string) {
  const config = USER_RATE_LIMITS[bucket];
  const key = `user:${bucket}:${userId}`;
  return consumeWithConfig(key, config);
}
