// tests/acceptance/tickets.purchase.accept.test.js

import request from "supertest";
import app from "../../src/backend/app.js";   // ⬅️ adjust path if needed

// Helper to create a fresh event for each test
async function createTestEvent(overrides = {}) {
  const baseEvent = {
    title: "Test Concert",
    description: "An automated test event",
    date: "2025-12-01T18:00:00.000Z",
    location: "Hall A",
    capacity: 3,
    ticketType: "FREE",
    ...overrides,
  };

  const res = await request(app)
    .post("/api/events")
    .send(baseEvent);

  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty("id"); // or "_id" depending on your model

  return res.body;
}

describe("US: Student purchases tickets for an event", () => {
  test("Student can successfully purchase a ticket for an event with available capacity", async () => {
    const event = await createTestEvent({ capacity: 10 });

    const purchasePayload = {
      eventId: event.id, // adjust if you use _id or eventId
      studentId: "40299147",
      studentEmail: "student@example.com",
    };

    const res = await request(app)
      .post("/api/tickets/purchase")
      .send(purchasePayload);

    expect(res.status).toBe(201);             // created / ticket generated
    expect(res.body).toHaveProperty("ticketId");
    expect(res.body).toHaveProperty("qrCode");
    expect(res.body.eventId).toBe(event.id);
  });

  test("Capacity decreases after each purchase and cannot go below zero", async () => {
    const event = await createTestEvent({ capacity: 2 });

    // 1st ticket
    const res1 = await request(app)
      .post("/api/tickets/purchase")
      .send({ eventId: event.id, studentId: "s1" });
    expect(res1.status).toBe(201);

    // 2nd ticket
    const res2 = await request(app)
      .post("/api/tickets/purchase")
      .send({ eventId: event.id, studentId: "s2" });
    expect(res2.status).toBe(201);

    // 3rd ticket should fail (capacity reached)
    const res3 = await request(app)
      .post("/api/tickets/purchase")
      .send({ eventId: event.id, studentId: "s3" });

    // depending on API, could be 400 (Bad Request) or 409 (Conflict)
    expect([400, 409]).toContain(res3.status);
    expect(res3.body).toHaveProperty("message");
  });

  test("Purchasing a ticket for a non-existent event returns an error", async () => {
    const res = await request(app)
      .post("/api/tickets/purchase")
      .send({
        eventId: "non-existent-event-id",
        studentId: "s1",
      });

    expect([400, 404]).toContain(res.status);
    expect(res.body).toHaveProperty("message");
  });
});
