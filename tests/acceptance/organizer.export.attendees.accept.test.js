// tests/acceptance/organizer.export.attendees.accept.test.js

import request from "supertest";
import app from "../../src/backend/app.js";   // adjust path

async function createEventWithAttendees() {
  const createRes = await request(app)
    .post("/api/events")
    .send({
      title: "Hackathon",
      description: "24h coding challenge",
      date: "2025-11-20T09:00:00.000Z",
      location: "Engineering Building",
      capacity: 3,
      ticketType: "FREE",
      organizerId: "org-001",
    });

  expect(createRes.status).toBe(201);
  const event = createRes.body;

  // Add some attendees
  const students = [
    { id: "s1", email: "s1@example.com" },
    { id: "s2", email: "s2@example.com" },
    { id: "s3", email: "s3@example.com" },
  ];

  for (const s of students) {
    const ticketRes = await request(app)
      .post("/api/tickets/purchase")
      .send({
        eventId: event.id,
        studentId: s.id,
        studentEmail: s.email,
      });

    expect(ticketRes.status).toBe(201);
  }

  return event;
}

describe("US: Organizer exports attendee list as CSV", () => {
  test("CSV export returns text/csv content and correct headers", async () => {
    const event = await createEventWithAttendees();

    const res = await request(app)
      .get(`/api/events/${event.id}/attendees/export`)   // adjust route
      .expect(200);

    const contentType = res.headers["content-type"] || "";
    expect(contentType.includes("text/csv")).toBe(true);

    // sometimes Content-Disposition: attachment; filename="attendees.csv"
    const disposition = res.headers["content-disposition"] || "";
    expect(disposition.toLowerCase()).toContain("attachment");

    const body = res.text;

    // very basic CSV checks
    expect(body).toContain("studentId");
    expect(body).toContain("studentEmail");

    // we know we created these
    expect(body).toContain("s1@example.com");
    expect(body).toContain("s2@example.com");
    expect(body).toContain("s3@example.com");
  });
});
