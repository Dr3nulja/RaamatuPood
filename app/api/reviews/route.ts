import { NextRequest, NextResponse } from 'next/server';
import { OrderStatus, Prisma } from '@prisma/client';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import type { ApiErrorResponse } from '@/lib/api/types';
import type { CreateReviewApiResponse, ReviewsApiResponse } from '@/lib/api/catalogTypes';

type CreateReviewBody = {
  bookId?: number;
  rating?: number;
  comment?: string;
};

function parseBookId(value: string | null): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

async function getSessionUserId() {
  const session = await auth0.getSession();
  const auth0Id = session?.user?.sub;

  if (!auth0Id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { auth0Id },
    select: { id: true },
  });

  return user?.id ?? null;
}

async function hasDeliveredOrderForBook(userId: number, bookId: number) {
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      bookId,
      order: {
        userId,
        status: OrderStatus.DELIVERED,
      },
    },
    select: { id: true },
  });

  return Boolean(orderItem);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = parseBookId(searchParams.get('bookId'));

    if (!bookId) {
      const response: ApiErrorResponse = { error: 'Invalid bookId' };
      return NextResponse.json(response, { status: 400 });
    }

    const [reviews, stats, userId] = await Promise.all([
      prisma.review.findMany({
        where: { bookId },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.review.aggregate({
        where: { bookId },
        _count: { id: true },
        _avg: { rating: true },
      }),
      getSessionUserId(),
    ]);

    let canReview = false;
    let hasReviewed = false;

    if (userId) {
      const [eligibleByDelivery, existingReview] = await Promise.all([
        hasDeliveredOrderForBook(userId, bookId),
        prisma.review.findFirst({
          where: { userId, bookId },
          select: { id: true },
        }),
      ]);

      hasReviewed = Boolean(existingReview);
      canReview = eligibleByDelivery && !hasReviewed;
    }

    const response: ReviewsApiResponse = {
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating ?? 0,
        comment: review.comment,
        created_at: review.createdAt.toISOString(),
        user: {
          name: review.user?.name ?? null,
        },
      })),
      reviewCount: stats._count.id,
      averageRating: Number(stats._avg.rating ?? 0),
      canReview,
      hasReviewed,
      isAuthenticated: Boolean(userId),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Failed to load reviews:', error);
    const response: ApiErrorResponse = { error: 'Failed to load reviews' };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      const response: ApiErrorResponse = { error: 'Unauthorized' };
      return NextResponse.json(response, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as CreateReviewBody | null;
    const bookId = body?.bookId;
    const rating = body?.rating;
    const comment = body?.comment?.trim() || null;

    if (!bookId || !Number.isInteger(bookId) || bookId <= 0) {
      const response: ApiErrorResponse = { error: 'Invalid bookId' };
      return NextResponse.json(response, { status: 400 });
    }

    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      const response: ApiErrorResponse = { error: 'Rating must be an integer from 1 to 5' };
      return NextResponse.json(response, { status: 400 });
    }

    if (comment && comment.length > 2000) {
      const response: ApiErrorResponse = { error: 'Comment is too long' };
      return NextResponse.json(response, { status: 400 });
    }

    const [bookExists, eligibleByDelivery, existingReview] = await Promise.all([
      prisma.book.findUnique({ where: { id: bookId }, select: { id: true } }),
      hasDeliveredOrderForBook(userId, bookId),
      prisma.review.findFirst({ where: { userId, bookId }, select: { id: true } }),
    ]);

    if (!bookExists) {
      const response: ApiErrorResponse = { error: 'Book not found' };
      return NextResponse.json(response, { status: 404 });
    }

    if (!eligibleByDelivery) {
      const response: ApiErrorResponse = { error: 'You can review this book only after delivery' };
      return NextResponse.json(response, { status: 403 });
    }

    if (existingReview) {
      const response: ApiErrorResponse = { error: 'You have already reviewed this book' };
      return NextResponse.json(response, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        bookId,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const stats = await prisma.review.aggregate({
      where: { bookId },
      _avg: { rating: true },
    });

    const averageRating = Number(stats._avg.rating ?? 0);

    await prisma.book.update({
      where: { id: bookId },
      data: {
        rating: new Prisma.Decimal(averageRating.toFixed(1)),
      },
    });

    const response: CreateReviewApiResponse = {
      review: {
        id: review.id,
        rating: review.rating ?? 0,
        comment: review.comment,
        created_at: review.createdAt.toISOString(),
        user: {
          name: review.user?.name ?? null,
        },
      },
      averageRating,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Failed to create review:', error);
    const response: ApiErrorResponse = { error: 'Failed to create review' };
    return NextResponse.json(response, { status: 500 });
  }
}