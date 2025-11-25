// src/backend/tests/controllers/createEvent.controller.test.mjs

import { jest } from "@jest/globals";

// 1) Mock DB layer BEFORE controller loads
jest.unstable_mockModule("../../config/db.js", () => ({
  default: {}, // fake pg pool (we don't use it in these tests)
}));

// 2) Mock service layer BEFORE controller loads
jest.unstable_mockModule("../../services/event.service.js", () => ({
  // used by createEvent
  createEventService: async () => ({ id: "123", title: "Created Event" }),

  // also imported by event.controller.js – must exist even if not used here
  getAttendeesForEvent: async () => [],
  fetchEventDashboard: async () => ({}),
}));

// 3) Now safely import controller AFTER mocks are in place
const { createEvent } = await import("../../controllers/event.controller.js");

// Simple mock Express res object
function mockRes() {
  return {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.payload = data;
      return this;
    },
  };
}

describe("createEvent controller", () => {
  test("400 for missing required fields", async () => {
    const req = {
      body: {
        // title missing on purpose
        description: "desc",
        event_date: "2030-01-01",
        event_time: "10:00",
        capacity: 50,
        ticket_type: "free",
      },
      user: { id: "org123" },
    };

    const res = mockRes();

    await createEvent(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({ message: "Missing required fields." });
  });

  test("400 for invalid paid event price", async () => {
    const req = {
      body: {
        title: "Paid event",
        description: "desc",
        event_date: "2030-01-01",
        event_time: "10:00",
        capacity: 50,
        ticket_type: "paid",
        price: -5, // invalid
      },
      user: { id: "org123" },
    };

    const res = mockRes();

    await createEvent(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({
      message: "For paid events, price must be a positive number.",
    });
  });

  test("201 for valid event", async () => {
    const req = {
      body: {
        title: "Valid Event",
        description: "desc",
        event_date: "2030-01-01",
        event_time: "10:00",
        capacity: 50,
        ticket_type: "free",
      },
      user: { id: "org123" },
    };

    const res = mockRes();

    await createEvent(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.payload).toEqual(
      expect.objectContaining({
        id: "123",
        title: "Created Event",
      })
    );
  });
});
