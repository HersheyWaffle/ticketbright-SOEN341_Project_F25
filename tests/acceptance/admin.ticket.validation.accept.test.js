// tests/acceptance/admin.ticket.validation.accept.test.js

import request from "supertest";
import app from "src/backend/app.js";   // adjust path if needed

async function createEventAndTicket() {
  // 1) Create event
  const eventRes = await request(app)
    .post("/api/events")
    .send({
      title: "Career Night",
      description: "Meet companies and recruiters",
      date: "2025-12-10T18:00:00.000Z",
      location: "Hall B",
      capacity: 100,
      ticketType: "FREE",
    });

  expect(eventRes.status).toBe(201);
  const event = eventRes.body;

  // 2) Purchase ticket (so that we get a QR code)
  const ticketRes = await request(app)
    .post("/api/tickets/purchase")
    .send({
      eventId: event.id,
      studentId: "40299147",
      studentEmail: "student@example.com",
    });

  expect(ticketRes.status).toBe(201);
  const ticket = ticketRes.body;

  // assume backend returns qrCode or some token for scanning
  expect(ticket).toHaveProperty("qrCode");

  return { event, ticket };
}

describe("US: Admin/Organizer validates tickets via QR code", () => {
  test("Valid QR code is accepted and marks ticket as used", async () => {
    const { ticket } = await createEventAndTicket();

    const validateRes = await request(app)
      .post("/api/tickets/validate")
      .send({
        qrCode: ticket.qrCode,    // adjust field name if different
      });

    expect(validateRes.status).toBe(200);
    expect(validateRes.body).toHaveProperty("valid", true);
    expect(validateRes.body).toHaveProperty("ticketId", ticket.ticketId);
  });

  test("Reusing the same QR code is rejected (already used)", async () => {
    const { ticket } = await createEventAndTicket();

    // 1st validation (check-in) – success
    const first = await request(app)
      .post("/api/tickets/validate")
      .send({ qrCode: ticket.qrCode });

    expect(first.status).toBe(200);
    expect(first.body.valid).toBe(true);

    // 2nd validation (same QR) – should fail
    const second = await request(app)
      .post("/api/tickets/validate")
      .send({ qrCode: ticket.qrCode });

    expect([400, 409]).toContain(second.status);
    expect(second.body).toHaveProperty("valid", false);
    expect(second.body).toHaveProperty("message");
  });

  test("Invalid / random QR code is rejected", async () => {
    const res = await request(app)
      .post("/api/tickets/validate")
      .send({
        qrCode: "this-is-not-a-real-ticket",
      });

    expect([400, 404]).toContain(res.status);
    expect(res.body).toHaveProperty("valid", false);
    expect(res.body).toHaveProperty("message");
  });
});
