// src/backend/tests/services/event.service.test.mjs

import { jest } from "@jest/globals";

// 1) Mock the DB module before importing the service
jest.unstable_mockModule("../../config/db.js", () => {
  const queryMock = jest.fn().mockResolvedValue({
    rows: [{ id: "123", title: "From service" }],
  });

  return {
    default: {
      query: queryMock,
    },
  };
});

// 2) Import the mocked db and the real service (after mocks are in place)
const { default: pool } = await import("../../config/db.js");
const { createEventService } = await import("../../services/event.service.js");

describe("createEventService (service layer)", () => {
  test("calls the database exactly once", async () => {
    const eventData = {
      title: "Service Test Event",
      description: "desc",
      event_date: "2030-01-01",
      event_time: "10:00",
      capacity: 50,
      ticket_type: "free",
      organizer_id: "org123",
    };

    // We don't care what SQL is used here, only that it hits the DB once
    await createEventService(eventData);

    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test("propagates the DB result (or at least resolves without throwing)", async () => {
    const eventData = {
      title: "Another Service Test Event",
      description: "desc",
      event_date: "2030-01-02",
      event_time: "11:00",
      capacity: 100,
      ticket_type: "free",
      organizer_id: "org456",
    };

    let errorCaught = null;
    let result;

    try {
      result = await createEventService(eventData);
    } catch (err) {
      errorCaught = err;
    }

    // It should not throw:
    expect(errorCaught).toBeNull();

    // And it should return *something* (most implementations return the inserted row)
    expect(result).toBeDefined();
  });
});
