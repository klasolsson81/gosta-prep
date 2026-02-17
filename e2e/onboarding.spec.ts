import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('should show welcome screen', async ({ page }) => {
    await expect(page.getByText('GÖSTA Prep 2026')).toBeVisible();
    await expect(page.getByText(/kom igång/i)).toBeVisible();
  });

  test('should complete full onboarding', async ({ page }) => {
    await page.getByText(/kom igång/i).click();

    // Name
    await page.getByPlaceholder(/förnamn/i).fill('Klas');
    await page.locator('button').filter({ hasText: /nästa/i }).click();

    // LinkedIn - wait for the step heading to appear
    await expect(page.getByRole('heading', { name: 'LinkedIn' })).toBeVisible();
    await page.getByPlaceholder('ditt-namn').fill('klasolsson');
    await page.locator('button').filter({ hasText: /nästa/i }).click();

    // Portfolio
    await expect(page.getByRole('heading', { name: 'Portfolio' })).toBeVisible();
    await page.getByPlaceholder('dinportfolio.se').fill('klasolsson.se');
    await page.locator('button').filter({ hasText: /nästa/i }).click();

    // GitHub
    await expect(page.getByRole('heading', { name: 'GitHub' })).toBeVisible();
    await page.getByPlaceholder('ditt-username').fill('klasolsson');
    await page.locator('button').filter({ hasText: /nästa/i }).click();

    // CV - skip
    await expect(page.getByRole('heading', { name: 'CV' })).toBeVisible();
    await page.locator('button').filter({ hasText: /hoppa över/i }).click();

    // Done
    await expect(page.getByText(/du är redo, klas/i)).toBeVisible();
    await page.locator('button').filter({ hasText: /starta appen/i }).click();

    // finish() triggers window.location.replace('/'), wait for full navigation
    await page.waitForURL('/');
    await expect(page.getByText('30 företag')).toBeVisible({ timeout: 10000 });
  });

  test('should allow skipping all optional fields', async ({ page }) => {
    await page.getByText(/kom igång/i).click();
    await page.getByPlaceholder(/förnamn/i).fill('Anna');
    await page.locator('button').filter({ hasText: /nästa/i }).click();

    for (let i = 0; i < 4; i++) {
      await page.locator('button').filter({ hasText: /hoppa över/i }).click();
    }

    await expect(page.getByText(/du är redo, anna/i)).toBeVisible();
  });

  test('should disable next without name', async ({ page }) => {
    await page.getByText(/kom igång/i).click();
    const nextBtn = page.locator('button').filter({ hasText: /nästa/i });
    await expect(nextBtn).toBeDisabled();
  });
});
