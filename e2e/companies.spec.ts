import { test, expect } from '@playwright/test';
import { setupProfile } from './helpers';

test.describe('Company Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupProfile(page, { linkedin: 'test', portfolio: 'test.se', github: 'test' });
    await page.goto('/');
  });

  test('should display all 30 companies', async ({ page }) => {
    await expect(page.getByText('30 företag')).toBeVisible();
  });

  test('should filter companies by search', async ({ page }) => {
    await page.getByPlaceholder(/sök/i).fill('KPMG');
    await expect(page.getByRole('heading', { name: 'KPMG' })).toBeVisible();
  });

  test('should filter companies by tag', async ({ page }) => {
    await page.getByPlaceholder(/sök/i).fill('cybersecurity');
    // Should find at least one result (not show "no results" message)
    await expect(page.getByText(/inga företag matchade/i)).not.toBeVisible();
    const headings = page.locator('h3');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show no results for unknown search', async ({ page }) => {
    await page.getByPlaceholder(/sök/i).fill('xyznonexistent');
    await expect(page.getByText(/inga företag matchade/i)).toBeVisible();
  });

  test('should clear search', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/sök/i);
    await searchInput.fill('test');
    await searchInput.clear();
    await expect(page.getByText('30 företag')).toBeVisible();
  });

  test('should navigate to company detail page', async ({ page }) => {
    await page.getByRole('heading', { name: 'KPMG' }).click();
    await expect(page.getByText(/om företaget/i)).toBeVisible();
    await expect(page.getByText(/vad de söker/i)).toBeVisible();
    await expect(page.getByText(/smarta frågor/i)).toBeVisible();
    await expect(page.getByText(/dina anteckningar/i)).toBeVisible();
  });

  test('should show ice-breakers on detail page', async ({ page }) => {
    await page.getByRole('heading', { name: 'Deloitte' }).click();
    await expect(page.getByText(/ice-breakers/i)).toBeVisible();
  });

  test('should show smart questions on detail page', async ({ page }) => {
    await page.getByRole('heading', { name: 'KPMG' }).click();
    await expect(page.getByText(/smarta frågor/i)).toBeVisible();
    await expect(page.getByText(/hur deployar ni/i)).toBeVisible();
  });

  test('should navigate back from detail', async ({ page }) => {
    await page.getByRole('heading', { name: 'CGI' }).click();
    await expect(page.getByText(/om företaget/i)).toBeVisible();
    await page.locator('svg.lucide-arrow-left').click();
    await expect(page.getByText('30 företag')).toBeVisible();
  });
});
