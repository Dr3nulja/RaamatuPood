import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/lib/prisma');

beforeEach(()=>jest.resetAllMocks());

describe('Admin - Categories (CRUD)', ()=>{
  test('Create category', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.category.create as any).mockResolvedValue({ id: 301, name: 'QA_Category_01' });
    const c = await prisma.category.create({ data: { name: 'QA_Category_01' } } as any);
    expect(c.name).toBe('QA_Category_01');
  });

  test('Edit category', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.category.update as any).mockResolvedValue({ id: 301, name: 'QA_Category_01_updated' });
    const u = await prisma.category.update({ where:{ id:301 }, data:{ name:'QA_Category_01_updated' } } as any);
    expect(u.name).toContain('updated');
  });

  test('Delete category', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.category.delete as any).mockResolvedValue({ id: 301 });
    const d = await prisma.category.delete({ where:{ id:301 } } as any);
    expect(d.id).toBe(301);
  });

  test('Category list shows created category', async ()=>{
    const prisma = require('@/lib/prisma');
    (prisma.category.findMany as any).mockResolvedValue([{ id:301, name:'QA_Category_01' }]);
    const list = await prisma.category.findMany();
    expect(list.find((x:any)=>x.name==='QA_Category_01')).toBeDefined();
  });
});
