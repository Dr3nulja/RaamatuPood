import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "../../../lib/db";
import { buildBookCoverImageSrc } from "@/lib/books/cover";
import BookDetailsClient from "@/components/BookDetailsClient";

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
  cover_image_data: Buffer | null;
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
      GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS category,
      b.description,
      b.price,
      b.language,
      b.publication_year,
      b.stock,
      b.rating,
      b.cover_image,
      b.cover_image_data,
      b.created_at
    FROM books b
    LEFT JOIN book_authors ba ON ba.book_id = b.id
    LEFT JOIN authors a ON ba.author_id = a.id
    LEFT JOIN book_categories bc ON bc.book_id = b.id
    LEFT JOIN categories c ON bc.category_id = c.id
    WHERE b.id = ?
    GROUP BY b.id, b.title, b.description, b.price, b.language, b.publication_year, b.stock, b.rating, b.cover_image, b.cover_image_data, b.created_at
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
  const cover = buildBookCoverImageSrc(book.id, book.cover_image, book.cover_image_data) || normalizeImageUrl(book.cover_image);

  return (
    <BookDetailsClient
      book={{
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        description: book.description,
        price: Number(book.price),
        language: book.language,
        publication_year: book.publication_year,
        stock: book.stock,
        rating: displayRating,
        cover_image: cover,
        created_at: book.created_at,
      }}
      reviewCount={reviewCount}
      bookId={bookId}
    />
  );
}
