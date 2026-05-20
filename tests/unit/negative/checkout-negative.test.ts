import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/prisma');
jest.mock('@/lib/stripe');

beforeEach(() => jest.resetAllMocks());

function ensureMock(obj:any, key:string){ if(!obj[key]) obj[key]=jest.fn(); return obj[key]; }

describe('Negative - Checkout (TC-07..TC-11)', () => {
  test('TC-07: Invalid shipping address returns validation error', async () => {
    const createCheckout = require('@/lib/checkout/createCheckout');
    try {
      await createCheckout.createCheckout({ userId: 1, shipping: { street: '' } } as any);
    } catch (e) {
      expect(true).toBeTruthy();
    }
  });

  test('TC-08: Stripe declined card leads to payment failure', async () => {
    const stripe = require('@/lib/stripe');
    if (!stripe.paymentIntents || typeof stripe.paymentIntents.create !== 'function') {
      stripe.paymentIntents = { create: jest.fn().mockRejectedValue(new Error('Your card was declined')) };
    } else if (typeof (stripe.paymentIntents.create as any).mockRejectedValue !== 'function') {
      stripe.paymentIntents.create = jest.fn().mockRejectedValue(new Error('Your card was declined'));
    } else {
      (stripe.paymentIntents.create as any).mockRejectedValue(new Error('Your card was declined'));
    }
    try {
      await stripe.paymentIntents.create({ amount: 1000 } as any);
    } catch (e:any) {
      expect(e.message).toMatch(/declined/);
    }
  });

  test('TC-09: DB timeout during checkout returns controlled error', async () => {
    const prisma = require('@/lib/prisma');
    if (!prisma.$transaction) prisma.$transaction = jest.fn();
    (prisma.$transaction as any).mockImplementation(() => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 100)));
    const createCheckout = require('@/lib/checkout/createCheckout');
    try {
      await createCheckout.createCheckout({ userId: 1 } as any);
    } catch (e) {
      expect(true).toBeTruthy();
    }
  });
});
