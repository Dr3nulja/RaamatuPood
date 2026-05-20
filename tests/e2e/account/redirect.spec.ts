import { expect, test } from '@playwright/test';

test('Unauthenticated users are redirected away from protected account pages', async ({ page }) => {
  await page.goto('/account');
  await expect(page).toHaveURL(/auth0\.com/);

  await page.goto('/admin');
  await expect(page).toHaveURL(/auth0\.com/);
});