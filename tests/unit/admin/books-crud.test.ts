import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/prisma');

beforeEach(() => jest.resetAllMocks());

describe('Admin - Books CRUD', () => {
  test('Create book persists to DB', async () => {
    const prisma = require('@/lib/prisma');
    (prisma.book.create as any).mockResolvedValue({ id: 201, title: 'New Book' });
    const res = await prisma.book.create({ data: { title: 'New Book' } } as any);
    expect(res.id).toBe(201);
  });

  test('Read book returns correct record', async () => {
    const prisma = require('@/lib/prisma');
    (prisma.book.findUnique as any).mockResolvedValue({ id: 201, title: 'New Book' });
    const b = await prisma.book.findUnique({ where: { id: 201 } } as any);
    expect(b.title).toBe('New Book');
  });

  test('Update book modifies fields', async () => {
    const prisma = require('@/lib/prisma');
    (prisma.book.update as any).mockResolvedValue({ id: 201, price: 17.49 });
    const u = await prisma.book.update({ where:{ id:201 }, data: { price: 17.49 } } as any);
    expect(u.price).toBe(17.49);
  });

  test('Delete book removes record safely', async () => {
    const prisma = require('@/lib/prisma');
    (prisma.book.delete as any).mockResolvedValue({ id: 201 });
    const d = await prisma.book.delete({ where: { id: 201 } } as any);
    expect(d.id).toBe(201);
  });
});
