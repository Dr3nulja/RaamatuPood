import prisma from '@/lib/prisma';
import HomePageContent, { type HomePageBook } from '../components/HomePageContent';
import { withPrismaProtection } from '@/lib/security/prisma';

async function loadBooksSafely() {
  try {
    const [popularBooks, recommendedBooks] = await Promise.all([
      withPrismaProtection(() => prisma.book.findMany({
        select: {
          id: true,
          title: true,
          rating: true,
          coverImage: true,
          bookAuthors: {
            orderBy: {
              authorId: 'asc',
            },
            select: {
              author: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          rating: 'desc',
        },
        take: 12,
      })),
      withPrismaProtection(() => prisma.book.findMany({
        select: {
          id: true,
          title: true,
          rating: true,
          coverImage: true,
          bookAuthors: {
            orderBy: {
              authorId: 'asc',
            },
            select: {
              author: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 8,
      })),
    ]);

    return { popularBooks, recommendedBooks };
  } catch {
    return { popularBooks: [], recommendedBooks: [] };
  }
}

export default async function Home() {
  const { popularBooks, recommendedBooks } = await loadBooksSafely();

  const toHomeBook = (book: (typeof popularBooks)[number]): HomePageBook => ({
    id: book.id,
    title: book.title,
    rating: Number(book.rating ?? 0),
    coverImage: book.coverImage,
    authors: book.bookAuthors.map((bookAuthor) => bookAuthor.author.name),
  });

  return (
    <HomePageContent
      popularBooks={popularBooks.map(toHomeBook)}
      recommendedBooks={recommendedBooks.map(toHomeBook)}
    />
  );
}