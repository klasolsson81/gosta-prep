import { test, expect } from '@playwright/test';
import { setupProfile } from './helpers';

test.describe('Notes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupProfile(page);
    await page.goto('/');
  });

  test('should show pre-filled note template', async ({ page }) => {
    await page.getByRole('heading', { name: 'Xenit' }).click();
    const value = await page.locator('textarea').inputValue();
    expect(value).toContain('Pratade med:');
    expect(value).toContain('Nästa steg:');
  });

  test('should save notes and persist', async ({ page }) => {
    await page.getByRole('heading', { name: 'Deloitte' }).click();
    await page.locator('textarea').clear();
    await page.locator('textarea').fill('Cybersecurity-samtal');

    await page.locator('svg.lucide-arrow-left').click();
    await page.getByRole('heading', { name: 'Deloitte' }).click();
    expect(await page.locator('textarea').inputValue()).toContain('Cybersecurity-samtal');
  });

  test('should keep notes per company independently', async ({ page }) => {
    await page.getByRole('heading', { name: 'Xenit' }).click();
    await page.locator('textarea').clear();
    await page.locator('textarea').fill('Cloud-notering');

    await page.locator('svg.lucide-arrow-left').click();
    await page.getByRole('heading', { name: 'KPMG' }).click();
    await page.locator('textarea').clear();
    await page.locator('textarea').fill('Revision-notering');

    await page.locator('svg.lucide-arrow-left').click();
    await page.getByRole('heading', { name: 'Xenit' }).click();
    expect(await page.locator('textarea').inputValue()).toBe('Cloud-notering');
  });
});
