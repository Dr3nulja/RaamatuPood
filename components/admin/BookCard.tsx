'use client';

import Button from '@/components/ui/Button';
import { normalizeCover } from '@/components/admin/shared';
import type { AdminBook } from '@/lib/api/adminTypes';

type BookCardProps = {
  book: AdminBook;
  onEdit: (book: AdminBook) => void;
  onDelete: (book: AdminBook) => void;
  isDeleting?: boolean;
};

export default function BookCard({ book, onEdit, onDelete, isDeleting = false }: BookCardProps) {
  const coverUrl = normalizeCover(book.cover_image);
  const primaryAuthor = book.author_names[0] || book.author_name || 'No author';
  const extraAuthors = Math.max(book.author_names.length - 1, 0);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-amber-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-50 via-white to-zinc-50">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-amber-700">
            No cover
          </div>
        )}

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur">
            Stock: {book.stock}
          </span>

          <div className="flex gap-2 rounded-full bg-white/90 p-1 shadow-sm backdrop-blur opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={() => onEdit(book)}
              className="rounded-full px-3 py-1 text-xs font-semibold shadow-none"
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="danger"
              size="small"
              disabled={isDeleting}
              onClick={() => onDelete(book)}
              className="rounded-full px-3 py-1 text-xs font-semibold shadow-none"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-zinc-900">
            {book.title}
          </h3>
          <p className="text-2xl font-bold leading-none text-amber-700">€{book.price.toFixed(2)}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            {primaryAuthor}
          </span>
          {extraAuthors > 0 ? (
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
              +{extraAuthors} more
            </span>
          ) : null}
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {book.category_name || 'No category'}
          </span>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-600">
          {book.description || 'No description'}
        </p>
      </div>
    </article>
  );
}