import { test, expect } from '@playwright/test';
import { setupProfile } from './helpers';

test.describe('Notes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupProfile(page);
    await page.goto('/');
  });

  test('should show structured note fields', async ({ page }) => {
    await page.getByPlaceholder(/sök/i).fill('Xenit');
    await page.getByRole('heading', { name: 'Xenit' }).click();
    await expect(page.getByText(/dina anteckningar/i)).toBeVisible();
    await expect(page.getByPlaceholder(/namn på personen/i)).toBeVisible();
    await expect(page.getByPlaceholder(/skicka cv/i)).toBeVisible();
  });

  test('should save notes and persist', async ({ page }) => {
    await page.getByPlaceholder(/sök/i).fill('Deloitte');
    await page.getByRole('heading', { name: 'Deloitte' }).click();
    await page.getByPlaceholder(/namn på personen/i).fill('Anna S');

    await page.locator('svg.lucide-arrow-left').click();
    await page.getByPlaceholder(/sök/i).fill('Deloitte');
    await page.getByRole('heading', { name: 'Deloitte' }).click();
    await expect(page.getByPlaceholder(/namn på personen/i)).toHaveValue('Anna S');
  });

  test('should keep notes per company independently', async ({ page }) => {
    await page.getByPlaceholder(/sök/i).fill('Xenit');
    await page.getByRole('heading', { name: 'Xenit' }).click();
    await page.getByPlaceholder(/namn på personen/i).fill('Erik X');

    await page.locator('svg.lucide-arrow-left').click();
    await page.getByPlaceholder(/sök/i).clear();
    await page.getByPlaceholder(/sök/i).fill('KPMG');
    await page.getByRole('heading', { name: 'KPMG' }).click();
    await page.getByPlaceholder(/namn på personen/i).fill('Lisa K');

    await page.locator('svg.lucide-arrow-left').click();
    await page.getByPlaceholder(/sök/i).clear();
    await page.getByPlaceholder(/sök/i).fill('Xenit');
    await page.getByRole('heading', { name: 'Xenit' }).click();
    await expect(page.getByPlaceholder(/namn på personen/i)).toHaveValue('Erik X');
  });
});
