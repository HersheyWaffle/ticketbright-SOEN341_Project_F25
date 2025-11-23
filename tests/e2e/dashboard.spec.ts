import { test, expect } from "@playwright/test";

test.describe("US-06 Organizer dashboard (E2E)", () => {
  test("shows analytics widgets", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("organizer@example.com");
    await page.getByLabel(/password/i).fill("Passw0rd!");
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.goto("/organizer/dashboard");
    await expect(page.getByText(/tickets issued/i)).toBeVisible();
    await expect(page.getByText(/attendance rate/i)).toBeVisible();
  });
});
