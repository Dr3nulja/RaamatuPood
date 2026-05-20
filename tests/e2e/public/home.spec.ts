import { expect, test } from '@playwright/test';

test('Home page exposes the primary discovery flow', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Find your next favorite book' })).toBeVisible();
  await expect(page.getByPlaceholder('Search by title or author')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Browse catalog' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Popular books' })).toBeVisible();

  const firstBookCard = page.locator('main article').first();
  await expect(firstBookCard).toBeVisible();

  const bookTitle = (await firstBookCard.locator('h3').innerText()).trim();
  expect(bookTitle).not.toBe('');

  await firstBookCard.getByRole('link', { name: 'Details' }).click();
  await expect(page).toHaveURL(/\/catalog\/\d+/);
  await expect(page.getByRole('heading', { name: bookTitle })).toBeVisible();
});