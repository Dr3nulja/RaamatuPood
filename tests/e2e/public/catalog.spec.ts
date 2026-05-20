import { expect, test } from '@playwright/test';

test('Catalog page shows filters and opens the book preview overlay', async ({ page }) => {
  await page.goto('/catalog');

  await expect(page.getByRole('heading', { name: 'Books' })).toBeVisible();
  await expect(page.getByPlaceholder('Search by title or author')).toBeVisible();
  await expect(page.getByText('Sort by')).toBeVisible();
  await expect(page.getByRole('button', { name: 'All categories' })).toBeVisible();

  const firstCard = page.locator('main article').first();
  await expect(firstCard).toBeVisible();

  await firstCard.getByRole('button', { name: 'Details' }).click();
  await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open book page' })).toBeVisible();

  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('link', { name: 'Open book page' })).toHaveCount(0);
});