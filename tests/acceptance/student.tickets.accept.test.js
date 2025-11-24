// tests/acceptance/student.tickets.accept.test.js

import request from "supertest";
import app from "../../src/backend/app.js"; // ⬅️ adjust path

async function createEventWithTickets(studentIds) {
  // 1) create event
  const eventRes = await request(app)
    .post("/api/events")
    .send({
      title: "Movie Night",
      description: "Campus movie screening",
      date: "2025-12-05T19:00:00.000Z",
      location: "Auditorium",
      capacity: studentIds.length,
      ticketType: "FREE",
    });

  expect(eventRes.status).toBe(201);
  const event = eventRes.body;

  // 2) create tickets for given studentIds
  for (const sId of studentIds) {
    const tRes = await request(app)
      .post("/api/tickets/purchase")
      .send({
        eventId: event.id, // or event._id
        studentId: sId,
        studentEmail: `${sId}@example.com`,
      });

    expect(tRes.status).toBe(201);
  }

  return event;
}

describe("US: Student views their tickets", () => {
  test("Student can see a list of tickets they own", async () => {
    const myId = "40299147";
    const others = ["40280000", "40280001"];

    await createEventWithTickets([myId, ...others]);

    const res = await request(app)
      .get(`/api/students/${myId}/tickets`); // ⬅️ adjust route

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // all tickets in this list should belong to the student
    for (const ticket of res.body) {
      expect(ticket.studentId).toBe(myId);
    }
  });

  test("Student with no tickets gets an empty list", async () => {
    const noTicketsId = "55555555";

    const res = await request(app)
      .get(`/api/students/${noTicketsId}/tickets`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});
