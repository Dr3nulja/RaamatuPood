import { expect, test } from '@playwright/test';
import { seedCart } from '../support/cart';

test('Checkout page renders the order summary and validates required fields', async ({ page }) => {
  await seedCart(page, [
    {
      id: 777,
      title: 'Checkout Test Book',
      author: 'Test Author',
      price: 19.99,
      quantity: 1,
    },
  ]);

  await page.goto('/checkout');

  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  await expect(page.getByText('Step 1: Your details and delivery')).toBeVisible();
  await expect(
    page.locator('section').filter({ has: page.getByRole('heading', { name: 'Your order' }) })
      .getByText('Checkout Test Book')
  ).toBeVisible();
  const payButton = page.getByRole('button', { name: /^Pay/i });
  await expect(payButton).toBeVisible();

  await payButton.click();
  await expect(page.getByText('Please fill in all required fields')).toBeVisible();

  await page.locator('#name').fill('Test User');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#street').fill('Main Street');
  await page.locator('#houseNumber').fill('12');
  await page.locator('#postalCode').fill('10001');
  await page.locator('#city').fill('Tallinn');

  await expect(payButton).toBeVisible();
  await expect(page.getByText('Total:')).toBeVisible();
});