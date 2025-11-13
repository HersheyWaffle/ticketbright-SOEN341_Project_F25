# Scan Results And Change Plan

Scope: Fix event images path, 404 on ticket purchase, and switch event URLs from DB id to slug (`eventID`).

## Summary Findings

- Backend already serves static assets from `/data` (`src/backend/server.js`), and event creation saves `bannerPath` under `data/events/...`.
- 404 on purchase is due to frontend calling a non-existent endpoint (`/api/events/:id/increment`) while backend exposes `PATCH /api/events/:id/tickets`.
- Event pages and search currently pass the DB primary key (`Event.id`, UUID) in URLs. The model already has a unique slug-like `eventID`, so we can switch to that and keep backward compatibility.

## Planned Changes

- Scope: Fix image paths, align purchase endpoint, and move event URLs to slug (`eventID`), with legacy support for UUIDs.

### 1) Event Images Not Displaying

- Backend normalization (defensive fix)
  - Update `getEventById` to sanitize `bannerPath` on response by stripping a leading `src/backend/` if present.
    - File: `src/backend/controllers/eventCreateController.js:60` (in `getEventById`)
- Frontend normalization (belt-and-suspenders)
  - In event page, normalize `bannerPath` before assigning to `img.src`:
    - File: `src/frontend/event/script.js:36`
    - Logic: if `bannerPath` starts with `src/backend/`, replace with ``.
- No change needed to static serving (already correct):
  - `src/backend/server.js` serves `/data` from `src/backend/data`.

Acceptance: All event banners resolve to `/${event.bannerPath}` and load via `/data/...` regardless of old records.

### 2) Ticket Purchase Returns 404

- Frontend: point to existing backend route
  - Change purchase API call from `PATCH /api/events/:id/increment` to `PATCH /api/events/:id/tickets`.
    - File: `src/frontend/purchase/purchase.js:275`
- Backend: add a compatibility alias (optional but safer)
  - Add `router.patch(":id/increment", incrementTicket)` as an alias to prevent future regressions from older clients.
    - File: `src/backend/routes/eventCreateRoutes.js` (near line 46)
- Verify controller returns expected payload
  - Confirm `incrementTicket` returns `{ success: true, ticketsSold: number }`.
    - File: `src/backend/controllers/eventCreateController.js:177` (already correct)

Acceptance: Confirm purchase flow returns 200/JSON and tickets sold increments; no 404.

### 3) Event URLs Should Use Slug (`eventID`) Instead Of DB `id`

- Backend: accept slug in routes (with legacy fallback)
  - Introduce a small helper to fetch by slug first, then fallback to PK:
    - File: `src/backend/controllers/eventCreateController.js`
    - Used by:
      - `getEventById` (current `findByPk` → first try `findOne({ where: { eventID: param } })`, else `findByPk(param)`).
        - File: `src/backend/controllers/eventCreateController.js:60`
      - `incrementTicket` (same lookup strategy).
        - File: `src/backend/controllers/eventCreateController.js:177`
- Frontend: construct links using `eventID` (slug), not `id`
  - Search results page:
    - Store slug and navigate with it:
      - Change dataset assignment from `e.id` to `e.eventID`.
        - File: `src/frontend/search/event-search.js:301`
      - Click handler continues to use `data-event-id`; value becomes slug.
        - File: `src/frontend/search/event-search.js:81` (navigation line)
  - Event page → Purchase page:
    - Already passes through the same `id` param; with previous change, that `id` will be a slug.
    - File: `src/frontend/event/script.js:55–60` (no change needed besides using slug now)
  - Event page data fetch:
    - Keep `GET /api/events/:id`, which after backend change will accept slug (and still accept UUIDs).
    - File: `src/frontend/event/script.js:28` (no path change)
- Optional: rename URL param to `eventID` in the frontend for clarity while staying compatible (`?id=` still works). I’ll keep `?id=` to minimize ripple.

Acceptance:
- Users land on `../event/event.html?id=<slug>` instead of UUID.
- API `GET /api/events/:slug` returns the event.
- Old links with UUID continue to work due to fallback.

## Notes/Risks

- Some analytics/admin code references another data source (`backend/services/*` with `events` table). I will not change those paths in this pass; they don’t affect the three reported issues.
- If the existing SQLite rows have `bannerPath` saved with `src/backend/...`, the defensive normalization ensures images load without a DB migration. We can add a one-time migration later if you want.

