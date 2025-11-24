import request from "supertest";
import { app } from "src/backend/app.js";

describe.skip("US-01 Auth & role-based access (acceptance)", () => {
  it("attendee logs in successfully", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "attendee@example.com", password: "Passw0rd!" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("attendee is blocked from organizer area", async () => {
    const token = "ATTENDEE_JWT"; // replace after login is real
    const res = await request(app)
      .get("/api/organizer/dashboard")
      .set("Authorization", `Bearer ${token}`);
    expect([401,403]).toContain(res.statusCode);
  });
});
