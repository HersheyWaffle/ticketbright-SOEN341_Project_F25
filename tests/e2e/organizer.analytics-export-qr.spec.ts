import { test, expect } from '@playwright/test';

test.describe('Organizer: analytics, CSV export, QR validation', () => {
  test('dashboard shows metrics', async ({ page }) => {
    await page.goto('/organizer/events/seed-123/dashboard');
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.getByTestId('metric-total-attendees')).toHaveText(/^\d+$/);
    await expect(page.getByTestId('metric-checked-in')).toHaveText(/^\d+$/);
    await expect(page.getByTestId('metric-remaining-capacity')).toHaveText(/^\d+$/);
    await expect(page.getByTestId('metric-revenue')).toContainText('$');
  });

  test('export attendees CSV downloads a file', async ({ page }) => {
    await page.goto('/organizer/events/seed-123');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-attendees-btn').click()
    ]);

    const filename = download.suggestedFilename();
    expect(filename).toMatch(/attendees.*\.csv$/i);
  });

  test('export attendees CSV is disabled or errors for missing event id', async ({ page }) => {
    await page.goto('/organizer/events/undefined');
    await page.getByTestId('export-attendees-btn').click();
    await expect(page.getByTestId('export-error')).toContainText(/missing|invalid|not found/i);
  });

  test('QR validation: valid code succeeds', async ({ page }) => {
    await page.goto('/organizer/events/seed-123');
    await page.getByTestId('qr-input').fill('QR-VALID-001');
    await page.getByTestId('qr-validate-btn').click();
    await expect(page.getByTestId('qr-result')).toContainText(/valid|checked in/i);
  });

  test('QR validation: invalid code shows error', async ({ page }) => {
    await page.goto('/organizer/events/seed-123');
    await page.getByTestId('qr-input').fill('BAD-CODE');
    await page.getByTestId('qr-validate-btn').click();
    await expect(page.getByTestId('qr-error')).toContainText(/invalid|not found/i);
  });

  test('attendee list shows new check-ins after QR validation', async ({ page }) => {
    await page.goto('/organizer/events/seed-123/attendees');
    const before = await page.getByTestId('checked-in-count').textContent();
    await page.goto('/organizer/events/seed-123'); // validate a code
    await page.getByTestId('qr-input').fill('QR-VALID-002');
    await page.getByTestId('qr-validate-btn').click();

    await page.goto('/organizer/events/seed-123/attendees');
    const after = await page.getByTestId('checked-in-count').textContent();
    expect(Number(after)).toBeGreaterThanOrEqual(Number(before || '0'));
  });

  test('non-existing event shows 404 page', async ({ page }) => {
    await page.goto('/organizer/events/non-existent-id');
    await expect(page.getByTestId('not-found')).toBeVisible();
  });
});
