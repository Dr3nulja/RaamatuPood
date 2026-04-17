'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { BookWithRelations } from '@/lib/api/catalogTypes';
import Button from '@/components/ui/Button';

type BookCardProps = {
  book?: BookWithRelations | null;
  onAddToCart?: (bookId: number) => Promise<{ ok: boolean; message: string }>;
  title?: string;
  author?: string;
  cover?: string;
};

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='600' height='800' fill='%23f5f5f4'/><text x='300' y='410' text-anchor='middle' font-family='Arial' font-size='28' fill='%238b5e3c'>No cover</text></svg>";

function normalizeImageUrl(url: string | null) {
  if (!url) return null;
  if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `/images/${url}`;
}

export default function BookCard({ book, onAddToCart, title, author, cover }: BookCardProps) {
  const resolvedTitle = book?.title ?? title ?? '';
  const resolvedAuthor = book?.author?.name ?? author ?? 'Автор не указан';
  const resolvedCategory = book?.category?.name ?? 'Без категории';
  const resolvedRating = book?.rating ?? null;
  const resolvedPrice = book?.price ?? null;
  const resolvedStock = book?.stock ?? 0;
  const detailsHref = book?.id ? `/catalog/${book.id}` : '/catalog';
  const isCatalogMode = Boolean(book);

  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const normalizedCover = useMemo(
    () => normalizeImageUrl(book?.cover_image ?? cover ?? null),
    [book?.cover_image, cover]
  );
  const inStock = resolvedStock > 0;

  if (!book && !title) {
    return null;
  }

  const handleAdd = async () => {
    if (!book?.id || !onAddToCart || !inStock || isAdding) {
      return;
    }

    setIsAdding(true);
    const result = await onAddToCart(book.id);
    setFeedback(result.message);
    setIsAdding(false);

    window.setTimeout(() => {
      setFeedback(null);
    }, 1800);
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-amber-50">
        {normalizedCover ? (
          <img
            src={normalizedCover}
            alt={resolvedTitle}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <img
            src={PLACEHOLDER_IMAGE}
            alt="No cover"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-base font-semibold text-zinc-900">{resolvedTitle}</h3>
          <p className="mt-1 text-sm text-zinc-600">{resolvedAuthor}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">
            {resolvedCategory}
          </span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700">
            ★ {resolvedRating ? resolvedRating.toFixed(1) : '0.0'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-secondary">
            {resolvedPrice === null ? '—' : `€${resolvedPrice.toFixed(2)}`}
          </p>
          {isCatalogMode && (
            <span className={`text-xs font-semibold ${inStock ? 'text-emerald-700' : 'text-red-600'}`}>
              {inStock ? `In stock: ${resolvedStock}` : 'Out of stock'}
            </span>
          )}
        </div>

        {feedback && <p className="text-xs font-medium text-amber-700">{feedback}</p>}

        <div className="flex gap-2">
          {isCatalogMode && (
            <Button
              type="button"
              onClick={() => void handleAdd()}
              variant="secondary"
              disabled={!book?.id || !onAddToCart || !inStock || isAdding}
              loading={isAdding}
              className="flex-1 disabled:bg-zinc-300"
            >
              {isAdding ? 'Adding...' : 'Add to cart'}
            </Button>
          )}
          <Link
            href={detailsHref}
            className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
          >
            Подробнее
          </Link>
        </div>
      </div>
    </article>
  );
}
