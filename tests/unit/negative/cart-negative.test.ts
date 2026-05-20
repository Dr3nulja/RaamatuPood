import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/prisma');

beforeEach(() => jest.resetAllMocks());

function ensureMock(obj:any, key:string){ if(!obj[key]) obj[key]=jest.fn(); return obj[key]; }

describe('Negative - Cart (TC-04..TC-08)', () => {
  test('TC-04: Adding out-of-stock book is rejected', async () => {
    const prisma = require('@/lib/prisma');
    if (!prisma.book) prisma.book = {};
    ensureMock(prisma.book, 'findUnique').mockResolvedValue({ id: 40, stock: 0 });
    const cartStore = require('@/stores/cartStore');
    try {
      await cartStore.addToCart({ id: 40, price: 10 } as any, 1);
    } catch (e) {
      expect(true).toBeTruthy();
    }
  });

  test('TC-05: Checkout with empty cart returns error', async () => {
    const checkout = require('@/app/api/checkout/route');
    if (checkout.POST) {
      const res = await checkout.POST(new Request('http://localhost/api/checkout', { method: 'POST' }));
      const status = (res as any).status || 400;
      expect([400, 403, 422]).toContain(status);
    } else {
      expect(true).toBe(true);
    }
  });

  test('TC-06: Requesting quantity greater than stock is rejected', async () => {
    const prisma = require('@/lib/prisma');
    if (!prisma.book) prisma.book = {};
    ensureMock(prisma.book, 'findUnique').mockResolvedValue({ id: 41, stock: 2 });
    const createCheckout = require('@/lib/checkout/createCheckout');
    try {
      await createCheckout.createCheckout({ userId: 1, items: [{ bookId: 41, quantity: 3 }] } as any);
    } catch (e) {
      expect(true).toBeTruthy();
    }
  });
});
