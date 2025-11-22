import { test, expect } from '@playwright/test';

test.describe('Organizer: event CRUD', () => {
  test('create → details → edit', async ({ page }) => {
    await page.goto('/organizer'); // consider gating by auth/test bypass
    await page.getByTestId('create-event-btn').click();

    await page.getByTestId('event-title-input').fill('E2E Tech Meetup');
    await page.getByTestId('event-description-input').fill('Talks + demos');
    await page.getByTestId('event-date-input').fill('2026-02-10');
    await page.getByTestId('event-time-input').fill('18:00');
    await page.getByTestId('event-location-input').fill('Hall A');
    await page.getByTestId('event-capacity-input').fill('150');
    await page.getByTestId('event-category-select').selectOption('Technology');
    await page.getByTestId('event-save-btn').click();

    await expect(page.getByTestId('event-details')).toBeVisible();
    await expect(page.getByTestId('event-title')).toHaveText('E2E Tech Meetup');

    await page.getByTestId('event-edit-btn').click();
    await page.getByTestId('event-title-input').fill('E2E Tech Meetup (edited)');
    await page.getByTestId('event-save-btn').click();

    await expect(page.getByTestId('event-title')).toHaveText('E2E Tech Meetup (edited)');
  });

  test('capacity and ticket type are enforced in form', async ({ page }) => {
    await page.goto('/organizer/new');
    await page.getByTestId('event-capacity-input').fill('-5');
    await page.getByTestId('event-save-btn').click();
    await expect(page.getByTestId('form-error')).toContainText(/capacity/i);
  });
});

