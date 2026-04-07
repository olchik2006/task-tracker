import { test, expect } from "@playwright/test";

test("homepage has Task Tracker heading", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.locator("h1")).toBeVisible();
});

test("homepage loads correct URL", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page).toHaveURL("http://localhost:5173");
});
