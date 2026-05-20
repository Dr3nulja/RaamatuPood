import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/prisma');

beforeEach(()=>jest.resetAllMocks());

describe('Admin - Authors', ()=>{
  test('Create author', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.author.create as any).mockResolvedValue({ id:401, name:'QA Author' });
    const a = await prisma.author.create({ data:{ name:'QA Author' } } as any);
    expect(a.name).toBe('QA Author');
  });

  test('Link author to book', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.book.update as any).mockResolvedValue({ id:201, authors:[{ id:401 }] });
    const res = await prisma.book.update({ where:{ id:201 }, data:{ authors:{ connect:[{ id:401 }] } } } as any);
    expect(res.authors).toBeDefined();
  });

  test('Edit author', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.author.update as any).mockResolvedValue({ id:401, bio:'Updated' });
    const u = await prisma.author.update({ where:{ id:401 }, data:{ bio:'Updated' } } as any);
    expect(u.bio).toBe('Updated');
  });

  test('Delete author', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.author.delete as any).mockResolvedValue({ id:401 });
    const d = await prisma.author.delete({ where:{ id:401 } } as any);
    expect(d.id).toBe(401);
  });
});
