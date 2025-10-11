import request from "supertest";
import app from "../../app.js";

describe("GET /api/events/:eventId/attendees/export", () => {
  it("should export attendee list as CSV", async () => {
    const token = "mockOrganizerJWT";
    const res = await request(app)
      .get("/api/events/123/attendees/export")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/csv/);
  });
});

describe("GET /api/events/:eventId/dashboard", () => {
  it("returns dashboard JSON for existing event", async () => {
    const res = await request(app).get("/api/events/1/dashboard").expect(200);
    expect(res.body).toHaveProperty("eventId");
    expect(res.body).toHaveProperty("ticketsIssued");
    expect(res.body).toHaveProperty("attendanceRate");
  });

  it("returns 404 for non-existing event", async () => {
    await request(app).get("/api/events/999999/dashboard").expect(404);
  });
});