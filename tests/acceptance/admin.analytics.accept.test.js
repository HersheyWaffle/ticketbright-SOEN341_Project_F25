// tests/acceptance/admin.analytics.accept.test.js

import request from "supertest";
import app from "src/backend/app.js"; 

async function seedEventsAndTickets() {
  // Event 1
  const e1 = await request(app)
    .post("/api/events")
    .send({
      title: "Tech Talk",
      description: "Cloud computing 101",
      date: "2025-11-20T18:00:00.000Z",
      location: "Room A",
      capacity: 100,
      ticketType: "FREE",
    });
  expect(e1.status).toBe(201);

  // Event 2
  const e2 = await request(app)
    .post("/api/events")
    .send({
      title: "Art Expo",
      description: "Student art showcase",
      date: "2025-11-25T18:00:00.000Z",
      location: "Gallery",
      capacity: 50,
      ticketType: "FREE",
    });
  expect(e2.status).toBe(201);

  // Some tickets
  const events = [e1.body, e2.body];
  const students = ["s1", "s2", "s3", "s4"];

  for (let i = 0; i < students.length; i++) {
    const event = events[i % events.length];
    const res = await request(app)
      .post("/api/tickets/purchase")
      .send({
        eventId: event.id,
        studentId: students[i],
        studentEmail: `${students[i]}@example.com`,
      });
    expect(res.status).toBe(201);
  }
}

describe("US: Admin views global analytics", () => {
  test("Admin can see total events and total tickets issued", async () => {
    const adminId = "admin-global-1";

    await seedEventsAndTickets();

    const res = await request(app)
      .get(`/api/admin/${adminId}/analytics`); // ⬅️ adjust route

    expect(res.status).toBe(200);

    // Example expected shape – customize to your API
    expect(res.body).toHaveProperty("totalEvents");
    expect(res.body).toHaveProperty("totalTickets");
    expect(res.body.totalEvents).toBeGreaterThanOrEqual(2);
    expect(res.body.totalTickets).toBeGreaterThanOrEqual(4);
  });

  test("Admin analytics include attendance or capacity metrics if available", async () => {
    const adminId = "admin-global-2";

    const res = await request(app)
      .get(`/api/admin/${adminId}/analytics`);

    expect(res.status).toBe(200);

    // Only assert fields that actually exist in your response
    // For example:
    // expect(res.body).toHaveProperty("averageAttendanceRate");
    // expect(res.body).toHaveProperty("totalCapacity");
  });
});
