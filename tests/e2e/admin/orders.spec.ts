import { expect, test } from '@playwright/test';
import { loginAsAdmin } from '../support/adminAuth';

test('Admin orders page loads with filters and order list state', async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByRole('link', { name: 'Orders' }).click();
  await expect(page.getByRole('heading', { name: 'Orders management' })).toBeVisible();
  await expect(page.getByText('Filter by status:')).toBeVisible();
  await expect(page.getByRole('button', { name: 'All orders' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pending' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delivered' })).toBeVisible();

  await page.getByRole('button', { name: 'Pending' }).click();
  await expect(page.getByRole('button', { name: 'Pending' })).toHaveClass(/shadow-md/);
  await page.getByRole('button', { name: 'All orders' }).click();
  await expect(page.getByRole('button', { name: 'All orders' })).toHaveClass(/shadow-md/);
});