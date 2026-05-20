import { expect, type Page } from '@playwright/test';

type BookSummary = {
  id: number;
  title: string;
};

export async function getFirstBook(page: Page) {
  const response = await page.request.get('/api/books?limit=1');
  expect(response.ok()).toBeTruthy();

  const payload = (await response.json()) as { books?: BookSummary[] };
  return payload.books?.[0] ?? null;
}