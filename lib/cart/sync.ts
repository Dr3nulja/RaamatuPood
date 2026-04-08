import { prisma } from '@/lib/prisma';
import { normalizeSessionCartItems, type SessionCartItem } from '@/lib/cart/sessionCart';

export async function mergeSessionCartIntoDb(userId: number, sessionItems: SessionCartItem[]) {
  return prisma.$transaction(async (tx) => {
    const existingItems = await tx.cartItem.findMany({
      where: { userId },
      include: {
        book: {
          select: { stock: true },
        },
      },
    });

    const existingByBookId = new Map<number, { id: number; quantity: number; stock: number }>();

    for (const item of existingItems) {
      existingByBookId.set(item.bookId, {
        id: item.id,
        quantity: item.quantity,
        stock: item.book.stock,
      });
    }

    for (const existing of existingByBookId.values()) {
      if (existing.stock <= 0) {
        await tx.cartItem.delete({ where: { id: existing.id } });
        continue;
      }

      if (existing.quantity > existing.stock) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.stock },
        });
        existing.quantity = existing.stock;
      }
    }

    const dedupedSession = normalizeSessionCartItems(sessionItems);
    if (dedupedSession.length > 0) {
      const bookIds = dedupedSession.map((item) => item.id);
      const books = await tx.book.findMany({
        where: { id: { in: bookIds } },
        select: { id: true, stock: true },
      });

      const stockByBookId = new Map<number, number>();
      for (const book of books) {
        stockByBookId.set(book.id, book.stock);
      }

      for (const sessionItem of dedupedSession) {
        const stock = stockByBookId.get(sessionItem.id);
        if (!stock || stock <= 0) {
          continue;
        }

        const existing = existingByBookId.get(sessionItem.id);
        const mergedQuantity = Math.min((existing?.quantity ?? 0) + sessionItem.quantity, stock);

        if (existing) {
          if (existing.quantity !== mergedQuantity) {
            await tx.cartItem.update({
              where: { id: existing.id },
              data: { quantity: mergedQuantity },
            });
          }
          existing.quantity = mergedQuantity;
        } else {
          const created = await tx.cartItem.create({
            data: {
              userId,
              bookId: sessionItem.id,
              quantity: mergedQuantity,
            },
          });

          existingByBookId.set(sessionItem.id, {
            id: created.id,
            quantity: mergedQuantity,
            stock,
          });
        }
      }
    }

    return tx.cartItem.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            price: true,
            stock: true,
            coverImage: true,
            bookAuthors: {
              orderBy: { authorId: 'asc' },
              select: {
                author: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  });
}