import { ANOMALY } from '@/lib/security/config';

const minuteCounters = new Map<string, { minute: number; count: number }>();

export function logSecurityEvent(event: string, data: Record<string, unknown>) {
  console.info('[security]', event, JSON.stringify(data));
}

export function detectAndLogAnomaly(key: string, context: Record<string, unknown>) {
  const now = Date.now();
  const minute = Math.floor(now / 60_000);
  const entry = minuteCounters.get(key);

  if (!entry || entry.minute !== minute) {
    minuteCounters.set(key, { minute, count: 1 });
    return;
  }

  entry.count += 1;

  if (entry.count === ANOMALY.requestsPerMinuteForAlert) {
    logSecurityEvent('anomaly.high_request_rate', {
      key,
      count: entry.count,
      ...context,
      alertTarget: process.env.SECURITY_ALERT_WEBHOOK_URL ? 'webhook-configured' : 'console-only',
    });
  }
}
