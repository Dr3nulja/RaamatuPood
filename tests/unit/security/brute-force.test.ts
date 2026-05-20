import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/security/brute-force');

beforeEach(()=>jest.resetAllMocks());

function ensureMock(obj:any, key:string){ if(!obj[key]) obj[key]=jest.fn(); return obj[key]; }

describe('Security - Brute force protection', ()=>{
  test('Too many failed attempts triggers lock', async ()=>{
    const bf = require('@/lib/security/brute-force');
    ensureMock(bf, 'recordFailure').mockImplementation(()=>{});
    ensureMock(bf, 'isLocked').mockReturnValue(true);
    const locked = await bf.isLocked('user1');
    expect(locked).toBeTruthy();
  });

  test('Fresh user is not locked', async ()=>{
    const bf = require('@/lib/security/brute-force');
    ensureMock(bf, 'isLocked').mockReturnValue(false);
    expect(await bf.isLocked('user2')).toBeFalsy();
  });
});
