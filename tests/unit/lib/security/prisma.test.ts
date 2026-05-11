import { withPrismaProtection, withTimeout } from '@/lib/security/prisma';

describe('withTimeout', () => {
  it('resolves when the promise finishes in time', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 50, 'timeout')).resolves.toBe('ok');
  });

  it('rejects when the promise exceeds the timeout', async () => {
    await expect(
      withTimeout(
        new Promise((resolve) => {
          setTimeout(resolve, 50);
        }),
        1,
        'DB_QUERY_TIMEOUT'
      )
    ).rejects.toThrow('DB_QUERY_TIMEOUT');
  });
});

describe('withPrismaProtection', () => {
  it('uses the default Prisma timeout wrapper', async () => {
    await expect(withPrismaProtection(async () => 'safe')).resolves.toBe('safe');
  });
});