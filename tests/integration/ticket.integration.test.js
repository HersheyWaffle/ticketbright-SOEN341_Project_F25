// src/backend/tests/integration/ticket.integration.test.js

import request from "supertest";
import app from "../../app.js"; // ⬅️ ADJUST PATH

async function createEventWithCapacity(capacity = 5) {
  const res = await request(app)
    .post("/api/events")
    .send({
      title: "Ticket Integration Event",
      description: "For ticket integration tests",
      date: "2025-12-10T18:00:00.000Z",
      location: "Main Hall",
      capacity,
      ticketType: "FREE",
      category: "Social",
      organization: "Integration Club",
    });

  expect(res.status).toBe(201);
  return res.body;
}

describe("Integration: Tickets + Events", () => {
  test("purchasing a ticket links it to the event", async () => {
    const event = await createEventWithCapacity(10);

    const purchaseRes = await request(app)
      .post("/api/tickets/purchase")
      .send({
        eventId: event.id,      // adjust if your field is different
        studentId: "40299147",
        studentEmail: "student@example.com",
      });

    expect(purchaseRes.status).toBe(201);
    expect(purchaseRes.body).toHaveProperty("ticketId");
    expect(purchaseRes.body).toHaveProperty("eventId", event.id);

    const ticketId = purchaseRes.body.ticketId;

    // Optional: if you have GET /api/tickets/:id
    const getTicket = await request(app).get(`/api/tickets/${ticketId}`);

    if (getTicket.status === 200) {
      expect(getTicket.body).toHaveProperty("eventId", event.id);
      expect(getTicket.body).toHaveProperty("studentId", "40299147");
    }
  });

  test("event capacity is respected across multiple ticket purchases", async () => {
    const event = await createEventWithCapacity(2);

    // 1st ticket
    const r1 = await request(app)
      .post("/api/tickets/purchase")
      .send({ eventId: event.id, studentId: "s1" });
    expect(r1.status).toBe(201);

    // 2nd ticket
    const r2 = await request(app)
      .post("/api/tickets/purchase")
      .send({ eventId: event.id, studentId: "s2" });
    expect(r2.status).toBe(201);

    // 3rd ticket: capacity exceeded
    const r3 = await request(app)
      .post("/api/tickets/purchase")
      .send({ eventId: event.id, studentId: "s3" });

    expect([400, 409]).toContain(r3.status);
    expect(r3.body).toHaveProperty("message");
  });

  test("remaining capacity (or analytics) is updated after ticket purchases", async () => {
    const event = await createEventWithCapacity(3);

    await request(app)
      .post("/api/tickets/purchase")
      .send({ eventId: event.id, studentId: "s1" });

    await request(app)
      .post("/api/tickets/purchase")
      .send({ eventId: event.id, studentId: "s2" });

    // Now fetch the event to inspect capacity-related fields
    const getRes = await request(app).get(`/api/events/${event.id}`);
    expect(getRes.status).toBe(200);

    // Depending on your schema you might have:
    // - ticketsSold
    // - remainingCapacity
    // - or capacity stays constant but "tickets" array length changes

    // 👉 Pick ONE of these assertions and adjust names as needed:

    // if you track ticketsSold:
    // expect(getRes.body.ticketsSold).toBe(2);

    // if you track remainingCapacity:
    // expect(getRes.body.remainingCapacity).toBe(1);

    // if you just attach an attendees/tickets array:
    // expect(getRes.body.tickets).toHaveLength(2);
  });

  test("cannot purchase a ticket for a deleted event", async () => {
    const event = await createEventWithCapacity(5);

    // delete the event
    const delRes = await request(app).delete(`/api/events/${event.id}`);
    expect([200, 204]).toContain(delRes.status);

    // attempt to buy ticket for deleted event
    const purchaseRes = await request(app)
      .post("/api/tickets/purchase")
      .send({ eventId: event.id, studentId: "ghost-student" });

    expect([400, 404]).toContain(purchaseRes.status);
    expect(purchaseRes.body).toHaveProperty("message");
  });
});
