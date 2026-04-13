import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiErrorResponse } from '@/lib/api/types';
import type { BooksApiResponse, BooksSort } from '@/lib/api/catalogTypes';
import { withApiSecurity } from '@/lib/security/api-guard';

export const dynamic = 'force-dynamic';

function parseSort(value: string | null): BooksSort | null {
  if (!value) return null;
  if (value === 'price_asc' || value === 'price_desc' || value === 'rating_desc') {
    return value;
  }
  return null;
}

async function getBooks(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const categoryIdParam = searchParams.get('categoryId');
    const sort = parseSort(searchParams.get('sort'));
    const limitRaw = searchParams.get('limit');
    const parsedLimit = limitRaw ? Number(limitRaw) : null;

    const categoryIdNumber = Number(categoryIdParam);
    const categoryId = categoryIdParam && Number.isInteger(categoryIdNumber) && categoryIdNumber > 0
      ? categoryIdNumber
      : null;

    const shouldLimitToTen = search && !categoryId && !sort;
    const limitValue = shouldLimitToTen
      ? 10
      : parsedLimit !== null && Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 20)
        : 20;

    const where = {
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
              { bookAuthors: { some: { author: { name: { contains: search } } } } },
            ],
          }
        : {}),
      ...(categoryId ? { categoryId } : {}),
    };

    const orderBy =
      sort === 'price_asc'
        ? { price: 'asc' as const }
        : sort === 'price_desc'
          ? { price: 'desc' as const }
          : sort === 'rating_desc'
            ? { rating: 'desc' as const }
            : { title: 'asc' as const };

    const books = await prisma.book.findMany({
      where,
      orderBy,
      take: limitValue,
      select: {
        id: true,
        title: true,
        price: true,
        rating: true,
        coverImage: true,
        stock: true,
        bookAuthors: {
          orderBy: {
            authorId: 'asc',
          },
          select: {
            author: {
              select: {
                name: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const response: BooksApiResponse = {
      books: books.map((book) => ({
        id: book.id,
        title: book.title,
        price: Number(book.price),
        rating: book.rating ? Number(book.rating) : null,
        cover_image: book.coverImage,
        cover_url: book.coverImage,
        stock: book.stock,
        author: book.bookAuthors[0]?.author ? { name: book.bookAuthors[0].author.name } : null,
        category: book.category
          ? {
              id: book.category.id,
              name: book.category.name,
            }
          : null,
      })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Failed to load books:', error);
    const response: ApiErrorResponse = { error: 'Failed to load books from database' };
    return NextResponse.json(response, { status: 500 });
  }
}

export const GET = withApiSecurity(getBooks, {
  bucket: 'search',
});