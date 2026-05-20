import { expect, test } from '@playwright/test';
import { seedCart } from '../support/cart';

test('Cart drawer reflects persisted items and can continue to checkout', async ({ page }) => {
  await seedCart(page, [
    {
      id: 501,
      title: 'E2E Test Book',
      author: 'Test Author',
      price: 14.5,
      quantity: 2,
    },
  ]);

  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Open cart' })).toBeVisible();

  await page.getByRole('button', { name: 'Open cart' }).click();
  await expect(page.getByRole('heading', { name: 'Cart (2)' })).toBeVisible();
  await expect(page.getByText('E2E Test Book')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Checkout' })).toBeVisible();
});