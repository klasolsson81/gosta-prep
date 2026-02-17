import { test, expect } from '@playwright/test';
import { setupProfile } from './helpers';

test.describe('Schedule', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupProfile(page);
    await page.goto('/schema');
  });

  test('should display all events', async ({ page }) => {
    await expect(page.getByText(/19 feb 2026/i)).toBeVisible();
    await expect(page.getByText(/frukostföreläsning/i)).toBeVisible();
    await expect(page.getByText(/mässan öppnar/i)).toBeVisible();
    await expect(page.getByText(/deloitte/i).first()).toBeVisible();
    await expect(page.getByText(/mässan stänger/i)).toBeVisible();
    await expect(page.getByText(/göstas mingel/i)).toBeVisible();
  });

  test('should show event times', async ({ page }) => {
    await expect(page.getByText('08:30').first()).toBeVisible();
    await expect(page.getByText('15:00').first()).toBeVisible();
  });

  test('should show locations', async ({ page }) => {
    await expect(page.getByText(/lindholmen conference center/i).first()).toBeVisible();
  });

  test('should show language tags', async ({ page }) => {
    await expect(page.getByText('Engelska').first()).toBeVisible();
    await expect(page.getByText('Svenska').first()).toBeVisible();
  });

  test('should indicate mingle is sold out', async ({ page }) => {
    await expect(page.getByText(/slutsålt/i)).toBeVisible();
  });
});
