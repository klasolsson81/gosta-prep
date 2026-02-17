import { test, expect } from '@playwright/test';
import { setupProfile } from './helpers';

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupProfile(page, { name: 'Klas', linkedin: 'klasolsson', portfolio: 'klasolsson.se', github: 'klasolsson' });
    await page.goto('/profil');
  });

  test('should display profile data', async ({ page }) => {
    await expect(page.getByText(/linkedin.com\/in\/klasolsson/)).toBeVisible();
    await expect(page.getByText('klasolsson.se')).toBeVisible();
    await expect(page.getByText(/github.com\/klasolsson/)).toBeVisible();
  });

  test('should allow editing name', async ({ page }) => {
    await page.getByText('Ändra').first().click();
    const input = page.getByPlaceholder(/förnamn/i);
    await input.clear();
    await input.fill('Anna');
    await page.getByText('Klar').click();
    // Avatar should show A
    await expect(page.locator('text=Anna').first()).toBeVisible();
  });

  test('should show and cancel reset dialog', async ({ page }) => {
    await page.getByText(/återställ all data/i).click();
    await expect(page.getByText(/är du säker/i)).toBeVisible();
    await page.getByText('Avbryt').click();
    await expect(page.getByText(/är du säker/i)).not.toBeVisible();
  });

  test('should reset all data', async ({ page }) => {
    await page.getByText(/återställ all data/i).click();
    await page.getByText('Radera allt').click();
    // Should show onboarding welcome
    await expect(page.getByText('GÖSTA Prep 2026')).toBeVisible({ timeout: 5000 });
  });

  test('should show app info', async ({ page }) => {
    await expect(page.getByText(/byggd av nbi/i)).toBeVisible();
  });
});
