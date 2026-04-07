// @ts-check
import { test, expect } from "@playwright/test";

test("homepage loads successfully", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page).toHaveTitle(/Task Tracker/);
});

test("has input field for new task", async ({ page }) => {
  await page.goto("http://localhost:5173");
  const input = page.locator("input");
  await expect(input).toBeVisible();
});
