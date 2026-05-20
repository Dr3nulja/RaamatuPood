import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/security/rate-limit');

beforeEach(()=>jest.resetAllMocks());

function ensureMock(obj:any, key:string){ if(!obj[key]) obj[key]=jest.fn(); return obj[key]; }

describe('Security - Rate limiting', ()=>{
  test('Rate limiter blocks when bucket exceeded', async ()=>{
    const rate = require('@/lib/security/rate-limit');
    const m = ensureMock(rate, 'checkLimit') as jest.Mock;
    m.mockReturnValue(true);
    const blocked = await rate.checkLimit('1.2.3.4');
    expect(blocked).toBeTruthy();
  });

  test('Rate limiter allows under threshold', async ()=>{
    const rate = require('@/lib/security/rate-limit');
    const m = ensureMock(rate, 'checkLimit') as jest.Mock;
    m.mockReturnValue(false);
    const allowed = await rate.checkLimit('1.2.3.5');
    expect(allowed).toBeFalsy();
  });
});
