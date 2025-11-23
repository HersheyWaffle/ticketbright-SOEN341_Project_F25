import request from "supertest";
import { app } from "../../src/backend/app.js";

describe("US-05 Export attendees CSV (acceptance)", () => {
  it("Organizer downloads CSV for an event", async () => {
    const res = await request(app).get("/api/events/1/attendees/export");
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/csv/);
    expect(res.text).toMatch(/name,email,orderId,checkedIn/);
  });
});
