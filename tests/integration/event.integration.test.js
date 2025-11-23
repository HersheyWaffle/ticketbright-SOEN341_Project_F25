// src/backend/tests/integration/event.integration.test.js

import request from "supertest";
import app from "../../app.js"; // ⬅️ ADJUST THIS PATH to whatever your app export is

// If you have a test DB reset helper, you can use it here
// import { resetTestDatabase } from "../utils/dbUtils.js";

describe("Integration: Event API", () => {
  // Optional: clean DB between tests
  // beforeEach(async () => {
  //   await resetTestDatabase();
  // });

  test("creates an event and retrieves it by id", async () => {
    const createPayload = {
      title: "Integration Test Event",
      description: "Event created in integration test",
      date: "2025-12-01T18:00:00.000Z",
      location: "Hall A",
      capacity: 100,
      ticketType: "FREE",
      category: "Tech",
      organization: "Software Society",
    };

    // 1. Create event
    const createRes = await request(app)
      .post("/api/events")
      .send(createPayload);

    expect(createRes.status).toBe(201);
    expect(createRes.body).toHaveProperty("id"); // or "_id" -> adjust if needed

    const eventId = createRes.body.id;

    // 2. Fetch same event
    const getRes = await request(app).get(`/api/events/${eventId}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toMatchObject({
      id: eventId,
      title: createPayload.title,
      description: createPayload.description,
      location: createPayload.location,
      ticketType: createPayload.ticketType,
    });
  });

  test("returns 404 when fetching a non-existing event", async () => {
    const res = await request(app).get("/api/events/non-existing-id");

    expect([404, 400]).toContain(res.status);
    expect(res.body).toHaveProperty("message");
  });

  test("updates an event and returns the updated version", async () => {
    // Create event
    const createRes = await request(app)
      .post("/api/events")
      .send({
        title: "Original Title",
        description: "Original description",
        date: "2025-12-02T18:00:00.000Z",
        location: "Room 101",
        capacity: 50,
        ticketType: "FREE",
      });

    expect(createRes.status).toBe(201);
    const eventId = createRes.body.id;

    const updatePayload = {
      title: "Updated Title",
      description: "Updated description",
      location: "Room 202",
      capacity: 80,
    };

    // Update event
    const updateRes = await request(app)
      .put(`/api/events/${eventId}`)
      .send(updatePayload);

    expect([200, 204]).toContain(updateRes.status);

    // Fetch again
    const getRes = await request(app).get(`/api/events/${eventId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.title).toBe(updatePayload.title);
    expect(getRes.body.description).toBe(updatePayload.description);
    expect(getRes.body.location).toBe(updatePayload.location);
    expect(getRes.body.capacity).toBe(updatePayload.capacity);
  });

  test("deletes an event and it can no longer be fetched", async () => {
    // Create event
    const createRes = await request(app)
      .post("/api/events")
      .send({
        title: "To Be Deleted",
        description: "This event will be deleted",
        date: "2025-12-03T18:00:00.000Z",
        location: "Room 303",
        capacity: 30,
        ticketType: "FREE",
      });

    expect(createRes.status).toBe(201);
    const eventId = createRes.body.id;

    // Delete event
    const deleteRes = await request(app).delete(`/api/events/${eventId}`);
    expect([200, 204]).toContain(deleteRes.status);

    // Try fetching again -> should be gone
    const getRes = await request(app).get(`/api/events/${eventId}`);
    expect([404, 400]).toContain(getRes.status);
  });
});
