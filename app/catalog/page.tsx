'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import type {
  BookWithRelations,
  BooksApiResponse,
  BooksSort,
  CategoriesApiResponse,
  CategoryOption,
} from '@/lib/api/catalogTypes';
import type { ApiErrorResponse } from '@/lib/api/types';
import { createClickGuard } from '@/lib/security/frontend';
import { useTranslation } from '@/hooks/useTranslation';

const SEARCH_DEBOUNCE_MS = 400;
const BOOKS_REFETCH_INTERVAL_MS = 5000;

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='600' height='800' fill='%23f5f5f4'/><text x='300' y='410' text-anchor='middle' font-family='Arial' font-size='28' fill='%238b5e3c'>No cover</text></svg>";

const SORT_OPTIONS: Array<{
  value: BooksSort;
  labelKey: 'catalog.popularFirst' | 'catalog.priceLowToHigh' | 'catalog.priceHighToLow';
}> = [
  { value: 'rating_desc', labelKey: 'catalog.popularFirst' },
  { value: 'price_asc', labelKey: 'catalog.priceLowToHigh' },
  { value: 'price_desc', labelKey: 'catalog.priceHighToLow' },
];

function normalizeImageUrl(url: string | null) {
  if (!url) {
    return null;
  }

  if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `/images/${url}`;
}

function buildBooksQuery(params: { search: string; categoryId: string; sort: BooksSort }) {
  const query = new URLSearchParams();

  if (params.search.trim()) {
    query.set('search', params.search.trim());
  }

  if (params.categoryId) {
    query.set('categoryId', params.categoryId);
  }

  query.set('sort', params.sort);

  return query.toString();
}

export default function CatalogPage() {
  const addItem = useCartStore((state) => state.addItem);
  const { t, formatPrice } = useTranslation();
  const canClickAddToCart = useMemo(() => createClickGuard(500), []);
  const closeTimerRef = useRef<number | null>(null);
  const actionMessageTimerRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const savedScrollYRef = useRef(0);

  const [books, setBooks] = useState<BookWithRelations[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [sort, setSort] = useState<BooksSort>('rating_desc');
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [activeBookId, setActiveBookId] = useState<number | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);

        const response = await fetch('/api/categories', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to load categories');
        }

        const data = (await response.json()) as CategoriesApiResponse;
        if (isMounted) {
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        if (isMounted) {
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    const loadBooks = async (setLoading = true) => {
      if (isFetching) {
        return;
      }

      isFetching = true;
      try {
        if (setLoading) {
          setIsLoadingBooks(true);
          setBooksError(null);
        }

        const query = buildBooksQuery({
          search: debouncedSearch,
          categoryId: selectedCategoryId,
          sort,
        });

        const response = await fetch(`/api/books?${query}`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          const errorPayload = (await response.json().catch(() => null)) as ApiErrorResponse | null;
          throw new Error(errorPayload?.error || 'Failed to fetch books');
        }

        const data = (await response.json().catch(() => null)) as BooksApiResponse | null;
        if (!data || !Array.isArray(data.books)) {
          throw new Error('Invalid books payload');
        }

        if (isMounted) {
          setBooks(data.books);
          setBooksError(null);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.warn('Failed to load books:', error);
        setBooksError(t('catalog.error'));
        setBooks([]);
      } finally {
        if (isMounted && setLoading) {
          setIsLoadingBooks(false);
        }
        isFetching = false;
      }
    };

    void loadBooks();

    const intervalId = window.setInterval(() => {
      void loadBooks(false);
    }, BOOKS_REFETCH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [debouncedSearch, selectedCategoryId, sort, retryTick, t]);

  const totalLabel = useMemo(() => {
    if (isLoadingBooks) {
      return t('common.loading');
    }

    return t('catalog.foundBooks', { count: books.length });
  }, [books.length, isLoadingBooks, t]);

  const safeBooks = useMemo(
    () => books.filter((book): book is BookWithRelations => Boolean(book)),
    [books]
  );

  const openedBook = useMemo(
    () => safeBooks.find((book) => book.id === activeBookId) || null,
    [safeBooks, activeBookId]
  );

  useEffect(() => {
    if (activeBookId === null) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseOverlay();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onEscape);
    };
  }, [activeBookId]);

  useEffect(() => {
    if (activeBookId !== null || isOverlayOpen) {
      return;
    }

    const targetY = savedScrollYRef.current;
    if (Math.abs(window.scrollY - targetY) > 1) {
      window.scrollTo({ top: targetY, behavior: 'auto' });
    }
  }, [activeBookId, isOverlayOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }

      if (actionMessageTimerRef.current !== null) {
        window.clearTimeout(actionMessageTimerRef.current);
      }
    };
  }, []);

  const showActionMessage = (message: string) => {
    if (!message) {
      return;
    }

    setActionMessage(message);
    if (actionMessageTimerRef.current !== null) {
      window.clearTimeout(actionMessageTimerRef.current);
    }

    actionMessageTimerRef.current = window.setTimeout(() => {
      setActionMessage(null);
    }, 2200);
  };

  const handleOpenOverlay = (bookId: number) => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    savedScrollYRef.current = window.scrollY;
    setActiveBookId(bookId);
    window.requestAnimationFrame(() => {
      setIsOverlayOpen(true);
    });
  };

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      setActiveBookId(null);

      const targetY = savedScrollYRef.current;
      if (Math.abs(window.scrollY - targetY) > 1) {
        window.scrollTo({ top: targetY, behavior: 'auto' });
      }
    }, 500);
  };

  const handleOverlayTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleOverlayTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const startY = touchStartYRef.current;
    const endY = event.changedTouches[0]?.clientY ?? null;
    touchStartYRef.current = null;

    if (startY === null || endY === null) {
      return;
    }

    if (endY - startY > 120) {
      handleCloseOverlay();
    }
  };

  const handleAddToCart = async (bookId: number): Promise<{ ok: boolean; message: string }> => {
    if (!canClickAddToCart()) {
      return { ok: false, message: t('catalog.tooFrequent') };
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bookId,
          quantity: 1,
        }),
      });

      if (response.status === 401) {
        return { ok: false, message: t('catalog.loginToAdd') };
      }

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        return { ok: false, message: payload?.error || t('catalog.addFailed') };
      }

      const addedBook = books.find((book) => book.id === bookId);
      if (addedBook) {
        addItem({
          id: addedBook.id,
          title: addedBook.title,
          author: addedBook.author?.name || undefined,
          price: addedBook.price,
          cover_image: addedBook.cover_image || undefined,
        });
      }

      return { ok: true, message: t('catalog.addedToCart') };
    } catch {
      return { ok: false, message: t('catalog.actionFailed') };
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background-muted px-3 py-6 text-zinc-900 sm:px-4 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-amber-100 bg-white px-4 py-5 shadow-sm sm:mb-8 sm:px-6 sm:py-7 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">{t('catalog.title')}</p>
              <h1 className="mt-2 font-serif text-xl font-bold text-secondary sm:text-2xl md:text-4xl">{t('catalog.subtitle')}</h1>
              <p className="mt-2 text-sm text-zinc-600">{t('catalog.liveSearchHint')}</p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              {totalLabel}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full max-w-md">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                </svg>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={t('catalog.searchPlaceholder')}
                  className="w-full rounded-xl border border-amber-200 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 shadow-sm transition-all duration-300 placeholder:text-zinc-500 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div className="w-full md:w-auto md:min-w-[220px]">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{t('catalog.sortBy')}</p>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as BooksSort)}
                  className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm text-zinc-800 shadow-sm transition-all duration-300 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedCategoryId('')}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  selectedCategoryId === ''
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-amber-200 bg-white text-zinc-700 hover:bg-amber-50'
                }`}
              >
                {t('catalog.allCategories')}
              </button>

              {categories.map((category) => {
                const isActive = String(category.id) === selectedCategoryId;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(String(category.id))}
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-amber-200 bg-white text-zinc-700 hover:bg-amber-50'
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {isLoadingCategories && <p className="mt-3 text-xs text-zinc-500">{t('catalog.loadingCategories')}</p>}

          {actionMessage && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
              {actionMessage}
            </div>
          )}
        </div>

        {isLoadingBooks ? (
          <>
            <p className="mb-4 text-sm text-zinc-600">{t('catalog.loading')}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-full w-full overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-md sm:min-h-[480px]">
                  <div className="h-64 animate-pulse bg-amber-100 sm:h-72" />
                  <div className="flex flex-1 flex-col justify-between space-y-3 p-4 sm:h-[190px]">
                    <div className="h-4 w-4/5 animate-pulse rounded bg-amber-100" />
                    <div className="h-3 w-3/5 animate-pulse rounded bg-amber-100" />
                    <div className="h-10 animate-pulse rounded bg-amber-100" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : booksError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <p className="text-sm text-red-700">{booksError}</p>
            <div className="mt-3">
              <Button
                type="button"
                size="small"
                variant="outline"
                className="border-red-300 bg-white text-red-700 hover:bg-red-100"
                onClick={() => setRetryTick((prev) => prev + 1)}
              >
                {t('catalog.retry')}
              </Button>
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-6 py-10 text-center text-amber-900">
            {t('catalog.noResults')}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {safeBooks.map((book) => (
              <article
                key={book.id}
                className={`group h-full w-full overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-md transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-xl sm:min-h-[480px] ${
                  activeBookId === book.id ? 'scale-[1.02]' : 'scale-100'
                }`}
              >
                <div className="relative h-64 w-full overflow-hidden bg-amber-50 sm:h-72">
                  <img
                    src={normalizeImageUrl(book.cover_image) || PLACEHOLDER_IMAGE}
                    alt={book.title}
                    className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-amber-900 shadow-sm">
                    {book.rating && book.rating >= 4.6 ? t('catalog.popularBadge') : t('catalog.newBadge')}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4 p-4 sm:h-[220px]">
                  <div className="space-y-2">
                    <h3 className="line-clamp-2 text-base font-semibold text-zinc-900">{book.title}</h3>
                    <p className="line-clamp-1 text-sm text-zinc-600">{book.author?.name || t('catalog.unknownAuthor')}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="max-w-[60%] truncate rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">
                        {book.category?.name || t('catalog.uncategorized')}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700">
                        ★ {book.rating ? book.rating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xl font-bold text-secondary">{formatPrice(book.price)}</p>
                      <p className={`shrink-0 text-xs font-semibold ${book.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {book.stock > 0 ? t('catalog.inStock', { count: book.stock }) : t('catalog.outOfStock')}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        className="flex-1"
                        disabled={book.stock <= 0}
                        onClick={() => {
                          void handleAddToCart(book.id).then((result) => {
                            showActionMessage(result.message);
                          });
                        }}
                      >
                        {t('catalog.addToCart')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="small"
                        className="flex-1"
                        onClick={() => handleOpenOverlay(book.id)}
                      >
                        {t('catalog.details')}
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {openedBook ? (
        <div
          className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-md transition-all duration-500 ease-out ${
            isOverlayOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleCloseOverlay}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              handleCloseOverlay();
            }
          }}
        >
          <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
            <article
              className={`w-[95%] max-w-4xl origin-center overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-2xl transition-all duration-500 ease-out sm:w-full ${
                isOverlayOpen ? 'translate-y-0 scale-100 opacity-100 sm:scale-105' : 'translate-y-6 scale-95 opacity-0'
              }`}
              onClick={(event) => event.stopPropagation()}
              onTouchStart={handleOverlayTouchStart}
              onTouchEnd={handleOverlayTouchEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
                <div className="h-64 w-full bg-amber-50 sm:h-72 md:h-full">
                  <img
                    src={normalizeImageUrl(openedBook.cover_image) || PLACEHOLDER_IMAGE}
                    alt={openedBook.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between gap-6 p-6">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-900">{openedBook.title}</h2>
                    <p className="text-sm text-zinc-600">{t('catalog.authorLabel')}: {openedBook.author?.name || t('catalog.unknownAuthor')}</p>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                        <p className="text-zinc-500">{t('catalog.categoryLabel')}</p>
                        <p className="font-semibold text-zinc-900">{openedBook.category?.name || t('catalog.uncategorized')}</p>
                      </div>
                      <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                        <p className="text-zinc-500">{t('catalog.ratingLabel')}</p>
                        <p className="font-semibold text-zinc-900">★ {openedBook.rating ? openedBook.rating.toFixed(1) : '0.0'}</p>
                      </div>
                      <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                        <p className="text-zinc-500">{t('catalog.priceLabel')}</p>
                        <p className="font-semibold text-zinc-900">{formatPrice(openedBook.price)}</p>
                      </div>
                      <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                        <p className="text-zinc-500">{t('catalog.stockLabel')}</p>
                        <p className={`font-semibold ${openedBook.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {openedBook.stock > 0 ? t('catalog.stockUnits', { count: openedBook.stock }) : t('catalog.outOfStock')}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-100 bg-white p-4">
                      <p className="line-clamp-6 text-sm leading-relaxed text-zinc-700 sm:line-clamp-none">
                        {t('catalog.bookSummary')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      disabled={openedBook.stock <= 0}
                      onClick={() => {
                        void handleAddToCart(openedBook.id).then((result) => {
                          showActionMessage(result.message);
                        });
                      }}
                    >
                      {t('catalog.addToCart')}
                    </Button>
                    <Link
                      href={`/catalog/${openedBook.id}`}
                      className="inline-flex flex-1 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 transition-all duration-300 hover:bg-amber-100"
                    >
                      {t('catalog.openBookPage')}
                    </Link>
                    <Button type="button" variant="outline" onClick={handleCloseOverlay}>
                      {t('catalog.closeOverlay')}
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      ) : null}
    </main>
  );
}
