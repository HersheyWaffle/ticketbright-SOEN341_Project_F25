import { test, expect } from "@playwright/test";

test.describe("US-05 Export CSV (E2E)", () => {
  test("organizer logs in and downloads CSV", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("organizer@example.com");
    await page.getByLabel(/password/i).fill("Passw0rd!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/organizer/);

    await page.goto("/organizer/events/1");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Export Attendee List/i }).click()
    ]);
    const name = await download.suggestedFilename();
    expect(name).toMatch(/attendees.*\.csv$/);
  });
});
