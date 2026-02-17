import { test, expect } from '@playwright/test';
import { setupProfile } from './helpers';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupProfile(page);
    await page.goto('/');
  });

  test('should show companies on root', async ({ page }) => {
    await expect(page.getByText('30 företag')).toBeVisible();
  });

  test('should navigate to all routes via URL', async ({ page }) => {
    await page.goto('/favoriter');
    await expect(page.getByText(/inga favoriter/i)).toBeVisible();

    await page.goto('/schema');
    await expect(page.getByText(/19 feb 2026/i)).toBeVisible();

    await page.goto('/profil');
    await expect(page.getByText(/förnamn/i).first()).toBeVisible();
  });

  test('should show app header with branding', async ({ page }) => {
    // Both mobile and desktop headers contain GÖSTA Prep branding
    await expect(page.locator('body')).toContainText('GÖSTA');
  });

  test('should handle SPA routing on reload', async ({ page }) => {
    await page.goto('/schema');
    await expect(page.getByText(/19 feb 2026/i)).toBeVisible();
    await page.reload();
    await expect(page.getByText(/19 feb 2026/i)).toBeVisible();
  });
});
