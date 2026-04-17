'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import type { CreateReviewApiResponse, ReviewsApiResponse } from '@/lib/api/catalogTypes';
import type { ApiErrorResponse } from '@/lib/api/types';
import Button from '@/components/ui/Button';

type BookReviewsProps = {
  bookId: number;
};

const emptyReviewsState: ReviewsApiResponse = {
  reviews: [],
  reviewCount: 0,
  averageRating: 0,
  canReview: false,
  hasReviewed: false,
  isAuthenticated: false,
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Дата не указана';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function BookReviews({ bookId }: BookReviewsProps) {
  const [reviewsData, setReviewsData] = useState<ReviewsApiResponse>(emptyReviewsState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reviews?bookId=${bookId}`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load reviews');
      }

      const payload = (await response.json()) as ReviewsApiResponse;
      setReviewsData(payload);
    } catch (loadError) {
      console.error('Failed to load reviews:', loadError);
      setReviewsData(emptyReviewsState);
      setError('Не удалось загрузить отзывы. Попробуйте обновить страницу.');
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const canShowForm = useMemo(
    () => reviewsData.isAuthenticated && reviewsData.canReview,
    [reviewsData]
  );

  const blockedMessage = useMemo(() => {
    if (!reviewsData.isAuthenticated) {
      return 'Войдите в аккаунт, чтобы оставить отзыв.';
    }

    if (reviewsData.hasReviewed) {
      return 'Вы уже оставили отзыв на эту книгу.';
    }

    return 'You can review this book only after delivery';
  }, [reviewsData]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bookId,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        throw new Error(payload?.error || 'Не удалось отправить отзыв');
      }

      await response.json().catch(() => null as CreateReviewApiResponse | null);
      setRating(5);
      setComment('');
      await loadReviews();
    } catch (createError) {
      setSubmitError(createError instanceof Error ? createError.message : 'Не удалось отправить отзыв');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Отзывы</h2>
        <span className="text-sm text-zinc-500">
          Средний рейтинг: <span className="font-semibold text-amber-600">★ {reviewsData.averageRating.toFixed(1)}</span>
          {' · '}
          Отзывов: <span className="font-semibold text-zinc-700">{reviewsData.reviewCount}</span>
        </span>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-600">
          Загрузка отзывов...
        </div>
      ) : (
        <>
          {canShowForm ? (
            <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="text-lg font-semibold">Оставить отзыв</h3>

              <div className="space-y-2">
                <label htmlFor="review-rating" className="text-sm font-medium">Оценка</label>
                <select
                  id="review-rating"
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                  className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
                >
                  <option value={5}>5 — Отлично</option>
                  <option value={4}>4 — Хорошо</option>
                  <option value={3}>3 — Нормально</option>
                  <option value={2}>2 — Плохо</option>
                  <option value={1}>1 — Очень плохо</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="review-comment" className="text-sm font-medium">Комментарий</label>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Поделитесь впечатлениями о книге"
                  className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
                />
              </div>

              {submitError && <p className="text-sm text-red-700">{submitError}</p>}

              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="bg-primary hover:bg-primary-hover"
              >
                {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
              </Button>
            </form>
          ) : (
            <div className="mb-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              {blockedMessage}
            </div>
          )}

          {reviewsData.reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-600">
              У этой книги пока нет отзывов.
            </div>
          ) : (
            <div className="space-y-4">
              {reviewsData.reviews.map((review) => (
                <article key={review.id} className="rounded-2xl bg-gray-50 p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{review.user.name || 'Покупатель'}</div>
                      <div className="text-sm text-gray-500">{formatDate(review.created_at)}</div>
                    </div>
                    <div className="text-sm font-semibold text-amber-600">
                      ★ {review.rating.toFixed(1)}
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-gray-700">
                    {review.comment || 'Без текста отзыва.'}
                  </p>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
