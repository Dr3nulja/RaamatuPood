import { CONCURRENCY } from '@/lib/security/config';

type Pending = {
  resolve: (release: () => void) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

let active = 0;
const queue: Pending[] = [];

function releaseSlot() {
  active = Math.max(0, active - 1);

  const next = queue.shift();
  if (!next) {
    return;
  }

  clearTimeout(next.timer);
  active += 1;
  next.resolve(() => releaseSlot());
}

export async function acquireRequestSlot(): Promise<() => void> {
  if (active < CONCURRENCY.maxActiveApiRequests) {
    active += 1;
    return () => releaseSlot();
  }

  if (queue.length >= CONCURRENCY.maxQueueSize) {
    throw new Error('QUEUE_FULL');
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const index = queue.findIndex((entry) => entry.timer === timer);
      if (index >= 0) {
        queue.splice(index, 1);
      }
      reject(new Error('QUEUE_TIMEOUT'));
    }, CONCURRENCY.queueTimeoutMs);

    queue.push({ resolve, reject, timer });
  });
}
