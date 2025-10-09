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