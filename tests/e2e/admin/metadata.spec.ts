import { expect, test } from '@playwright/test';
import { loginAsAdmin } from '../support/adminAuth';

function uniqueName(prefix: string) {
  return `${prefix}_${Date.now()}`;
}

test('Admin authors CRUD works from the metadata manager', async ({ page }) => {
  const createdName = uniqueName('E2E_Author');
  const updatedName = `${createdName}_updated`;

  await loginAsAdmin(page);
  await page.getByRole('link', { name: 'Authors' }).click();

  await expect(page.getByRole('heading', { name: 'Authors' })).toBeVisible();
  await page.getByRole('button', { name: 'Add Author' }).click();

  const createModal = page.locator('.modal-surface').last();
  await expect(createModal.getByRole('heading', { name: 'Add Author' })).toBeVisible();
  await createModal.getByLabel('Author name').fill(createdName);
  await createModal.getByRole('button', { name: 'Create Author' }).click();

  const createdRow = page.locator('tbody tr').filter({ hasText: createdName });
  await expect(createdRow).toBeVisible();

  await createdRow.getByRole('button', { name: 'Edit' }).click();
  const editModal = page.locator('.modal-surface').last();
  await expect(editModal.getByRole('heading', { name: 'Edit Author' })).toBeVisible();
  const authorInput = editModal.getByLabel('Author name');
  await authorInput.fill(updatedName);
  await editModal.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.locator('tbody tr').filter({ hasText: updatedName })).toBeVisible();

  const updatedRow = page.locator('tbody tr').filter({ hasText: updatedName });
  await updatedRow.getByRole('button', { name: 'Delete' }).click();
  const deleteModal = page.locator('.modal-surface').last();
  await expect(deleteModal.getByRole('heading', { name: 'Delete Author' })).toBeVisible();
  await deleteModal.getByRole('button', { name: 'Delete' }).click();

  await expect(page.locator('tbody tr').filter({ hasText: updatedName })).toHaveCount(0);
});

test('Admin categories CRUD works from the metadata manager', async ({ page }) => {
  const createdName = uniqueName('E2E_Category');
  const updatedName = `${createdName}_updated`;

  await loginAsAdmin(page);
  await page.getByRole('link', { name: 'Categories' }).click();

  await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible();
  await page.getByRole('button', { name: 'Add Category' }).click();

  const createModal = page.locator('.modal-surface').last();
  await expect(createModal.getByRole('heading', { name: 'Add Category' })).toBeVisible();
  await createModal.getByLabel('Category name').fill(createdName);
  await createModal.getByRole('button', { name: 'Create Category' }).click();

  const createdRow = page.locator('tbody tr').filter({ hasText: createdName });
  await expect(createdRow).toBeVisible();

  await createdRow.getByRole('button', { name: 'Edit' }).click();
  const editModal = page.locator('.modal-surface').last();
  await expect(editModal.getByRole('heading', { name: 'Edit Category' })).toBeVisible();
  const categoryInput = editModal.getByLabel('Category name');
  await categoryInput.fill(updatedName);
  await editModal.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.locator('tbody tr').filter({ hasText: updatedName })).toBeVisible();

  const updatedRow = page.locator('tbody tr').filter({ hasText: updatedName });
  await updatedRow.getByRole('button', { name: 'Delete' }).click();
  const deleteModal = page.locator('.modal-surface').last();
  await expect(deleteModal.getByRole('heading', { name: 'Delete Category' })).toBeVisible();
  await deleteModal.getByRole('button', { name: 'Delete' }).click();

  await expect(page.locator('tbody tr').filter({ hasText: updatedName })).toHaveCount(0);
});