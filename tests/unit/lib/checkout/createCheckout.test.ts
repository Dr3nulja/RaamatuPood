import { createCheckout } from '@/lib/checkout/createCheckout';

type TransactionClient = {
  address: {
    create: jest.Mock;
  };
  order: {
    create: jest.Mock;
  };
  book: {
    updateMany: jest.Mock;
  };
  orderItem: {
    createMany: jest.Mock;
  };
  cartItem: {
    deleteMany: jest.Mock;
  };
};

jest.mock('stripe', () => {
  const createMock = jest.fn();
  const updateMock = jest.fn();

  const StripeMock = jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: createMock,
        update: updateMock,
      },
    },
  }));

  return Object.assign(StripeMock, { createMock, updateMock });
});

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    cartItem: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    shippingMethod: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { prisma } from '@/lib/prisma';

const stripeModule = jest.requireMock('stripe') as {
  createMock: jest.Mock;
  updateMock: jest.Mock;
};

describe('createCheckout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  });

  it('returns an unauthorized error when auth0 id is missing', async () => {
    await expect(
      createCheckout({
        auth0Id: '   ',
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        deliveryMethod: 'courier',
        address: 'Street 1, 10111 Tallinn, Estonia',
      })
    ).resolves.toEqual({ ok: false, code: 'unauthorized', error: 'Unauthorized' });
  });

  it('returns empty cart when no items are present', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.cartItem.findMany as jest.Mock).mockResolvedValue([]);

    const result = await createCheckout({
      auth0Id: 'auth0|user',
      guestName: 'Test User',
      guestEmail: 'test@example.com',
      deliveryMethod: 'courier',
      address: 'Street 1, 10111 Tallinn, Estonia',
    });

    expect(result).toEqual({ ok: false, code: 'empty_cart', error: 'Cart is empty' });
  });

  it('creates an order and returns the checkout URL', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 7 });
    (prisma.cartItem.findMany as jest.Mock).mockResolvedValue([
      {
        bookId: 11,
        quantity: 2,
        book: {
          id: 11,
          title: 'Test Book',
          price: 12.5,
          stock: 5,
          coverImage: 'https://example.com/cover.jpg',
        },
      },
    ]);
    (prisma.shippingMethod.findFirst as jest.Mock).mockResolvedValue({ id: 3, name: 'Tallinn Courier', price: 4.5 });
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback: (tx: TransactionClient) => Promise<unknown>) => {
      const tx: TransactionClient = {
        address: {
          create: jest.fn().mockResolvedValue({ id: 21 }),
        },
        order: {
          create: jest.fn().mockResolvedValue({ id: 88 }),
        },
        book: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        orderItem: {
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        cartItem: {
          deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      };

      return callback(tx);
    });
    stripeModule.createMock.mockResolvedValue({ id: 'sess_123', url: 'https://stripe.test/session' });
    stripeModule.updateMock.mockResolvedValue({});

    const result = await createCheckout({
      auth0Id: 'auth0|user',
      guestName: 'Test User',
      guestEmail: 'test@example.com',
      deliveryMethod: 'courier',
      address: 'Street 1, 10111 Tallinn, Estonia',
      siteUrl: 'http://localhost:3000',
    });

    expect(result).toEqual({
      ok: true,
      orderId: 88,
      stripePaymentId: 'sess_123',
      checkoutUrl: 'https://stripe.test/session',
    });

    expect(stripeModule.createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        customer_email: 'test@example.com',
      })
    );
    expect(stripeModule.updateMock).toHaveBeenCalledWith('sess_123', expect.objectContaining({ metadata: expect.any(Object) }));
  });
});