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
    // Click the star button (parent of the SVG icon) on the first company card
    const starButton = page.locator('button').filter({ has: page.locator('svg.lucide-star') }).first();
    await starButton.click();

    await page.goto('/favoriter');
    await expect(page.getByRole('heading', { name: 'Xenit' })).toBeVisible();
  });

  test('should add favorite from detail page', async ({ page }) => {
    await page.getByRole('heading', { name: 'Ericsson' }).click();
    await page.getByText(/favoritmarkera/i).click();

    await page.goto('/favoriter');
    await expect(page.getByRole('heading', { name: 'Ericsson' })).toBeVisible();
  });

  test('should remove favorite by toggling star', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('gosta-favorites', JSON.stringify({ xenit: true }));
    });
    await page.goto('/favoriter');
    await expect(page.getByRole('heading', { name: 'Xenit' })).toBeVisible();

    const starButton = page.locator('button').filter({ has: page.locator('svg.lucide-star') }).first();
    await starButton.click();
    await expect(page.getByText(/inga favoriter/i)).toBeVisible();
  });

  test('should persist favorites across reloads', async ({ page }) => {
    const starButton = page.locator('button').filter({ has: page.locator('svg.lucide-star') }).first();
    await starButton.click();

    await page.reload();
    await page.goto('/favoriter');
    await expect(page.getByRole('heading', { name: 'Xenit' })).toBeVisible();
  });
});
