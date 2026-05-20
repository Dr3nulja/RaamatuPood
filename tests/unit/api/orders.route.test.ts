import { jest } from '@jest/globals';

jest.mock('@/lib/security/api-guard', () => ({
  __esModule: true,
  withApiSecurity: (h: any) => h,
  strictObject: (shape: any) => ({
    safeParse: (data: any) => ({ success: true, data }),
  }),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, opts?: any) => ({ status: opts?.status || 200, data }),
  },
}));

jest.mock('@/lib/auth/flow', () => ({
  __esModule: true,
  requireUserFlowAccessForApi: jest.fn().mockResolvedValue({ ok: true, user: { id: 42 } }),
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    order: {
      findMany: jest.fn(),
    },
  },
}));

// We'll require modules after mocks below to ensure mocks are applied.

describe('Orders API — happy path', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns orders history for user', async () => {
    const { prisma } = require('@/lib/prisma');
    (prisma.order.findMany as jest.Mock).mockResolvedValue([
      {
        id: 900,
        totalPrice: 20.5,
        status: 'PAID',
        stripePaymentId: 'pi_123',
        createdAt: new Date('2026-01-01T12:00:00Z'),
        address: { id: 7, country: 'EE', city: 'Tallinn', street: 'St 1', postalCode: '10111' },
        shippingMethod: { id: 2, name: 'Courier', price: 3.5 },
        orderItems: [{ id: 1, bookId: 11, quantity: 1, price: 17.0, book: { title: 'Book A' } }],
      },
    ]);

    const { GET } = require('@/app/api/orders/route');
    const req = { url: 'http://localhost/api/orders', method: 'GET' } as any;
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.data.orders).toHaveLength(1);
    expect(res.data.orders[0].id).toBe(900);
    expect(res.data.orders[0].order_items[0].title).toBe('Book A');
  });
});
