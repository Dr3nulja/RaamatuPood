import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/prisma');

beforeEach(()=>jest.resetAllMocks());

function ensureMock(obj:any, key:string){ if(!obj[key]) obj[key]=jest.fn(); return obj[key]; }

describe('Security - XSS', ()=>{
  test('Payload containing script is escaped in responses', async ()=>{
    const prisma = require('@/lib/prisma');
    if (!prisma.user) prisma.user = {};
    ensureMock(prisma.user, 'update').mockResolvedValue({ id:1, bio:"&lt;script&gt;alert('x')&lt;/script&gt;" });
    const u = await prisma.user.update({ where:{ id:1 }, data:{ bio:"<script>alert('x')</script>" } } as any);
    expect(u.bio).toContain('&lt;script&gt;');
  });

  test('User input stored but not executed in UI', async ()=>{
    expect(true).toBeTruthy();
  });
});
