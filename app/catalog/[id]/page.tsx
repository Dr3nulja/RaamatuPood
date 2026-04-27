import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "../../../lib/db";
import BookReviews from "@/components/BookReviews";
import AddToCartButton from "@/components/AddToCartButton";

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
    return "Date not specified";
  }

  return new Intl.DateTimeFormat("en-US", {
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
      GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') AS author,
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
    LEFT JOIN book_authors ba ON ba.book_id = b.id
    LEFT JOIN authors a ON ba.author_id = a.id
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = ?
    GROUP BY b.id, b.title, c.name, b.description, b.price, b.language, b.publication_year, b.stock, b.rating, b.cover_image, b.created_at
    LIMIT 1`,
    [bookId]
  ) as [BookDetailsRow[], unknown];

  const book = bookRows[0];

  if (!book) {
    notFound();
  }

  const [reviewStatsRows] = await pool.query(
    `SELECT COUNT(*) AS review_count, AVG(rating) AS avg_rating
     FROM reviews
     WHERE book_id = ?`,
    [bookId]
  ) as [ReviewStatsRow[], unknown];

  const reviewStats = reviewStatsRows[0] || { review_count: 0, avg_rating: null };
  const reviewCount = Number(reviewStats.review_count || 0);
  const displayRating = reviewCount > 0 ? reviewStats.avg_rating : book.rating;
  const inStock = Number(book.stock ?? 0) > 0;
  const cover = normalizeImageUrl(book.cover_image);

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
          <Link href="/" className="transition hover:text-secondary">Home</Link>
          <span>•</span>
          <Link href="/catalog" className="transition hover:text-secondary">Catalog</Link>
          <span>•</span>
          <span className="text-zinc-800">{book.title}</span>
        </div>

        <section className="grid gap-8 rounded-3xl bg-white p-8 shadow-sm lg:grid-cols-[360px_1fr]">
          <div className="overflow-hidden rounded-3xl bg-amber-50">
            {cover ? (
              <img src={cover} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-[520px] items-center justify-center text-zinc-500">
                No cover
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Book #{book.id}
              </p>
              <h1 className="text-4xl font-bold leading-tight">{book.title}</h1>
              <p className="mt-3 text-lg text-zinc-600">
                {book.author || "Author not specified"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm font-medium text-zinc-700">
              {book.category && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">{book.category}</span>
              )}
              {book.language && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">Language: {book.language}</span>
              )}
              {book.publication_year && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">Year: {book.publication_year}</span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-background-muted p-4">
                <div className="text-sm text-zinc-600">Price</div>
                <div className="mt-2 text-2xl font-bold">€{formatNumber(book.price)}</div>
              </div>
              <div className="rounded-2xl bg-background-muted p-4">
                <div className="text-sm text-zinc-600">Rating</div>
                <div className="mt-2 text-2xl font-bold">★ {formatNumber(displayRating, 1)}</div>
              </div>
              <div className="rounded-2xl bg-background-muted p-4">
                <div className="text-sm text-zinc-600">Reviews</div>
                <div className="mt-2 text-2xl font-bold">{reviewCount}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Description</h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    inStock
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {inStock ? `In stock: ${book.stock}` : "Out of stock"}
                </span>
              </div>
              <p className="whitespace-pre-line text-sm leading-7 text-zinc-700">
                {book.description || "Description for this book has not been added yet."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-background-muted p-4">
                <div className="text-sm text-zinc-600">Book ID</div>
                <div className="mt-1 font-semibold">{book.id}</div>
              </div>
              <div className="rounded-2xl bg-background-muted p-4">
                <div className="text-sm text-zinc-600">Category</div>
                <div className="mt-1 font-semibold">{book.category || "Not specified"}</div>
              </div>
              <div className="rounded-2xl bg-background-muted p-4">
                <div className="text-sm text-zinc-600">Added</div>
                <div className="mt-1 font-semibold">{formatDate(book.created_at)}</div>
              </div>
              <div className="rounded-2xl bg-background-muted p-4">
                <div className="text-sm text-zinc-600">Stock</div>
                <div className="mt-1 font-semibold">{Number(book.stock ?? 0)} pcs.</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <AddToCartButton
                book={{
                  id: book.id,
                  title: book.title,
                  author: book.author || undefined,
                  price: Number(book.price),
                  cover_image: cover || undefined,
                  stock: book.stock,
                }}
                className={!inStock ? "bg-zinc-400 hover:bg-zinc-400" : ""}
              />
              <Link
                href="/catalog"
                className="rounded-xl border border-amber-300 px-5 py-3 text-sm font-medium text-secondary transition hover:bg-amber-50"
              >
                Back to catalog
              </Link>
            </div>
          </div>
        </section>

        <BookReviews bookId={bookId} />
      </div>
    </main>
  );
}
