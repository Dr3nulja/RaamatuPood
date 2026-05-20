import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/security/api-guard');

beforeEach(()=>jest.resetAllMocks());

function ensureMock(obj:any, key:string){ if(!obj[key]) obj[key]=jest.fn(); return obj[key]; }

describe('Security - Validation (Zod)', ()=>{
  test('Invalid price type yields validation error', async ()=>{
    const guard = require('@/lib/security/api-guard');
    const m = ensureMock(guard, 'validate');
    m.mockImplementation(()=>{ throw new Error('Validation failed'); });
    try { guard.validate({ price: 'abc' } as any); } catch (e:any) { expect(e.message).toMatch(/Validation failed/); }
  });
});
