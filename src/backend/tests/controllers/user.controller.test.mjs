// src/backend/tests/controllers/user.controller.test.mjs

import { jest } from "@jest/globals";

// --- Mock bcrypt ---
const hashMock = jest.fn();
const compareMock = jest.fn();

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: hashMock,
    compare: compareMock,
  },
}));

// --- Mock User model ---
const findOneMock = jest.fn();
const createMock = jest.fn();

jest.unstable_mockModule("../../models/user.js", () => ({
  default: {
    findOne: findOneMock,
    create: createMock,
  },
}));

// Import controller AFTER mocks are set up
const { signupUser, loginUser } = await import(
  "../../controllers/userController.js"
);

// Helper to mock Express res
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
  };
}

beforeEach(() => {
  hashMock.mockReset();
  compareMock.mockReset();
  findOneMock.mockReset();
  createMock.mockReset();
});

describe("signupUser", () => {
  test("returns 400 if user already exists", async () => {
    findOneMock.mockResolvedValueOnce({ id: 1, email: "test@example.com" });

    const req = {
      body: {
        username: "testuser",
        email: "test@example.com",
        password: "secret",
        role: "student",
      },
    };
    const res = mockRes();

    await signupUser(req, res);

    expect(findOneMock).toHaveBeenCalledWith({ where: { email: "test@example.com" } });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "User already exists" });
    expect(hashMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });

  test("creates approved student and returns 201", async () => {
    findOneMock.mockResolvedValueOnce(null);
    hashMock.mockResolvedValueOnce("hashed-secret");
    createMock.mockResolvedValueOnce({
      id: 123,
      username: "student1",
      email: "student@example.com",
      role: "student",
      approved: true,
    });

    const req = {
      body: {
        username: "student1",
        email: "student@example.com",
        password: "secret",
        role: "student",
      },
    };
    const res = mockRes();

    await signupUser(req, res);

    expect(findOneMock).toHaveBeenCalledWith({ where: { email: "student@example.com" } });
    expect(hashMock).toHaveBeenCalledWith("secret", 10);
    expect(createMock).toHaveBeenCalledWith({
      username: "student1",
      email: "student@example.com",
      password: "hashed-secret",
      role: "student",
      approved: true,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      success: true,
      message: "Account created successfully!",
      user: {
        id: 123,
        username: "student1",
        email: "student@example.com",
        role: "student",
        approved: true,
      },
    });
  });

  test("creates organizer with pending approval message", async () => {
    findOneMock.mockResolvedValueOnce(null);
    hashMock.mockResolvedValueOnce("hashed-secret");
    createMock.mockResolvedValueOnce({
      id: 456,
      username: "org1",
      email: "org@example.com",
      role: "organizer",
      approved: false,
    });

    const req = {
      body: {
        username: "org1",
        email: "org@example.com",
        password: "secret",
        role: "organizer",
      },
    };
    const res = mockRes();

    await signupUser(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      success: true,
      message: "Organizer signup pending admin approval.",
      user: {
        id: 456,
        username: "org1",
        email: "org@example.com",
        role: "organizer",
        approved: false,
      },
    });
  });
});

describe("loginUser", () => {
  test("returns 404 when user is not found", async () => {
    findOneMock.mockResolvedValueOnce(null);

    const req = {
      body: {
        email: "missing@example.com",
        password: "whatever",
      },
    };
    const res = mockRes();

    await loginUser(req, res);

    expect(findOneMock).toHaveBeenCalledWith({ where: { email: "missing@example.com" } });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "User not found" });
  });

  test("returns 401 when password is invalid", async () => {
    findOneMock.mockResolvedValueOnce({
      id: 1,
      email: "test@example.com",
      password: "stored-hash",
      approved: true,
      username: "user1",
      role: "student",
    });
    compareMock.mockResolvedValueOnce(false);

    const req = {
      body: {
        email: "test@example.com",
        password: "wrong-password",
      },
    };
    const res = mockRes();

    await loginUser(req, res);

    expect(compareMock).toHaveBeenCalledWith("wrong-password", "stored-hash");
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Invalid password" });
  });

  test("returns 403 when account is not approved", async () => {
    findOneMock.mockResolvedValueOnce({
      id: 1,
      email: "pending@example.com",
      password: "stored-hash",
      approved: false,
      username: "pendingUser",
      role: "organizer",
    });
    compareMock.mockResolvedValueOnce(true);

    const req = {
      body: {
        email: "pending@example.com",
        password: "secret",
      },
    };
    const res = mockRes();

    await loginUser(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Account pending admin approval" });
  });

  test("returns 200 and user data on successful login", async () => {
    findOneMock.mockResolvedValueOnce({
      id: 10,
      email: "ok@example.com",
      password: "stored-hash",
      approved: true,
      username: "okUser",
      role: "student",
    });
    compareMock.mockResolvedValueOnce(true);

    const req = {
      body: {
        email: "ok@example.com",
        password: "secret",
      },
    };
    const res = mockRes();

    await loginUser(req, res);

    expect(res.statusCode).toBe(null); // no explicit status() call → defaults to 200
    expect(res.body).toEqual({
      success: true,
      message: "Login successful",
      user: {
        id: 10,
        username: "okUser",
        role: "student",
      },
    });
  });
});
