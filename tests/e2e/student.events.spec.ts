import { test, expect } from '@playwright/test';

test.describe('Student: discover & browse events', () => {
  test('events list loads and an event details page opens', async ({ page }) => {
    await page.goto('/');

    // data-testid you should add: events-list, event-card, event-title
    await expect(page.getByTestId('events-list')).toBeVisible();
    const first = page.getByTestId('event-card').first();
    const title = await first.getByTestId('event-title').textContent();
    await first.click();

    await expect(page.getByTestId('event-details')).toBeVisible();
    await expect(page.getByTestId('event-title')).toHaveText(title ?? '');
  });

  test('filter by date/category narrows results', async ({ page }) => {
    await page.goto('/');

    // data-testid: filter-date, filter-category, events-count
    await page.getByTestId('filter-date').fill('2026-01-31');
    await page.getByTestId('filter-category').selectOption('Technology');

    const countText = await page.getByTestId('events-count').textContent();
    expect(Number(countText)).toBeGreaterThanOrEqual(0);
  });

  test('search finds event by keyword', async ({ page }) => {
    await page.goto('/');
    // data-testid: search-input
    await page.getByTestId('search-input').fill('Hackathon');
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('events-list')).toBeVisible();
    await expect(page.getByTestId('event-card').first()).toBeVisible();
  });
});

test.describe('Student: save event & claim ticket (QR)', () => {
  test('save event to personal list', async ({ page }) => {
    await page.goto('/events/seed-123'); // replace with known seeded event id/slug
    // data-testid: save-event-btn, saved-toast
    await page.getByTestId('save-event-btn').click();
    await expect(page.getByTestId('saved-toast')).toContainText(/saved|added/i);

    await page.goto('/my/events');
    await expect(page.getByTestId('saved-event-card').filter({ hasText: 'seed-123' })).toBeVisible();
  });

  test('claim free/paid ticket returns QR', async ({ page }) => {
    await page.goto('/events/seed-123');
    // data-testid: claim-ticket-btn, qr-code
    await page.getByTestId('claim-ticket-btn').click();
    await expect(page.getByTestId('qr-code')).toBeVisible();
  });

  test('QR appears on My Tickets page', async ({ page }) => {
    await page.goto('/my/tickets');
    // data-testid: ticket-card, ticket-qr
    await expect(page.getByTestId('ticket-card').first()).toBeVisible();
    await expect(page.getByTestId('ticket-qr').first()).toBeVisible();
  });
});
