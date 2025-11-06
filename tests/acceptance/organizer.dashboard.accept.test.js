import request from "supertest";
import { app } from "../../src/backend/app.js";

describe("US-06 Organizer dashboard (acceptance)", () => {
  it("returns analytics JSON for existing event", async () => {
    const res = await request(app).get("/api/events/1/dashboard");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("eventId");
    expect(res.body).toHaveProperty("ticketsIssued");
    expect(res.body).toHaveProperty("attendanceRate");
  });

  it("returns 404 for non-existing event", async () => {
    const res = await request(app).get("/api/events/999/dashboard");
    expect(res.statusCode).toBe(404);
  });
});
