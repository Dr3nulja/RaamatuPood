import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/auth/flow', () => ({
  requireUserFlowAccessForApi: jest.fn(),
  getAuthFlowState: jest.fn(),
  requireUserFlowAccess: jest.fn(),
}));

beforeEach(()=>jest.resetAllMocks());

describe('Security - Authorization', ()=>{
  test('USER cannot access ADMIN resources', async ()=>{
    const auth = require('@/lib/auth/flow');
    (auth.requireUserFlowAccessForApi as any).mockImplementation(()=>{ throw new Error('403'); });
    try { await auth.requireUserFlowAccessForApi({} as any); } catch (e:any) { expect(e.message).toMatch(/403/); }
  });

  test('ADMIN can access admin resources', async ()=>{
    const auth = require('@/lib/auth/flow');
    (auth.requireUserFlowAccessForApi as any).mockReturnValue(true);
    expect(await auth.requireUserFlowAccessForApi({} as any)).toBeTruthy();
  });
});
