import { test, expect } from "@playwright/test";

test("homepage has Task Tracker heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Task Tracker" })).toBeVisible(
    { timeout: 10000 },
  );
});

test("homepage loads correct URL", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/5173/);
});
