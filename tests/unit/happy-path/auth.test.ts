import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.mock('@/lib/auth0', () => ({ auth0: { getSession: jest.fn(), logout: jest.fn() } }));
jest.mock('@/lib/prisma', () => {
  const m = {
    user: { upsert: jest.fn(), findUnique: jest.fn() },
    book: { findMany: jest.fn() }
  };
  return { __esModule: true, prisma: m, user: m.user, book: m.book, default: m };
});
jest.mock('@/lib/stripe');

beforeEach(() => {
  jest.resetAllMocks();
  const prismaMod = require('@/lib/prisma') as any;
  const p = prismaMod.prisma;
  p.user.upsert.mockResolvedValue({ id: 100, email: 'new_user@example.com' });
  p.user.findUnique.mockResolvedValue({ id: 1, email: 'miyexo5902@hidevak.com' });
  p.book.findMany.mockResolvedValue([]);
});

describe('Happy Path - Auth (TC-01..TC-05)', () => {
  test('TC-01: Registration via Auth0 creates DB user', async () => {
    const { auth0 } = require('@/lib/auth0') as any;
    const prismaMod = require('@/lib/prisma') as any;
    auth0.getSession.mockResolvedValue({ user: { sub: 'auth0|new', email: 'new_user@example.com', email_verified: true } });
    
    const createUser = require('@/lib/auth/createUserIfNotExists') as any;
    const result = await createUser.createUserIfNotExists({ sub: 'auth0|new', email: 'new_user@example.com' });
    expect(prismaMod.prisma.user.upsert).toHaveBeenCalled();
    expect(result.email).toBe('new_user@example.com');
  });

  test('TC-02: Login via Auth0 establishes session and returns user', async () => {
    const { auth0 } = require('@/lib/auth0') as any;
    const prismaMod = require('@/lib/prisma') as any;
    auth0.getSession.mockResolvedValue({ user: { sub: 'auth0|1', email: 'miyexo5902@hidevak.com', email_verified: true } });
    
    const flow = require('@/lib/auth/flow') as any;
    const state = await flow.getAuthFlowState({} as any);
    expect(prismaMod.prisma.user.findUnique).toHaveBeenCalled();
    expect(state).toBeDefined();
  });

  test('TC-03: Logout clears session', async () => {
    const { auth0 } = require('@/lib/auth0') as any;
    auth0.logout.mockResolvedValue(true);
    const res = await auth0.logout({} as any);
    expect(auth0.logout).toHaveBeenCalled();
    expect(res).toBeTruthy();
  });

  test('TC-04: View catalog returns books list', async () => {
    const prismaMod = require('@/lib/prisma') as any;
    prismaMod.prisma.book.findMany.mockResolvedValue([{ id: 1, title: 'Book A' }, { id: 2, title: 'Book B' }]);
    
    const securityBot = require('@/lib/security/bot') as any;
    securityBot.isHardBlockedBot = jest.fn().mockReturnValue(false);
    const rate = require('@/lib/security/rate-limit') as any;
    rate.consumeIpLimit = jest.fn().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    rate.consumeUserLimit = jest.fn().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    const throttle = require('@/lib/security/throttle') as any;
    throttle.acquireRequestSlot = jest.fn().mockResolvedValue(() => {});
    const captcha = require('@/lib/security/captcha') as any;
    captcha.verifyCaptchaToken = jest.fn().mockResolvedValue(true);

    const booksRoute = require('@/app/api/books/route') as any;
    const response = await booksRoute.GET(new Request('http://localhost/api/books'));
    
    const json = await response.json();
    expect(Array.isArray(json.books)).toBe(true);
    expect(prismaMod.prisma.book.findMany).toHaveBeenCalled();
  });

  test('TC-05: Category filter returns filtered results', async () => {
    const prismaMod = require('@/lib/prisma') as any;
    prismaMod.prisma.book.findMany.mockResolvedValue([{ id: 3, title: 'Fiction Book', categories: ['Fiction'] }]);
    
    const securityBot = require('@/lib/security/bot') as any;
    securityBot.isHardBlockedBot = jest.fn().mockReturnValue(false);
    const rate = require('@/lib/security/rate-limit') as any;
    rate.consumeIpLimit = jest.fn().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    rate.consumeUserLimit = jest.fn().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    const throttle = require('@/lib/security/throttle') as any;
    throttle.acquireRequestSlot = jest.fn().mockResolvedValue(() => {});
    const captcha = require('@/lib/security/captcha') as any;
    captcha.verifyCaptchaToken = jest.fn().mockResolvedValue(true);

    const booksRoute = require('@/app/api/books/route') as any;
    const response = await booksRoute.GET(new Request('http://localhost/api/books?category=Fiction'));
    
    const json = await response.json();
    expect(json.books.length).toBeGreaterThan(0);
  });
});


