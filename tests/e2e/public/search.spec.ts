import { expect, test } from '@playwright/test';
import { getFirstBook } from '../support/books';

test('Home search returns matching books and opens the result', async ({ page }) => {
  const book = await getFirstBook(page);
  expect(book).not.toBeNull();
  if (!book) {
    return;
  }

  const searchTerm = book.title.slice(0, Math.min(5, book.title.length));

  await page.goto('/');
  const searchInput = page.getByPlaceholder('Search by title or author');
  await searchInput.fill(searchTerm);

  const panel = page.locator('div.absolute.left-0.right-0.z-30');
  await expect(panel.getByText(book.title)).toBeVisible();
  await panel.getByRole('link', { name: 'Details' }).first().click();
  await expect(page).toHaveURL(new RegExp(`/catalog/${book.id}$`));
  await expect(page.getByRole('heading', { name: book.title })).toBeVisible();
});