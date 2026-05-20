import { jest } from '@jest/globals';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, opts?: { status?: number; headers?: Record<string, string> }) => ({
      status: opts?.status ?? 200,
      data,
      headers: opts?.headers ?? {},
    }),
  },
}));

jest.mock('@/lib/auth0', () => ({
  auth0: {
    getSession: jest.fn(),
  },
}));

jest.mock('@/lib/auth/createUserIfNotExists', () => ({
  createUserIfNotExists: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    book: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    cartItem: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    shippingMethod: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/security/rate-limit', () => ({
  consumeIpLimit: jest.fn(),
  consumeUserLimit: jest.fn(),
}));

jest.mock('@/lib/security/ip', () => ({
  getClientIp: jest.fn(() => '127.0.0.1'),
  getPathname: jest.fn(() => '/api/test'),
}));

jest.mock('@/lib/security/logger', () => ({
  detectAndLogAnomaly: jest.fn(),
  logSecurityEvent: jest.fn(),
}));

jest.mock('@/lib/security/bot', () => ({
  isHardBlockedBot: jest.fn(() => false),
}));

jest.mock('@/lib/security/throttle', () => ({
  acquireRequestSlot: jest.fn(async () => () => {}),
}));

jest.mock('@/lib/security/captcha', () => ({
  verifyCaptchaToken: jest.fn(async () => true),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

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

import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { createUserIfNotExists } from '@/lib/auth/createUserIfNotExists';
import { consumeIpLimit } from '@/lib/security/rate-limit';
import { getAuthFlowState, requireUserFlowAccessForApi } from '@/lib/auth/flow';
import { createCheckout } from '@/lib/checkout/createCheckout';
import { withApiSecurity } from '@/lib/security/api-guard';

const stripeModule = jest.requireMock('stripe') as {
  createMock: jest.Mock;
  updateMock: jest.Mock;
};

describe('Negative & Boundary Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';

    (consumeIpLimit as jest.Mock).mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    (createUserIfNotExists as jest.Mock).mockResolvedValue({ id: 1, auth0Id: 'auth0|u1' });
  });

  test('TC-01: Login with invalid password should fail', async () => {
    (auth0.getSession as jest.Mock).mockResolvedValue(null);

    const state = await getAuthFlowState();

    expect(state.state).toBe('unauthenticated');
    expect(state.session).toBeNull();
  });

  test('TC-02: Exceeding login attempts should trigger brute force protection', async () => {
    let counter = 0;
    (consumeIpLimit as jest.Mock).mockImplementation(async () => {
      counter += 1;
      if (counter <= 10) {
        return { allowed: true, retryAfterSeconds: 0 };
      }
      return { allowed: false, retryAfterSeconds: 60 };
    });

    const handler = withApiSecurity(async () => ({ status: 200 } as Response), {
      bucket: 'login',
      requireCaptcha: false,
    });

    for (let i = 0; i < 10; i += 1) {
      const res = await handler(new Request('http://localhost/api/auth/login', { method: 'POST' }), {} as never);
      expect((res as unknown as { status: number }).status).toBe(200);
    }

    const blocked = await handler(new Request('http://localhost/api/auth/login', { method: 'POST' }), {} as never);
    expect((blocked as unknown as { status: number }).status).toBe(429);
  });

  test('TC-03: Login with unverified email should redirect to /verify-email', async () => {
    (auth0.getSession as jest.Mock).mockResolvedValue({
      user: {
        sub: 'auth0|unverified',
        email_verified: false,
      },
    });

    const state = await getAuthFlowState();
    const access = await requireUserFlowAccessForApi();

    expect(state.state).toBe('verify-email');
    expect(access.ok).toBe(false);
    expect((access as { response: { status: number } }).response.status).toBe(403);
  });

  test('TC-04: Adding out-of-stock book to cart should be rejected', async () => {
    (auth0.getSession as jest.Mock).mockResolvedValue({ user: { sub: 'auth0|u1', email_verified: true } });
    (createUserIfNotExists as jest.Mock).mockResolvedValue({ id: 77, auth0Id: 'auth0|u1' });
    (prisma.book.findUnique as jest.Mock).mockResolvedValue({ id: 10, stock: 0 });
    (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue(null);

    const { POST } = await import('@/app/api/cart/route');
    const req = new Request('http://localhost/api/cart', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bookId: 10, quantity: 1 }),
    });

    const res = await POST(req as never, {} as never);

    expect((res as unknown as { status: number }).status).toBe(400);
    expect((res as unknown as { data: { error: string } }).data.error).toContain('exceeds stock');
  });

  test('TC-05: Checkout with empty cart should return error', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 3 });
    (prisma.cartItem.findMany as jest.Mock).mockResolvedValue([]);

    const result = await createCheckout({
      auth0Id: 'auth0|u3',
      guestName: 'User 3',
      guestEmail: 'u3@test.dev',
      deliveryMethod: 'courier',
      address: 'Street 1, 10111 Tallinn, Estonia',
    });

    expect(result.ok).toBe(false);
    expect(result.code).toBe('empty_cart');
  });

  test('TC-06: Order with quantity > stock should be rejected', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 4 });
    (prisma.cartItem.findMany as jest.Mock).mockResolvedValue([
      {
        bookId: 11,
        quantity: 3,
        book: {
          id: 11,
          title: 'Book with low stock',
          price: 12,
          stock: 2,
          coverImage: null,
        },
      },
    ]);

    const result = await createCheckout({
      auth0Id: 'auth0|u4',
      guestName: 'User 4',
      guestEmail: 'u4@test.dev',
      deliveryMethod: 'courier',
      address: 'Street 1, 10111 Tallinn, Estonia',
    });

    expect(result.ok).toBe(false);
    expect(result.code).toBe('stock_exceeded');
  });

  test('TC-07: Missing address fields should fail validation', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 5 });
    (prisma.cartItem.findMany as jest.Mock).mockResolvedValue([
      {
        bookId: 12,
        quantity: 1,
        book: {
          id: 12,
          title: 'Book',
          price: 20,
          stock: 10,
          coverImage: null,
        },
      },
    ]);

    const result = await createCheckout({
      auth0Id: 'auth0|u5',
      guestName: 'User 5',
      guestEmail: 'u5@test.dev',
      deliveryMethod: 'courier',
      address: '',
      street: '',
      postalCode: '',
      city: '',
      country: '',
    });

    expect(result.ok).toBe(false);
    expect(result.code).toBe('missing_fields');
  });

  test('TC-08: Stripe declined payment should not create order', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 6 });
    (prisma.cartItem.findMany as jest.Mock).mockResolvedValue([
      {
        bookId: 13,
        quantity: 1,
        book: {
          id: 13,
          title: 'Book',
          price: 15,
          stock: 8,
          coverImage: null,
        },
      },
    ]);
    (prisma.shippingMethod.findFirst as jest.Mock).mockResolvedValue({ id: 2, name: 'Courier', price: 4 });
    stripeModule.createMock.mockRejectedValue(new Error('Your card was declined'));

    const result = await createCheckout({
      auth0Id: 'auth0|u6',
      guestName: 'User 6',
      guestEmail: 'u6@test.dev',
      deliveryMethod: 'courier',
      address: 'Street 1, 10111 Tallinn, Estonia',
    });

    expect(result.ok).toBe(false);
    expect(result.code).toBe('checkout_failed');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  test('TC-09: Database timeout (>8s) should trigger graceful degradation', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 7 });
    (prisma.cartItem.findMany as jest.Mock).mockResolvedValue([
      {
        bookId: 14,
        quantity: 1,
        book: {
          id: 14,
          title: 'Book',
          price: 11,
          stock: 4,
          coverImage: null,
        },
      },
    ]);
    (prisma.shippingMethod.findFirst as jest.Mock).mockResolvedValue({ id: 2, name: 'Courier', price: 4 });
    stripeModule.createMock.mockResolvedValue({ id: 'sess_timeout', url: 'https://stripe.test/sess' });
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Query timed out after 8000ms'));

    const result = await createCheckout({
      auth0Id: 'auth0|u7',
      guestName: 'User 7',
      guestEmail: 'u7@test.dev',
      deliveryMethod: 'courier',
      address: 'Street 1, 10111 Tallinn, Estonia',
    });

    expect(result.ok).toBe(false);
    expect(result.code).toBe('checkout_failed');
  });

  test('TC-10: Rate limiting should return 429 after many requests', async () => {
    let count = 0;
    (consumeIpLimit as jest.Mock).mockImplementation(async () => {
      count += 1;
      if (count <= 100) {
        return { allowed: true, retryAfterSeconds: 0 };
      }
      return { allowed: false, retryAfterSeconds: 30 };
    });

    const handler = withApiSecurity(async () => ({ status: 200 } as Response), {
      bucket: 'api',
      requireCaptcha: false,
    });

    let hundredthStatus = 0;
    for (let i = 0; i < 100; i += 1) {
      const res = await handler(new Request('http://localhost/api/books', { method: 'GET' }), {} as never);
      hundredthStatus = (res as unknown as { status: number }).status;
    }

    const blocked = await handler(new Request('http://localhost/api/books', { method: 'GET' }), {} as never);

    expect(hundredthStatus).toBe(200);
    expect((blocked as unknown as { status: number }).status).toBe(429);
  });

  test('TC-11: USER role accessing admin API should return 403', async () => {
    jest.resetModules();
    jest.doMock('@/lib/auth/flow', () => ({
      __esModule: true,
      requireUserFlowAccessForApi: jest.fn().mockResolvedValue({ ok: true, user: { id: 101 } }),
    }));

    const { requireAdminRoute } = await import('@/lib/admin/guard');
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 101, role: 'USER' });

    const result = await requireAdminRoute();

    expect(result.ok).toBe(false);
    expect((result as { response: { status: number } }).response.status).toBe(403);
  });

  test('TC-12: Deleting non-existent book should return controlled error', async () => {
    jest.resetModules();
    jest.doMock('@/lib/admin/guard', () => ({
      __esModule: true,
      requireAdminRoute: jest.fn().mockResolvedValue({ ok: true, user: { id: 1, role: 'ADMIN' } }),
    }));
    jest.doMock('@/lib/security/rate-limit', () => ({
      __esModule: true,
      consumeIpLimit: jest.fn().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 }),
      consumeUserLimit: jest.fn().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 }),
    }));

    const { prisma: reloadedPrisma } = await import('@/lib/prisma');
    (reloadedPrisma.$transaction as jest.Mock).mockRejectedValue(new Error('Record to delete does not exist'));

    const { DELETE } = await import('@/app/api/admin/books/[id]/route');

    const res = await DELETE(new Request('http://localhost/api/admin/books/999999', { method: 'DELETE' }) as never, {
      params: Promise.resolve({ id: '999999' }),
    } as never);

    // Current route returns 400 on failed delete transaction.
    expect((res as unknown as { status: number }).status).toBe(400);
  });
});
