import { test, expect } from '@playwright/test';

test('Login through Auth0 should succeed with valid credentials', async ({ page }) => {
  const email = 'miyexo5902@hidevak.com';
  const password = 'miyexo5902@hidevak.comA';
  const site = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 1. Открыть страницу логина
  await page.goto(`${site}/auth/login`);

  // 2. Нажать кнопку входа через Auth0 (текст может отличаться — адаптируйте при необходимости)
  await page.click('text=Sign in with Auth0');

  // 3. Ждём редирект на Auth0
  await page.waitForURL(/auth0\.com/, { timeout: 10000 });

  // 4. Заполняем форму Auth0 (универсальные селекторы)
  await page.waitForSelector('input[name="email"]', { timeout: 5000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  // 5. Отправляем форму
  await Promise.all([
    page.waitForNavigation({ url: `${site}/**`, timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);

  // 6. Ждём загрузки страницы после логина
  await page.waitForLoadState('networkidle');

  // 7. Проверяем успешный вход (наличие user menu или аватара)
  await expect(page.locator('[data-testid="user-menu", .user-avatar, header [aria-label="User menu"]'))
    .toBeVisible({ timeout: 10000 });

  // 8. Проверяем, что email отображается (опционально)
  const emailPart = email.split('@')[0];
  await expect(page.locator(`text=${emailPart}`)).toBeVisible({ timeout: 5000 });
});
