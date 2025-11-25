// src/backend/tests/services/admin.service.test.mjs

import { jest } from "@jest/globals";

// 1) Mock the DB layer before importing admin.service.js
jest.unstable_mockModule("../../config/db.js", () => {
  return {
    default: {
      // simple query mock; you can extend later if needed
      query: jest.fn().mockResolvedValue({ rows: [] }),
    },
  };
});

// 2) Import the mocked db and the real admin service module
const adminServiceModule = await import("../../services/admin.service.js");

describe("admin.service module", () => {
  test("loads successfully when DB is mocked", () => {
    // Very simple but functional check: module exists and was imported
    expect(adminServiceModule).toBeDefined();
    // Optionally, we can assert that it exports at least one thing
    expect(Object.keys(adminServiceModule).length).toBeGreaterThan(0);
  });
});
