"use client";

import CatalogHeader from "@/components/CatalogHeader";
import Link from "next/link";
import { useEffect, useState } from "react";

type CatalogBookRow = {
  id: number;
  title: string;
  author: string | null;
  category: string | null;
  description: string | null;
  price: number | string;
  language: string | null;
  publication_year: number | null;
  stock: number | null;
  rating: number | string | null;
  cover_image: string | null;
};

function normalizeImageUrl(url: string | null) {
  if (!url) return null;
  if (url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `/images/${url}`;
}

function formatNumber(value: number | string | null, digits = 2) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(digits) : digits === 2 ? "0.00" : "0.0";
}

export default function CatalogPage() {
  const [books, setBooks] = useState<CatalogBookRow[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadBooks() {
      try {
        setIsLoading(true);
        setHasError(false);

        const response = await fetch("/api/books", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }

        const data = (await response.json()) as { books?: CatalogBookRow[] };

        if (!cancelled) {
          setBooks(data.books ?? []);
        }
      } catch (error) {
        console.error("Failed to load catalog books:", error);
        if (!cancelled) {
          setHasError(true);
          setBooks([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <CatalogHeader />
      <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-800 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              Каталог
            </p>
            <h1 className="text-3xl font-bold">Все книги из базы данных</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
              На странице выводятся все книги из таблицы `books` с автором, категорией, ценой, рейтингом и наличием.
            </p>
          </div>

          <div className="rounded-2xl bg-gray-100 px-5 py-4 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-100">
            Всего книг: <span className="font-semibold">{books.length}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
              >
                <div className="h-72 animate-pulse bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-4 p-6">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : hasError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            Не удалось загрузить каталог из базы данных. Проверь подключение к MySQL и параметры в `.env.local`.
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            В базе данных пока нет книг.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => {
              const cover = normalizeImageUrl(book.cover_image);
              const inStock = Number(book.stock ?? 0) > 0;

              return (
                <article
                  key={book.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800 dark:ring-gray-700"
                >
                  <div className="flex h-72 items-center justify-center overflow-hidden bg-white p-4 dark:bg-gray-700">
                    {cover ? (
                      <img
                        src={cover}
                        alt={book.title}
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-300">Нет обложки</span>
                    )}
                  </div>

                  <div className="space-y-4 p-6">
                    <div>
                      <h2 className="line-clamp-2 text-xl font-semibold">{book.title}</h2>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                        {book.author || "Автор не указан"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-600 dark:text-gray-200">
                      {book.category && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700">{book.category}</span>
                      )}
                      {book.language && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700">{book.language}</span>
                      )}
                      {book.publication_year && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700">{book.publication_year}</span>
                      )}
                    </div>

                    <p className="min-h-12 text-sm text-gray-600 dark:text-gray-300">
                      {book.description || "Описание для этой книги пока не добавлено."}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">€{formatNumber(book.price)}</div>
                        <div className="text-sm text-amber-600 dark:text-amber-400">
                          ★ {formatNumber(book.rating, 1)}
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          inStock
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        }`}
                      >
                        {inStock ? `В наличии: ${book.stock}` : "Нет в наличии"}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/catalog/${book.id}`}
                        className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-blue-700"
                      >
                        Открыть книгу
                      </Link>
                      <Link
                        href="/"
                        className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                      >
                        Главная
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      </main>
    </>
  );
}
