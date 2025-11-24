// tests/acceptance/admin.organizer-management.accept.test.js

import request from "supertest";
import app from "src/backend/app.js"; // ⬅️ adjust path

async function createPendingOrganizer() {
  const res = await request(app)
    .post("/api/organizers/apply") // or /api/organizers
    .send({
      name: "CS Games Club",
      email: "club@example.com",
      description: "Runs coding competitions",
    });

  expect([201, 202].includes(res.status)).toBe(true);
  expect(res.body).toHaveProperty("id");
  expect(res.body).toHaveProperty("status");

  return res.body;
}

describe("US: Admin manages organizer accounts", () => {
  test("Admin approves a pending organizer", async () => {
    const adminId = "admin-001";
    const organizer = await createPendingOrganizer();

    const approveRes = await request(app)
      .post(`/api/admin/${adminId}/organizers/${organizer.id}/approve`);

    expect([200, 204]).toContain(approveRes.status);

    const getRes = await request(app)
      .get(`/api/organizers/${organizer.id}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.status).toMatch(/approved/i);
  });

  test("Admin rejects a pending organizer with a reason", async () => {
    const adminId = "admin-002";
    const organizer = await createPendingOrganizer();

    const rejectRes = await request(app)
      .post(`/api/admin/${adminId}/organizers/${organizer.id}/reject`)
      .send({
        reason: "Insufficient information",
      });

    expect([200, 204]).toContain(rejectRes.status);

    const getRes = await request(app)
      .get(`/api/organizers/${organizer.id}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.status).toMatch(/rejected/i);
    expect(getRes.body).toHaveProperty("rejectionReason");
  });

  test("Admin cannot approve a non-existing organizer", async () => {
    const adminId = "admin-003";

    const res = await request(app)
      .post(`/api/admin/${adminId}/organizers/non-existent-id/approve`);

    expect([400, 404]).toContain(res.status);
    expect(res.body).toHaveProperty("message");
  });
});
