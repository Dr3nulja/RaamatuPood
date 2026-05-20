import { expect, type Page } from '@playwright/test';

export const adminEmail = process.env.E2E_ADMIN_EMAIL || 'cihegek796@ellbit.com';
export const adminPassword = process.env.E2E_ADMIN_PASSWORD || 'cihegek796@ellbit.comA';

export async function loginAsAdmin(page: Page) {
  await page.goto('/auth/login?returnTo=/admin');
  await page.waitForURL(/auth0\.com/, { timeout: 10000 });
  await page.getByRole('textbox', { name: /Email address/i }).fill(adminEmail);
  await page.getByRole('textbox', { name: /Password/i }).fill(adminPassword);

  await Promise.all([
    page.waitForURL(/\/admin(?:[?#].*)?$/, { timeout: 30000 }),
    page.getByRole('button', { name: /Continue/i }).click(),
  ]);

  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible({ timeout: 15000 });
}