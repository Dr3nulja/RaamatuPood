import { expect, test } from '@playwright/test';
import { loginAsAdmin } from '../support/adminAuth';

test('Admin books page loads and opens the edit modal', async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByRole('link', { name: 'Books' }).click();
  await expect(page.getByRole('heading', { name: 'Books management' })).toBeVisible();
  await expect(page.getByPlaceholder('Search by title / author / description')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add book' })).toBeVisible();

  const firstEditButton = page.getByRole('button', { name: 'Edit' }).first();
  await expect(firstEditButton).toBeVisible();
  await firstEditButton.click();

  const editModal = page.locator('.modal-surface').last();
  await expect(editModal.getByRole('heading')).toContainText('Edit book');
  await expect(editModal.getByLabel('Title')).toBeVisible();
  await expect(editModal.getByRole('button', { name: 'Save changes' })).toBeVisible();
  await editModal.getByRole('button', { name: 'Close modal' }).click();
  await expect(editModal).toHaveCount(0);
});
