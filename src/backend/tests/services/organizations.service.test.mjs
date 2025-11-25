// src/backend/tests/services/organizations.service.test.mjs

import { jest } from "@jest/globals";

// 1) Mock the DB layer before importing organizations.service.js
jest.unstable_mockModule("../../config/db.js", () => {
  return {
    default: {
      // simple mock; extend later if you test specific queries
      query: jest.fn().mockResolvedValue({ rows: [] }),
    },
  };
});

// 2) Import the mocked db and the real organizations service module
const organizationsServiceModule = await import(
  "../../services/organizations.service.js"
);

describe("organizations.service module", () => {
  test("loads successfully when DB is mocked", () => {
    // module should exist
    expect(organizationsServiceModule).toBeDefined();

    // and have at least one export (a function, constant, etc.)
    expect(Object.keys(organizationsServiceModule).length).toBeGreaterThan(0);
  });
});
