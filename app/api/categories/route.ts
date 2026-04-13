import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { CategoriesApiResponse } from '@/lib/api/catalogTypes';
import type { ApiErrorResponse } from '@/lib/api/types';
import { withApiSecurity } from '@/lib/security/api-guard';

export const dynamic = 'force-dynamic';

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const response: CategoriesApiResponse = {
      categories,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Failed to load categories:', error);
    const response: ApiErrorResponse = { error: 'Failed to load categories' };
    return NextResponse.json(response, { status: 500 });
  }
}

export const GET = withApiSecurity(getCategories, {
  bucket: 'api',
});
