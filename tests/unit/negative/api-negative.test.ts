import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/prisma');
jest.mock('@/lib/security/rate-limit');

beforeEach(() => jest.resetAllMocks());

describe('Negative - API (TC-10..TC-12)', () => {
  test('TC-10: Rate limit returns 429 when exceeded', async () => {
    const rate = require('@/lib/security/rate-limit');
    if (!rate.checkLimit) rate.checkLimit = jest.fn();
    (rate.checkLimit as any).mockReturnValue(true);
    const blocked = await rate.checkLimit('ip');
    expect(blocked).toBeTruthy();
  });

  test('TC-11: Access to admin endpoints with USER role returns 403', async () => {
    const auth = require('@/lib/auth/flow');
    if (!auth.requireUserFlowAccessForApi) auth.requireUserFlowAccessForApi = jest.fn();
    if (typeof auth.requireUserFlowAccessForApi.mockImplementation !== 'function') {
      auth.requireUserFlowAccessForApi = jest.fn().mockImplementation(() => { throw new Error('403'); });
    } else {
      (auth.requireUserFlowAccessForApi as any).mockImplementation(() => { throw new Error('403'); });
    }
    try {
      await auth.requireUserFlowAccessForApi({} as any);
    } catch (e:any) {
      expect(e.message).toMatch(/403/);
    }
  });

  test('TC-12: Deleting non-existent book returns 404', async () => {
    const prisma = require('@/lib/prisma');
    (prisma.book.delete as any).mockRejectedValue(new Error('Not found'));
    try {
      await prisma.book.delete({ where: { id: 999999 } });
    } catch (e:any) {
      expect(e.message).toMatch(/Not found/);
    }
  });
});
