import request from "supertest";
import { app } from "../../src/backend/app.js";

describe.skip("US-04 QR validation (acceptance)", () => {
  it("first scan admits attendee and marks USED", async () => {
    const staff = "STAFF_JWT";
    const qr = "XYZ";
    const res = await request(app)
      .post(`/api/qr/validate`)
      .set("Authorization", `Bearer ${staff}`)
      .send({ qrCode: qr });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ status: "USED" });
  });

  it("second scan is rejected", async () => {
    const staff = "STAFF_JWT";
    const qr = "XYZ";
    const res = await request(app)
      .post(`/api/qr/validate`)
      .set("Authorization", `Bearer ${staff}`)
      .send({ qrCode: qr });
    expect([400,409]).toContain(res.statusCode);
  });
});
