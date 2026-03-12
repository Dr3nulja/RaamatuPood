import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export const dynamic = "force-dynamic";


type Book = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  language: string | null;
  publication_year: number | null;
  stock: number;
  rating: number | null;
  cover_image: string | null;
  author: string | null;
  category: string | null;
};

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        language: true,
        publicationYear: true,
        stock: true,
        rating: true,
        coverImage: true,
        author: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        title: "asc",
      },
    });

    
    const formattedBooks: Book[] = books.map((book: typeof books[0]) => ({
      id: book.id,
      title: book.title,
      author: book.author?.name || null,
      category: book.category?.name || null,
      description: book.description,
      price: Number(book.price),
      language: book.language,
      publication_year: book.publicationYear,
      stock: book.stock,
      rating: book.rating ? Number(book.rating) : null,
      cover_image: book.coverImage,
    }));

    return NextResponse.json({ books: formattedBooks });
  } catch (error) {
    console.error("Failed to load books:", error);
    return NextResponse.json(
      { error: "Failed to load books from database" },
      { status: 500 }
    );
  }
}