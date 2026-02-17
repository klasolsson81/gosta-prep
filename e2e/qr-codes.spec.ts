import { test, expect } from '@playwright/test';
import { setupProfile } from './helpers';

test.describe('QR Codes', () => {
  test('should show empty state when no URLs configured', async ({ page }) => {
    await page.goto('/');
    await setupProfile(page);
    await page.goto('/qr');
    await expect(page.getByText(/inga qr-koder/i)).toBeVisible();
  });

  test('should show QR codes for configured URLs', async ({ page }) => {
    await page.goto('/');
    await setupProfile(page, { linkedin: 'klasolsson', portfolio: 'klasolsson.se', github: 'klasolsson' });
    await page.goto('/qr');

    await expect(page.getByText(/dina qr-koder/i)).toBeVisible();
    // QR codes render as SVGs inside white containers
    const qrContainers = page.locator('.bg-white');
    const count = await qrContainers.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should show add cards for unconfigured URLs', async ({ page }) => {
    await page.goto('/');
    await setupProfile(page, { linkedin: 'klasolsson' });
    await page.goto('/qr');

    const addCards = page.getByText(/lägg till/i);
    const count = await addCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should display correct URL text', async ({ page }) => {
    await page.goto('/');
    await setupProfile(page, { linkedin: 'klasolsson' });
    await page.goto('/qr');

    await expect(page.getByText('https://linkedin.com/in/klasolsson')).toBeVisible();
  });
});
