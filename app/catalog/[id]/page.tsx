import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "../../../lib/db";
import BookReviews from "@/components/BookReviews";

type BookPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type BookDetailsRow = {
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
  created_at: string | Date;
};

type ReviewStatsRow = {
  review_count: number | string;
  avg_rating: number | string | null;
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

function formatDate(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Дата не указана";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function BookDetailsPage({ params }: BookPageProps) {
  const { id } = await params;
  const bookId = Number(id);

  if (!Number.isInteger(bookId) || bookId <= 0) {
    notFound();
  }

  const [bookRows] = await pool.query(
    `SELECT
      b.id,
      b.title,
      a.name AS author,
      c.name AS category,
      b.description,
      b.price,
      b.language,
      b.publication_year,
      b.stock,
      b.rating,
      b.cover_image,
      b.created_at
    FROM books b
    LEFT JOIN authors a ON b.author_id = a.id
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = ?
    LIMIT 1`,
    [bookId]
  ) as [BookDetailsRow[], any];

  const book = bookRows[0];

  if (!book) {
    notFound();
  }

  const [reviewStatsRows] = await pool.query(
    `SELECT COUNT(*) AS review_count, AVG(rating) AS avg_rating
     FROM reviews
     WHERE book_id = ?`,
    [bookId]
  ) as [ReviewStatsRow[], any];

  const reviewStats = reviewStatsRows[0] || { review_count: 0, avg_rating: null };
  const reviewCount = Number(reviewStats.review_count || 0);
  const displayRating = reviewCount > 0 ? reviewStats.avg_rating : book.rating;
  const inStock = Number(book.stock ?? 0) > 0;
  const cover = normalizeImageUrl(book.cover_image);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-300">
          <Link href="/" className="transition hover:text-blue-600">Главная</Link>
          <span>•</span>
          <Link href="/catalog" className="transition hover:text-blue-600">Каталог</Link>
          <span>•</span>
          <span className="text-gray-700 dark:text-gray-100">{book.title}</span>
        </div>

        <section className="grid gap-8 rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-800 lg:grid-cols-[360px_1fr]">
          <div className="overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-700">
            {cover ? (
              <img src={cover} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-[520px] items-center justify-center text-gray-500 dark:text-gray-300">
                Нет обложки
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                Книга #{book.id}
              </p>
              <h1 className="text-4xl font-bold leading-tight">{book.title}</h1>
              <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
                {book.author || "Автор не указан"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm font-medium text-gray-700 dark:text-gray-100">
              {book.category && (
                <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700">{book.category}</span>
              )}
              {book.language && (
                <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700">Язык: {book.language}</span>
              )}
              {book.publication_year && (
                <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700">Год: {book.publication_year}</span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-300">Цена</div>
                <div className="mt-2 text-2xl font-bold">€{formatNumber(book.price)}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-300">Рейтинг</div>
                <div className="mt-2 text-2xl font-bold">★ {formatNumber(displayRating, 1)}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-300">Отзывы</div>
                <div className="mt-2 text-2xl font-bold">{reviewCount}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-700">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Описание</h2>
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
              <p className="whitespace-pre-line text-sm leading-7 text-gray-600 dark:text-gray-300">
                {book.description || "Описание для этой книги пока не добавлено."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-300">ID книги</div>
                <div className="mt-1 font-semibold">{book.id}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-300">Категория</div>
                <div className="mt-1 font-semibold">{book.category || "Не указана"}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-300">Добавлена</div>
                <div className="mt-1 font-semibold">{formatDate(book.created_at)}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-300">Остаток</div>
                <div className="mt-1 font-semibold">{Number(book.stock ?? 0)} шт.</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className={`rounded-xl px-5 py-3 text-sm font-medium text-white transition ${
                  inStock ? "bg-blue-600 hover:bg-blue-700" : "cursor-not-allowed bg-gray-400"
                }`}
                disabled={!inStock}
              >
                Добавить в корзину
              </button>
              <Link
                href="/catalog"
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                Вернуться в каталог
              </Link>
            </div>
          </div>
        </section>

        <BookReviews bookId={bookId} />
      </div>
    </main>
  );
}
