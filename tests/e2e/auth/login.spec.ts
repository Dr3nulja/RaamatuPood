import { test, expect } from '@playwright/test';

test('Login through Auth0 should succeed with valid credentials', async ({ page }) => {
  const email = process.env.E2E_AUTH_EMAIL || 'miyexo5902@hidevak.com';
  const password = process.env.E2E_AUTH_PASSWORD || 'miyexo5902@hidevak.comA';

  await page.goto('/auth/login?returnTo=/');
  await page.waitForURL(/auth0\.com/, { timeout: 10000 });
  await page.getByRole('textbox', { name: /Email address/i }).fill(email);
  await page.getByRole('textbox', { name: /Password/i }).fill(password);

  await Promise.all([
    page.waitForURL(/127\.0\.0\.1|localhost/, { timeout: 15000 }),
    page.getByRole('button', { name: /Continue/i }).click(),
  ]);

  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('link', { name: 'Open profile' })).toBeVisible();
});
