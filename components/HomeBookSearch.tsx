'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { BooksApiResponse, BookWithRelations } from '@/lib/api/catalogTypes';
import { useTranslation } from '@/hooks/useTranslation';

type HomeBookSearchProps = {
  placeholder?: string;
};

function resolveCover(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `/images/${url}`;
}

export default function HomeBookSearch({
  placeholder,
}: HomeBookSearchProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<BookWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const loadBooks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/books?search=${encodeURIComponent(debouncedQuery)}&limit=10`, {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to load search results');
        }

        const payload = (await response.json()) as BooksApiResponse;
        if (isMounted) {
          setResults(Array.isArray(payload.books) ? payload.books : []);
          setIsPanelOpen(true);
        }
      } catch {
        if (isMounted) {
          setResults([]);
          setIsPanelOpen(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadBooks();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [debouncedQuery]);

  const showPanel = useMemo(
    () => isPanelOpen && (Boolean(debouncedQuery) || isLoading),
    [debouncedQuery, isLoading, isPanelOpen]
  );
  const resolvedPlaceholder = placeholder || t('catalog.searchPlaceholder');

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
        <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6 6a7.5 7.5 0 0 0 10.65 10.65Z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsPanelOpen(true);
          }}
          placeholder={resolvedPlaceholder}
          className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
        />
      </div>

      <div
        className={`absolute left-0 right-0 z-30 mt-3 origin-top rounded-2xl border border-border bg-surface shadow-xl transition-all duration-300 ${
          showPanel ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-2 scale-[0.98] opacity-0'
        }`}
      >
        <div className="max-h-[440px] overflow-y-auto p-3">
          {isLoading ? (
            <p className="px-3 py-6 text-sm text-text-secondary">{t('catalog.loading')}</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-sm text-text-secondary">{t('catalog.noResults')}</p>
          ) : (
            <div className="space-y-2">
              {results.map((book) => (
                <article
                  key={book.id}
                  className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-xl border border-border bg-surface-muted p-3"
                >
                  <div className="h-14 w-14 overflow-hidden rounded-lg bg-background-muted">
                    {resolveCover(book.cover_image || book.cover_url) ? (
                      <img
                        src={resolveCover(book.cover_image || book.cover_url) || ''}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-secondary">No cover</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{book.title}</p>
                    <p className="truncate text-xs text-text-secondary">{book.author?.name || t('catalog.unknownAuthor')}</p>
                    <p className="text-xs text-secondary">★ {(book.rating ?? 0).toFixed(1)}</p>
                  </div>
                  <Link
                    href={`/catalog/${book.id}`}
                    onClick={() => setIsPanelOpen(false)}
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-secondary transition hover:bg-primary-soft"
                  >
                    {t('catalog.details')}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
