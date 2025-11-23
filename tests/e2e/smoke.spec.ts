import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/TicketBright/i);
});

test("export button appears for organizer", async ({ page }) => {
  await page.goto("/login");
  await page.fill("#email", "organizer@example.com");
  await page.fill("#password", "Passw0rd!");
  await page.click("button[type=submit]");
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("button", { name: /Export Attendee List/i })).toBeVisible();
});

