import { jest } from '@jest/globals';

// Mock security wrapper to call handler directly
jest.mock('@/lib/security/api-guard', () => ({
  withApiSecurity: (h: any) => h,
}));

// Mock NextResponse.json to return plain object for easier assertions
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, opts?: any) => ({ status: opts?.status || 200, data }),
  },
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    book: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/books/cover', () => ({
  buildBookCoverImageSrc: (id: number) => `/covers/${id}.jpg`,
}));

import { GET } from '@/app/api/books/route';
import { prisma } from '@/lib/prisma';

describe('Catalog API — happy path', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns filtered books list', async () => {
    (prisma.book.findMany as jest.Mock).mockResolvedValue([
      {
        id: 1,
        title: 'Test Book',
        price: 5.5,
        rating: 4.5,
        coverImage: null,
        coverImageData: null,
        stock: 10,
        bookAuthors: [{ author: { name: 'Author A' } }],
        bookCategories: [{ category: { id: 2, name: 'Fiction' } }],
      },
    ]);

    const req = { url: 'http://localhost/api/books?search=Test', method: 'GET' } as any;
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.data.books).toHaveLength(1);
    expect(res.data.books[0].title).toBe('Test Book');
    expect(res.data.books[0].author.name).toBe('Author A');
  });
});
