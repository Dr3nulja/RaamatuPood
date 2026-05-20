import { expect, test } from '@playwright/test';

test('Footer navigation opens the informational pages', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');

  await footer.getByRole('link', { name: 'About us' }).click();
  await expect(page.getByRole('heading', { name: 'We create a place where finding a book feels effortless' })).toBeVisible();

  await footer.getByRole('link', { name: 'Privacy policy' }).click();
  await expect(page.getByRole('heading', { name: 'RaamatuPood Privacy Policy' })).toBeVisible();

  await footer.getByRole('link', { name: 'Delivery' }).click();
  await expect(page.getByRole('heading', { name: 'Fast & reliable shipping' })).toBeVisible();

  await footer.getByRole('link', { name: 'Returns' }).click();
  await expect(page.getByRole('heading', { name: 'Simple and transparent rules' })).toBeVisible();

  await footer.getByRole('link', { name: 'FAQ' }).click();
  await expect(page.getByRole('heading', { name: 'Frequently asked questions' })).toBeVisible();
});