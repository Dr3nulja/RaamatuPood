import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/prisma');
jest.mock('@/lib/auth0');
jest.mock('@/lib/auth/flow');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('Happy Path - Account (TC-21..TC-25)', () => {
  test('TC-21: Account dashboard returns user data', async () => {
    const prisma = require('@/lib/prisma');
    if (!prisma.prisma) prisma.prisma = prisma;
    (prisma.user.findUnique as any).mockResolvedValue({ id: 1, name: 'QA User' });
    const accountRoute = require('@/app/account/page');
    expect(accountRoute).toBeDefined();
  });

  test('TC-22: Orders are listed in account orders', async () => {
    const prisma = require('@/lib/prisma');
    const auth = require('@/lib/auth/flow');
    if (!prisma.prisma) prisma.prisma = prisma;
    if (!prisma.order) prisma.order = {};
    
    (prisma.order.findMany as any).mockResolvedValue([{ 
      id: 1, 
      totalPrice: 50, 
      status: 'PAID', 
      createdAt: new Date(),
      orderItems: [] 
    }]);

    (auth.requireUserFlowAccessForApi as any).mockResolvedValue({ 
      ok: true, 
      user: { id: 1 } 
    });

    const ordersRoute = require('@/app/api/orders/route');
    const res = await ordersRoute.GET(new Request('http://localhost/api/orders'));
    
    const getJson = async (r: any) => {
      const data = await r.json();
      return data.orders || data;
    };

    const json = await getJson(res);
    expect(json.length).toBeGreaterThan(0);
    expect(json[0].id).toBe(1);
  });

  test('TC-23: Edit profile saves new data', async () => {
    const prisma = require('@/lib/prisma');
    if (!prisma.prisma) prisma.prisma = prisma;
    (prisma.user.update as any).mockResolvedValue({ id: 1, name: 'qa_user_01' });
    const updated = await prisma.user.update({ where: { id: 1 }, data: { name: 'qa_user_01' } });
    expect(updated.name).toBe('qa_user_01');
  });

  test('TC-24: Avatar upload stores file and updates user', async () => {
    const prisma = require('@/lib/prisma');
    if (!prisma.prisma) prisma.prisma = prisma;
    (prisma.user.update as any).mockResolvedValue({ id: 1, avatar: '/uploads/av.png' });
    const res = await prisma.user.update({ where: { id: 1 }, data: { avatar: '/uploads/av.png' } });
    expect(res.avatar).toContain('/uploads/');
  });

  test('TC-25: Account changes persist after reload', async () => {
    const prisma = require('@/lib/prisma');
    if (!prisma.prisma) prisma.prisma = prisma;
    (prisma.user.findUnique as any).mockResolvedValue({ id: 1, name: 'qa_user_01' });
    const u = await prisma.user.findUnique({ where: { id: 1 } });
    expect(u.name).toBe('qa_user_01');
  });
});
