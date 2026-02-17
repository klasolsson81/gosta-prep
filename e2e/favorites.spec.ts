import { test, expect } from '@playwright/test';
import { setupProfile } from './helpers';

test.describe('Favorites', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupProfile(page);
    await page.goto('/');
  });

  test('should show empty state when no favorites', async ({ page }) => {
    await page.goto('/favoriter');
    await expect(page.getByText(/inga favoriter/i)).toBeVisible();
  });

  test('should add a company to favorites from the list', async ({ page }) => {
    // Search for a specific company to isolate its star
    await page.getByPlaceholder(/sök/i).fill('Xenit');
    const starButton = page.locator('button').filter({ has: page.locator('svg.lucide-star') }).first();
    await starButton.click();

    await page.goto('/favoriter');
    await expect(page.getByRole('heading', { name: 'Xenit' })).toBeVisible();
  });

  test('should add favorite from detail page', async ({ page }) => {
    await page.getByPlaceholder(/sök/i).fill('Ericsson');
    await page.getByRole('heading', { name: 'Ericsson' }).click();
    // The favorite button always says "Favorit"
    await page.getByRole('button', { name: /favorit/i }).click();

    await page.goto('/favoriter');
    await expect(page.getByRole('heading', { name: 'Ericsson' })).toBeVisible();
  });

  test('should remove favorite by toggling from detail', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('gosta-favorites', JSON.stringify({ xenit: true }));
    });
    await page.goto('/favoriter');
    await expect(page.getByRole('heading', { name: 'Xenit' })).toBeVisible();

    // Navigate to company detail and unfavorite there
    await page.getByRole('heading', { name: 'Xenit' }).click();
    await page.getByRole('button', { name: /favorit/i }).click();

    // Go back to favorites — should be empty now
    await page.goto('/favoriter');
    await expect(page.getByText(/inga favoriter/i)).toBeVisible();
  });

  test('should persist favorites across reloads', async ({ page }) => {
    await page.getByPlaceholder(/sök/i).fill('Xenit');
    const starButton = page.locator('button').filter({ has: page.locator('svg.lucide-star') }).first();
    await starButton.click();

    await page.reload();
    await page.goto('/favoriter');
    await expect(page.getByRole('heading', { name: 'Xenit' })).toBeVisible();
  });
});
