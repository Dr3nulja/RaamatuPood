'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { BookWithRelations } from '@/lib/api/catalogTypes';

type BookCardProps = {
  book: BookWithRelations;
  onAddToCart: (bookId: number) => Promise<{ ok: boolean; message: string }>;
};

function normalizeImageUrl(url: string | null) {
  if (!url) return null;
  if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `/images/${url}`;
}

export default function BookCard({ book, onAddToCart }: BookCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const cover = useMemo(() => normalizeImageUrl(book.cover_image), [book.cover_image]);
  const inStock = book.stock > 0;

  const handleAdd = async () => {
    if (!inStock || isAdding) {
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
        {cover ? (
          <img
            src={cover}
            alt={book.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-amber-500">Нет обложки</div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-base font-semibold text-zinc-900">{book.title}</h3>
          <p className="mt-1 text-sm text-zinc-600">{book.author?.name || 'Автор не указан'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">
            {book.category?.name || 'Без категории'}
          </span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700">
            ★ {book.rating ? book.rating.toFixed(1) : '0.0'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-amber-800">€{book.price.toFixed(2)}</p>
          <span className={`text-xs font-semibold ${inStock ? 'text-emerald-700' : 'text-red-600'}`}>
            {inStock ? `В наличии: ${book.stock}` : 'Нет в наличии'}
          </span>
        </div>

        {feedback && <p className="text-xs font-medium text-amber-700">{feedback}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={!inStock || isAdding}
            className="flex-1 rounded-xl bg-amber-800 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {isAdding ? 'Добавление...' : 'Add to cart'}
          </button>
          <Link
            href={`/catalog/${book.id}`}
            className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
          >
            Подробнее
          </Link>
        </div>
      </div>
    </article>
  );
}
