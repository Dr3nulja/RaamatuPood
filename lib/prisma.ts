import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const book = prisma.book;
export const user = prisma.user;
export const order = prisma.order;
export const cartItem = prisma.cartItem;
export const category = prisma.category;
export const author = prisma.author;

export default prisma;
