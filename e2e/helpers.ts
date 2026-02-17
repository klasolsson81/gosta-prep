import type { Page } from '@playwright/test';

export async function setupProfile(page: Page, profile?: Partial<{
  name: string;
  linkedin: string;
  portfolio: string;
  github: string;
  cvUrl: string;
}>) {
  await page.evaluate((p) => {
    localStorage.setItem('gosta-profile', JSON.stringify({
      name: p?.name ?? 'Test',
      linkedin: p?.linkedin ?? '',
      portfolio: p?.portfolio ?? '',
      github: p?.github ?? '',
      cvUrl: p?.cvUrl ?? '',
      onboardingComplete: true,
    }));
  }, profile);
}

export async function navigateTo(page: Page, path: string) {
  await page.goto(path);
}
