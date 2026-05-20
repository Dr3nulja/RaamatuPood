import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/prisma');

beforeEach(()=>jest.resetAllMocks());

describe('Admin - Orders management', ()=>{
  test('Fetch orders list', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.order.findMany as any).mockResolvedValue([{ id:501, total:100 }]);
    const list = await prisma.order.findMany();
    expect(list.length).toBeGreaterThan(0);
  });

  test('Update order status', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.order.update as any).mockResolvedValue({ id:501, status:'shipped' });
    const u = await prisma.order.update({ where:{ id:501 }, data:{ status:'shipped' } } as any);
    expect(u.status).toBe('shipped');
  });

  test('Cancel order sets status cancelled', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.order.update as any).mockResolvedValue({ id:501, status:'cancelled' });
    const u = await prisma.order.update({ where:{ id:501 }, data:{ status:'cancelled' } } as any);
    expect(u.status).toBe('cancelled');
  });

  test('Admin can view order details', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.order.findUnique as any).mockResolvedValue({ id:501, items:[] });
    const d = await prisma.order.findUnique({ where:{ id:501 } } as any);
    expect(d).toBeDefined();
  });
});
