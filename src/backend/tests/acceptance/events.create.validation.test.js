// src/backend/tests/events.create.validation.test.js

const { isValidEventPayload } = require("../../utils/eventValidation");

describe("isValidEventPayload - validation", () => {
  it("returns false when title is missing", () => {
    const payload = {
      // title intentionally missing
      date: "2025-12-01T18:00:00.000Z",
      description: "Test event",
    };

    expect(isValidEventPayload(payload)).toBe(false);
  });
});
