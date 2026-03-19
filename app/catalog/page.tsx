'use client';

import { useEffect, useMemo, useState } from 'react';
import BookCard from '@/components/BookCard';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import SortSelect from '@/components/SortSelect';
import { useCartStore } from '@/stores/cartStore';
import type {
  BookWithRelations,
  BooksApiResponse,
  BooksSort,
  CategoriesApiResponse,
  CategoryOption,
} from '@/lib/api/catalogTypes';

const SEARCH_DEBOUNCE_MS = 400;
const BOOKS_REFETCH_INTERVAL_MS = 5000;

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

  const [books, setBooks] = useState<BookWithRelations[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [sort, setSort] = useState<BooksSort>('rating_desc');
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [booksError, setBooksError] = useState<string | null>(null);

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
          throw new Error('Failed to fetch books');
        }

        const data = (await response.json()) as BooksApiResponse;
        if (isMounted) {
          setBooks(data.books || []);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error('Failed to load books:', error);
        if (setLoading) {
          setBooksError('Не удалось загрузить каталог. Попробуйте обновить страницу.');
          setBooks([]);
        }
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
  }, [debouncedSearch, selectedCategoryId, sort]);

  const totalLabel = useMemo(() => {
    if (isLoadingBooks) {
      return 'Загрузка...';
    }

    return `${books.length}`;
  }, [books.length, isLoadingBooks]);

  const safeBooks = useMemo(
    () => books.filter((book): book is BookWithRelations => Boolean(book)),
    [books]
  );

  const handleAddToCart = async (bookId: number): Promise<{ ok: boolean; message: string }> => {
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
        return { ok: false, message: 'Войдите в аккаунт для добавления в корзину' };
      }

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        return { ok: false, message: payload?.error || 'Не удалось добавить книгу в корзину' };
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

      return { ok: true, message: 'Книга добавлена в корзину' };
    } catch {
      return { ok: false, message: 'Ошибка сети при добавлении в корзину' };
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FDF8F0] to-[#F5F0E8] px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-amber-100 bg-white px-6 py-7 shadow-sm md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Каталог</p>
              <h1 className="mt-2 font-serif text-4xl font-bold text-[#8B5E3C]">Книги</h1>
              <p className="mt-2 text-sm text-zinc-600">Поиск, фильтрация и сортировка в реальном времени</p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              Найдено книг: {totalLabel}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_240px_200px]">
            <SearchBar value={searchInput} onChange={setSearchInput} />
            <CategoryFilter
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onChange={setSelectedCategoryId}
            />
            <SortSelect value={sort} onChange={setSort} />
          </div>

          {isLoadingCategories && <p className="mt-3 text-xs text-zinc-500">Загрузка категорий...</p>}
        </div>

        {isLoadingBooks ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
                <div className="aspect-[3/4] animate-pulse bg-amber-100" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-4/5 animate-pulse rounded bg-amber-100" />
                  <div className="h-3 w-3/5 animate-pulse rounded bg-amber-100" />
                  <div className="h-10 animate-pulse rounded bg-amber-100" />
                </div>
              </div>
            ))}
          </div>
        ) : booksError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {booksError}
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-6 py-10 text-center text-amber-900">
            По вашему запросу ничего не найдено.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {safeBooks.map((book) => (
              <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
