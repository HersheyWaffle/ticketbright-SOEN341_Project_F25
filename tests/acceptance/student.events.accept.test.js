// tests/acceptance/student.events.accept.test.js

import request from "supertest";
import app from "../../src/backend/app.js";   // ⬅️ adjust path

async function createTestEvent(overrides = {}) {
  const baseEvent = {
    title: "Board Games Night",
    description: "Chill board games evening",
    date: "2025-11-30T18:00:00.000Z",
    location: "Student Lounge",
    capacity: 50,
    ticketType: "FREE",
    category: "Social",
    organization: "Games Club",
    ...overrides,
  };

  const res = await request(app)
    .post("/api/events")
    .send(baseEvent);

  expect(res.status).toBe(201);
  return res.body;
}

describe("US: Student discovers events", () => {
  test("Student can view a list of upcoming events", async () => {
    // arrange – make sure there is at least one event
    const created = await createTestEvent();

    const res = await request(app)
      .get("/api/events")
      .query({ upcoming: "true" }); // example query; adjust if needed

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const found = res.body.find((e) => e.title === created.title);
    expect(found).toBeDefined();
    expect(found).toHaveProperty("date");
    expect(found).toHaveProperty("location");
  });

  test("Student can filter events by category", async () => {
    await createTestEvent({ title: "Tech Talk", category: "Tech" });
    await createTestEvent({ title: "Yoga Session", category: "Wellness" });

    const res = await request(app)
      .get("/api/events")
      .query({ category: "Tech" });   // adjust query param name if needed

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // all returned events should match the filter
    for (const event of res.body) {
      expect(event.category).toBe("Tech");
    }
  });
});
