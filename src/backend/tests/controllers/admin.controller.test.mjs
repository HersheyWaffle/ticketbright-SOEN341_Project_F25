// src/backend/tests/controllers/admin.controller.test.mjs

import { jest } from "@jest/globals";

// Create mocks for all admin service functions used by the controller
const listPendingOrganizersSvcMock = jest.fn();
const approveOrganizerSvcMock = jest.fn();
const rejectOrganizerSvcMock = jest.fn();
const listPendingEventsSvcMock = jest.fn();
const moderateEventSvcMock = jest.fn();
const assignRoleSvcMock = jest.fn();

// Mock the admin.service module BEFORE importing the controller
jest.unstable_mockModule("../../services/admin.service.js", () => ({
  listPendingOrganizersSvc: listPendingOrganizersSvcMock,
  approveOrganizerSvc: approveOrganizerSvcMock,
  rejectOrganizerSvc: rejectOrganizerSvcMock,
  listPendingEventsSvc: listPendingEventsSvcMock,
  moderateEventSvc: moderateEventSvcMock,
  assignRoleSvc: assignRoleSvcMock,
}));

// Import the controller AFTER mocks are set up
const {
  listPendingOrganizers,
  approveOrganizer,
  assignRole,
} = await import("../../controllers/admin.controller.js");

// Simple mock for Express res
function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe("admin.controller", () => {
  beforeEach(() => {
    listPendingOrganizersSvcMock.mockReset();
    approveOrganizerSvcMock.mockReset();
    rejectOrganizerSvcMock.mockReset();
    listPendingEventsSvcMock.mockReset();
    moderateEventSvcMock.mockReset();
    assignRoleSvcMock.mockReset();
  });

  test("listPendingOrganizers responds with 200 and list from service", async () => {
    const fakeList = [
      { id: 1, email: "org1@example.com" },
      { id: 2, email: "org2@example.com" },
    ];
    listPendingOrganizersSvcMock.mockResolvedValueOnce(fakeList);

    const req = {}; // _req is unused in controller
    const res = mockRes();

    await listPendingOrganizers(req, res);

    expect(listPendingOrganizersSvcMock).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(fakeList);
  });

  test("approveOrganizer returns 404 when service returns null (not found)", async () => {
    approveOrganizerSvcMock.mockResolvedValueOnce(null);

    const req = { params: { id: "non-existing-id" } };
    const res = mockRes();

    await approveOrganizer(req, res);

    expect(approveOrganizerSvcMock).toHaveBeenCalledWith("non-existing-id");
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Organizer not found" });
  });

  test("assignRole returns 400 when userId or role is missing", async () => {
    const res1 = mockRes();
    const req1 = { body: { role: "admin" } }; // missing userId

    await assignRole(req1, res1);
    expect(res1.statusCode).toBe(400);
    expect(res1.body).toEqual({ message: "userId and role required" });

    const res2 = mockRes();
    const req2 = { body: { userId: "user-123" } }; // missing role

    await assignRole(req2, res2);
    expect(res2.statusCode).toBe(400);
    expect(res2.body).toEqual({ message: "userId and role required" });
  });
});
