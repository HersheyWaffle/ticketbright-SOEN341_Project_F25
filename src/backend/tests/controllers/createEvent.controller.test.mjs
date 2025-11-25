// src/backend/tests/controllers/createEvent.controller.test.mjs

import { jest } from "@jest/globals";

// Mocks for the Event model
const findOneMock = jest.fn();
const createMock = jest.fn();

// 1) Mock the Event model BEFORE importing the controller
jest.unstable_mockModule("../../models/event.js", () => ({
  default: {
    findOne: findOneMock,
    create: createMock,
  },
}));

// 2) Import the controller AFTER mocks are set up
// IMPORTANT: make sure this path matches your actual file name.
// If your file is src/backend/controllers/event.controller.js, change to "../../controllers/event.controller.js".
const { createEvent } = await import(
  "../../controllers/eventCreateController.js"
);

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

beforeEach(() => {
  findOneMock.mockReset();
  createMock.mockReset();
});

describe("createEvent controller (new implementation)", () => {
  test("returns 400 if title is missing", async () => {
    const req = {
      body: {
        // title missing
        description: "desc",
        date: "2030-01-01",
        capacity: 50,
      },
    };
    const res = mockRes();

    await createEvent(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({
      success: false,
      error: "Event title is required",
    });
    expect(findOneMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });

  test("returns 400 if a published event with same title already exists", async () => {
    // Simulate an existing published event
    findOneMock.mockResolvedValueOnce({
      id: 1,
      eventID: "my_event",
      status: "published",
    });

    const req = {
      body: {
        title: "My Event",
        description: "desc",
        date: "2030-01-01",
        capacity: 50,
      },
    };
    const res = mockRes();

    await createEvent(req, res);

    expect(findOneMock).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({
      success: false,
      error: "An event with this title already exists",
    });
    expect(createMock).not.toHaveBeenCalled();
  });

  test("creates a new event and returns 200 with success", async () => {
    // No existing event
    findOneMock.mockResolvedValueOnce(null);

    // Whatever Event.create returns becomes savedEvent
    createMock.mockResolvedValueOnce({
      id: 123,
      title: "New Event",
      eventID: "new_event",
      description: "desc",
      date: "2030-01-01",
      capacity: 50,
    });

    const req = {
      body: {
        title: "New Event",
        description: "desc",
        date: "2030-01-01",
        capacity: 50,
      },
    };
    const res = mockRes();

    await createEvent(req, res);

    expect(findOneMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledTimes(1);

    // Controller responds with 200 and wrapped event object
    expect(res.statusCode).toBe(200);
    expect(res.payload).toEqual({
      success: true,
      event: {
        id: 123,
        title: "New Event",
        eventID: "new_event",
        description: "desc",
        date: "2030-01-01",
        capacity: 50,
      },
    });
  });
});
