// src/backend/tests/events.create.success.test.js

const { isValidEventPayload } = require("../utils/eventValidation");

describe("isValidEventPayload - success case", () => {
  it("returns true for a minimal valid event", () => {
    const payload = {
      title: "Valid Event",
      date: "2025-12-01T18:00:00.000Z",
    };

    expect(isValidEventPayload(payload)).toBe(true);
  });
});
