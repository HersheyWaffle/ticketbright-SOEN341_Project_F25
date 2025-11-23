// src/backend/tests/controllers/event.controller.test.js
// 🔁 Adjust paths to match your project
import { createEvent, getEventById, getAllEvents } from "../../controllers/event.controller.js";
import * as eventService from "../../services/event.service.js";

jest.mock("../../services/event.service.js");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("event.controller - unit tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("createEvent returns 201 and created event on success", async () => {
    const req = {
      body: {
        title: "Game Night",
        description: "Board games and pizza",
        date: "2025-11-30T18:00:00.000Z",
        location: "Hall A",
        capacity: 50,
        ticketType: "FREE",
      },
    };
    const res = mockRes();

    const createdEvent = { id: "evt-1", ...req.body };
    eventService.createEvent.mockResolvedValue(createdEvent);

    await createEvent(req, res);

    expect(eventService.createEvent).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(createdEvent);
  });

  test("createEvent returns 400 if service throws a validation error", async () => {
    const req = { body: { title: "" } }; // invalid
    const res = mockRes();

    const error = new Error("Title is required");
    error.type = "VALIDATION_ERROR"; // or whatever you use

    eventService.createEvent.mockRejectedValue(error);

    await createEvent(req, res);

    expect(eventService.createEvent).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Title is required",
      })
    );
  });

  test("getEventById returns 200 + event when found", async () => {
    const req = { params: { id: "evt-123" } };
    const res = mockRes();

    const event = { id: "evt-123", title: "Career Fair" };
    eventService.getEventById.mockResolvedValue(event);

    await getEventById(req, res);

    expect(eventService.getEventById).toHaveBeenCalledWith("evt-123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(event);
  });

  test("getEventById returns 404 when event does not exist", async () => {
    const req = { params: { id: "missing" } };
    const res = mockRes();

    eventService.getEventById.mockResolvedValue(null);

    await getEventById(req, res);

    expect(eventService.getEventById).toHaveBeenCalledWith("missing");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/not found/i),
      })
    );
  });

  test("getAllEvents passes query filters to service", async () => {
    const req = {
      query: {
        category: "Tech",
        organization: "SCS",
      },
    };
    const res = mockRes();

    const events = [
      { id: "1", category: "Tech" },
      { id: "2", category: "Tech" },
    ];
    eventService.getAllEvents.mockResolvedValue(events);

    await getAllEvents(req, res);

    expect(eventService.getAllEvents).toHaveBeenCalledWith({
      category: "Tech",
      organization: "SCS",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(events);
  });
});
