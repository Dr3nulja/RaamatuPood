import { expect, test } from '@playwright/test';
import { loginAsAdmin } from '../support/adminAuth';

test('Admin dashboard and sidebar navigation work end-to-end', async ({ page }) => {
  await loginAsAdmin(page);

  await expect(page.getByText('Total revenue')).toBeVisible();
  await expect(page.getByText('Total orders')).toBeVisible();
  await expect(page.getByText('Orders by status')).toBeVisible();

  await page.getByRole('link', { name: 'Books' }).click();
  await expect(page.getByRole('heading', { name: 'Books management' })).toBeVisible();

  await page.getByRole('link', { name: 'Authors' }).click();
  await expect(page.getByRole('heading', { name: 'Authors' })).toBeVisible();

  await page.getByRole('link', { name: 'Categories' }).click();
  await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible();

  await page.getByRole('link', { name: 'Orders' }).click();
  await expect(page.getByRole('heading', { name: 'Orders management' })).toBeVisible();
});