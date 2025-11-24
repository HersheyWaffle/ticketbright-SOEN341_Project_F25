import request from "supertest";
import { app } from "src/backend/app.js";

describe.skip("US-02 Organizer creates an event (acceptance)", () => {
  it("creates a valid event", async () => {
    const token = "ORGANIZER_JWT"; // replace after login implemented
    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "JSConf",
        description: "Campus conf",
        date: "2030-05-01T10:00:00Z",
        location: "Hall A",
        capacity: 100,
        price: 50
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
  });
});
