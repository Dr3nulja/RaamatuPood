import { expect, test } from '@playwright/test';
import { getFirstBook } from '../support/books';

test('Book details page shows the product view and add-to-cart feedback', async ({ page }) => {
  const book = await getFirstBook(page);
  expect(book).not.toBeNull();
  if (!book) {
    return;
  }

  await page.goto(`/catalog/${book.id}`);

  await expect(page.getByRole('heading', { name: book.title })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to catalog' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add to cart' })).toBeVisible();

  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByText('Log in to add items to cart')).toBeVisible();
});