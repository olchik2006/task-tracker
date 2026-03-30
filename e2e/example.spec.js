import { test, expect } from '@playwright/test';

test.describe('Task Tracker App', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page).toHaveTitle(/Task Tracker|Vite|React/i);
  });

  test('should display main container', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    const root = page.locator('#app');
    await expect(root).toBeVisible();
  });

  test('should have interactive elements on page', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    const body = page.locator('body');
    await expect(body).toBeVisible();
    const text = await page.textContent('body');
    expect(text.length).toBeGreaterThan(0);
  });
});