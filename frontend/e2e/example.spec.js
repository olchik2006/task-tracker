import { test, expect } from "@playwright/test";

test("homepage has Task Tracker heading", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.getByRole("heading", { name: "Task Tracker" })).toBeVisible(
    { timeout: 10000 },
  );
});

test("homepage loads correct URL", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page).toHaveURL("http://localhost:5173/");
});
