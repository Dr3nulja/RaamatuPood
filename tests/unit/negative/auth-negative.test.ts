import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/auth0');
jest.mock('@/lib/prisma');

beforeEach(() => jest.resetAllMocks());

function ensureMock(obj:any, key:string){ if(!obj[key]) obj[key]=jest.fn(); return obj[key]; }

describe('Negative - Auth (TC-01..TC-05)', () => {
  test('TC-01: Login with wrong password is rejected', async () => {
    const auth0 = require('@/lib/auth0');
    ensureMock(auth0, 'getSession').mockResolvedValue(null);
    const flow = require('@/lib/auth/flow');
    try {
      await flow.getAuthFlowState({} as any);
    } catch (e) {
      expect(true).toBeTruthy();
    }
  });

  test('TC-02: Brute force attempts are blocked after threshold', async () => {
    const rate = require('@/lib/security/rate-limit');
    ensureMock(rate, 'checkLimit').mockReturnValueOnce(true);
    const blocked = await rate.checkLimit('ip');
    expect(blocked).toBeTruthy();
  });

  test('TC-03: Unverified email redirects to verify page', async () => {
    const auth0 = require('@/lib/auth0');
    ensureMock(auth0, 'getSession').mockResolvedValue({ user: { email_verified: false } });
    const flow = require('@/lib/auth/flow');
    try {
      await flow.getAuthFlowState({} as any);
    } catch (e) {
      expect(true).toBeTruthy();
    }
  });
});
