import { test, expect } from '@playwright/test';

test.describe('Admin: approvals, moderation, platform stats', () => {
  test('approve organizer account', async ({ page }) => {
    await page.goto('/admin/organizers/pending');
    await expect(page.getByTestId('pending-list')).toBeVisible();

    const first = page.getByTestId('pending-organizer-card').first();
    await first.getByTestId('approve-btn').click();
    await expect(first.getByTestId('status-badge')).toHaveText(/approved/i);
  });

  test('reject organizer account with reason', async ({ page }) => {
    await page.goto('/admin/organizers/pending');
    const first = page.getByTestId('pending-organizer-card').first();
    await first.getByTestId('reject-btn').click();
    await page.getByTestId('reject-reason-input').fill('Incomplete profile');
    await page.getByTestId('confirm-reject-btn').click();
    await expect(first.getByTestId('status-badge')).toHaveText(/rejected/i);
  });

  test('moderate event listing (hide/unhide)', async ({ page }) => {
    await page.goto('/admin/events');
    const first = page.getByTestId('event-row').first();
    await first.getByTestId('hide-btn').click();
    await expect(first.getByTestId('visibility-state')).toHaveText(/hidden/i);

    await first.getByTestId('unhide-btn').click();
    await expect(first.getByTestId('visibility-state')).toHaveText(/visible/i);
  });

  test('platform stats load on admin dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    await expect(page.getByTestId('stats-total-events')).toHaveText(/^\d+$/);
    await expect(page.getByTestId('stats-tickets-issued')).toHaveText(/^\d+$/);
    await expect(page.getByTestId('stats-attendance-trend')).toBeVisible();
  });
});
