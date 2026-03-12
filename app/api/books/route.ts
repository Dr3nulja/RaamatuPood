import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [rows] = await pool.query(
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
        b.cover_image
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      ORDER BY b.title ASC`
    ) as [
      {
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
      }[],
      unknown
    ];

    return NextResponse.json({ books: rows });
  } catch (error) {
    console.error("Failed to load books:", error);
    return NextResponse.json(
      { error: "Failed to load books from database" },
      { status: 500 }
    );
  }
}
