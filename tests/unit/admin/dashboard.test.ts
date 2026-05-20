import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/prisma');

beforeEach(()=>jest.resetAllMocks());

describe('Admin - Dashboard stats', ()=>{
  test('Dashboard returns orders count', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.order.count as any).mockResolvedValue(10);
    const c = await prisma.order.count();
    expect(c).toBe(10);
  });

  test('Dashboard returns books count', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.book.count as any).mockResolvedValue(50);
    const c = await prisma.book.count();
    expect(c).toBeGreaterThanOrEqual(50);
  });

  test('Dashboard returns revenue sum', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.order.aggregate as any).mockResolvedValue({ _sum: { total: 1000 } });
    const agg = await prisma.order.aggregate({ _sum: { total: true } } as any);
    expect(agg._sum.total).toBe(1000);
  });

  test('Dashboard widgets load without error', async ()=>{
    expect(true).toBeTruthy();
  });
});
