import { jest } from '@jest/globals';

function createModelMock() {
  return {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  };
}

export const prisma = {
  book: createModelMock(),
  user: createModelMock(),
  order: createModelMock(),
  cartItem: createModelMock(),
  category: createModelMock(),
  author: createModelMock(),
  address: createModelMock(),
  shippingMethod: createModelMock(),
  review: createModelMock(),
  orderItem: createModelMock(),
  $transaction: jest.fn(async (callback: any) => {
    if (typeof callback === 'function') {
      return callback(prisma as any);
    }

    return [];
  }),
};

export const book = prisma.book;
export const user = prisma.user;
export const order = prisma.order;
export const cartItem = prisma.cartItem;
export const category = prisma.category;
export const author = prisma.author;
export const address = prisma.address;
export const shippingMethod = prisma.shippingMethod;
export const review = prisma.review;
export const orderItem = prisma.orderItem;

export default prisma;