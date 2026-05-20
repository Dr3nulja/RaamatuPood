import { expect, test } from '@playwright/test';
import { seedCart } from '../support/cart';

test('Full purchase flow from cart drawer to checkout validation', async ({ page }) => {
  const bookTitle = 'Full Flow Test Book';
  const bookPrice = 15.75;
  const deliveryFee = 3.99;
  const quantity = 1;
  const expectedSubtotal = bookPrice * 2;
  const expectedTotal = expectedSubtotal + deliveryFee;

  await seedCart(page, [
    {
      id: 901,
      title: bookTitle,
      author: 'Flow Author',
      price: bookPrice,
      quantity,
    },
  ]);

  await page.goto('/');
  await page.getByRole('button', { name: 'Open cart' }).click();
  await expect(page.getByRole('heading', { name: 'Cart (1)' })).toBeVisible();
  await expect(page.getByText(bookTitle)).toBeVisible();

  const itemCard = page.locator('aside article').filter({ hasText: bookTitle });
  await itemCard.getByRole('button', { name: '+' }).click();
  await expect(page.getByRole('heading', { name: 'Cart (2)' })).toBeVisible();
  await expect(itemCard).toContainText('Qty: 2');

  await page.getByRole('button', { name: 'Checkout' }).click();

  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  await expect(page.getByText('Step 1: Your details and delivery')).toBeVisible();

  const orderSummary = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Your order' }) });
  await expect(orderSummary.getByText(bookTitle)).toBeVisible();
  await expect(orderSummary).toContainText('Qty: 2');
  await expect(orderSummary).toContainText(`€${expectedSubtotal.toFixed(2)}`);
  await expect(orderSummary).toContainText(`€${expectedTotal.toFixed(2)}`);

  const payButton = page.getByRole('button', { name: /Pay/i });
  await expect(payButton).toBeVisible();
  await payButton.click();
  await expect(page.getByText('Please fill in all required fields')).toBeVisible();

  await page.locator('#name').fill('Test User');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#street').fill('Main Street');
  await page.locator('#houseNumber').fill('12');
  await page.locator('#postalCode').fill('10001');
  await page.locator('#city').fill('Tallinn');

  await expect(page.locator('#country')).toHaveValue('EE');
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  await expect(page.getByText('Your order')).toBeVisible();
});