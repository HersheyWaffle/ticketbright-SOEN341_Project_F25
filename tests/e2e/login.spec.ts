import { test, expect } from "@playwright/test";

test("site root responds (dev server required)", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/localhost:3000/);
});
