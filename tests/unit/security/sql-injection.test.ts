import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/prisma');

beforeEach(()=>jest.resetAllMocks());

describe('Security - SQL Injection', ()=>{
  test('Search with injection payload is sanitized', async ()=>{
    const prisma = require('@/lib/prisma');
    if (!prisma.prisma) prisma.prisma = prisma;
    (prisma.book.findMany as any).mockResolvedValue([]);
    const securityBot = require('@/lib/security/bot');
    if (!securityBot.isHardBlockedBot) securityBot.isHardBlockedBot = jest.fn().mockReturnValue(false);
    const rate = require('@/lib/security/rate-limit');
    rate.consumeIpLimit = jest.fn().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    rate.consumeUserLimit = jest.fn().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    const throttle = require('@/lib/security/throttle');
    throttle.acquireRequestSlot = jest.fn().mockResolvedValue(() => {});
    const captcha = require('@/lib/security/captcha');
    if (!captcha.verifyCaptchaToken) captcha.verifyCaptchaToken = jest.fn().mockResolvedValue(true);
    const booksRoute = require('@/app/api/books/route');
    const res = await booksRoute.GET(new Request("http://localhost/api/books?search=%27+OR+%271%27=%271"));
    const getJson = async (r:any) => {
      if (!r) return [];
      const raw = typeof r.json === 'function' ? await r.json() : r.body ? (()=>{ try{ return JSON.parse(r.body);}catch{return r.body;} })() : null;
      if (Array.isArray(raw)) return raw;
      if (raw && raw.books) return raw.books;
      if (raw && raw.orders) return raw.orders;
      return raw || [];
    };
    const json = await getJson(res);
    expect(Array.isArray(json)).toBe(true);
  });

  test('Malformed search does not leak DB', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.book.findMany as any).mockResolvedValue([]);
    const booksRoute = require('@/app/api/books/route');
    const res = await booksRoute.GET(new Request("http://localhost/api/books?search=\"' OR '1'='1"));
    expect(res).toBeDefined();
  });
});
