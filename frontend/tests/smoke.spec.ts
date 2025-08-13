import { test, expect } from '@playwright/test';

test('home renders and loads assets', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=블로그 자동화')).toBeVisible();
  // CSS/JS asset loaded
  const hasStyle = await page.evaluate(() => !!document.querySelector('link[rel="stylesheet"]'));
  expect(hasStyle).toBeTruthy();
}); 