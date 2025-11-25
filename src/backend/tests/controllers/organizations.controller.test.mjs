// src/backend/tests/controllers/organizations.controller.test.mjs

import { jest } from "@jest/globals";

// --- Service mocks --- //
const listOrganizationsSvcMock = jest.fn();
const createOrganizationSvcMock = jest.fn();
const updateOrganizationSvcMock = jest.fn();
const setOrganizationStatusSvcMock = jest.fn();
const listMembersSvcMock = jest.fn();
const addMemberSvcMock = jest.fn();
const updateMemberRoleSvcMock = jest.fn();
const removeMemberSvcMock = jest.fn();

// 1) Mock the organizations.service BEFORE importing the controller
jest.unstable_mockModule("../../services/organizations.service.js", () => ({
  listOrganizationsSvc: listOrganizationsSvcMock,
  createOrganizationSvc: createOrganizationSvcMock,
  updateOrganizationSvc: updateOrganizationSvcMock,
  setOrganizationStatusSvc: setOrganizationStatusSvcMock,
  listMembersSvc: listMembersSvcMock,
  addMemberSvc: addMemberSvcMock,
  updateMemberRoleSvc: updateMemberRoleSvcMock,
  removeMemberSvc: removeMemberSvcMock,
}));

// 2) Import the controller AFTER mocks are set up
const {
  listOrganizations,
  createOrganization,
  updateOrganization,
  activateOrganization,
  deactivateOrganization,
  listMembers,
  addMember,
  updateMemberRole,
  removeMember,
} = await import("../../controllers/organizations.controller.js");

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

beforeEach(() => {
  listOrganizationsSvcMock.mockReset();
  createOrganizationSvcMock.mockReset();
  updateOrganizationSvcMock.mockReset();
  setOrganizationStatusSvcMock.mockReset();
  listMembersSvcMock.mockReset();
  addMemberSvcMock.mockReset();
  updateMemberRoleSvcMock.mockReset();
  removeMemberSvcMock.mockReset();
});

describe("organizations.controller", () => {
  test("listOrganizations returns 200 and data from service", async () => {
    const fakeOrgs = [{ id: 1, name: "Org A" }];
    listOrganizationsSvcMock.mockResolvedValueOnce(fakeOrgs);

    const req = { query: { status: "active" } };
    const res = mockRes();

    await listOrganizations(req, res);

    expect(listOrganizationsSvcMock).toHaveBeenCalledWith("active");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(fakeOrgs);
  });

  test("createOrganization returns 400 when service returns bad", async () => {
    createOrganizationSvcMock.mockResolvedValueOnce({ bad: "Invalid name" });

    const req = { body: { name: "" } };
    const res = mockRes();

    await createOrganization(req, res);

    expect(createOrganizationSvcMock).toHaveBeenCalledWith(req.body);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Invalid name" });
  });

  test("createOrganization returns 201 and org on success", async () => {
    const org = { id: 10, name: "New Org" };
    createOrganizationSvcMock.mockResolvedValueOnce({ org });

    const req = { body: { name: "New Org" } };
    const res = mockRes();

    await createOrganization(req, res);

    expect(createOrganizationSvcMock).toHaveBeenCalledWith(req.body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(org);
  });

  test("updateOrganization returns 404 when notFound", async () => {
    updateOrganizationSvcMock.mockResolvedValueOnce({ notFound: true });

    const req = { params: { id: "org-1" }, body: { name: "Updated" } };
    const res = mockRes();

    await updateOrganization(req, res);

    expect(updateOrganizationSvcMock).toHaveBeenCalledWith("org-1", req.body);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Organization not found" });
  });

  test("updateOrganization returns 200 and org on success", async () => {
    const org = { id: "org-1", name: "Updated Org" };
    updateOrganizationSvcMock.mockResolvedValueOnce({ org });

    const req = { params: { id: "org-1" }, body: { name: "Updated Org" } };
    const res = mockRes();

    await updateOrganization(req, res);

    expect(updateOrganizationSvcMock).toHaveBeenCalledWith("org-1", req.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(org);
  });

  test("activateOrganization handles bad and notFound branches, then success", async () => {
    // bad
    setOrganizationStatusSvcMock.mockResolvedValueOnce({ bad: "Invalid status" });

    let req = { params: { id: "org-1" } };
    let res = mockRes();

    await activateOrganization(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Invalid status" });

    // notFound
    setOrganizationStatusSvcMock.mockResolvedValueOnce({ notFound: true });

    req = { params: { id: "org-2" } };
    res = mockRes();

    await activateOrganization(req, res);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Organization not found" });

    // success
    const org = { id: "org-3", status: "active" };
    setOrganizationStatusSvcMock.mockResolvedValueOnce({ org });

    req = { params: { id: "org-3" } };
    res = mockRes();

    await activateOrganization(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(org);
  });

  test("addMember handles bad, notFound, conflict, and success", async () => {
    const orgId = "org-1";
    const body = { userId: "user-123", role: "member" };

    // bad
    addMemberSvcMock.mockResolvedValueOnce({ bad: "Missing userId" });
    let req = { params: { id: orgId }, body };
    let res = mockRes();

    await addMember(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Missing userId" });

    // notFound
    addMemberSvcMock.mockResolvedValueOnce({ notFound: true });
    req = { params: { id: orgId }, body };
    res = mockRes();

    await addMember(req, res);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Organization not found" });

    // conflict
    addMemberSvcMock.mockResolvedValueOnce({ conflict: true });
    req = { params: { id: orgId }, body };
    res = mockRes();

    await addMember(req, res);
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ message: "Member already exists" });

    // success
    const members = [{ userId: "user-123", role: "member" }];
    addMemberSvcMock.mockResolvedValueOnce({ members });
    req = { params: { id: orgId }, body };
    res = mockRes();

    await addMember(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(members);
  });

  test("removeMember returns 204 on success", async () => {
    removeMemberSvcMock.mockResolvedValueOnce({}); // no flags → success

    const req = { params: { id: "org-1", userId: "user-1" } };
    const res = mockRes();

    await removeMember(req, res);

    expect(removeMemberSvcMock).toHaveBeenCalledWith("org-1", "user-1");
    expect(res.statusCode).toBe(204);
    // body will be undefined or null depending on send()
  });
});
