import { jest } from '@jest/globals';

const stripe = {
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({ id: 'sess_stub', url: 'https://stripe.test/session' }),
      update: jest.fn().mockResolvedValue({ id: 'sess_stub', url: 'https://stripe.test/session' }),
      retrieve: jest.fn().mockResolvedValue({ id: 'sess_stub', url: 'https://stripe.test/session' }),
    },
  },
  paymentIntents: {
    create: jest.fn().mockResolvedValue({ id: 'pi_stub' }),
    retrieve: jest.fn().mockResolvedValue({ id: 'pi_stub' }),
  },
};

export const checkout = stripe.checkout;
export const paymentIntents = stripe.paymentIntents;

export default stripe;