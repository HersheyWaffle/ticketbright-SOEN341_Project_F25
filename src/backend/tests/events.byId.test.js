// src/backend/tests/events.byId.test.js

const { isValidEventPayload } = require("../utils/eventValidation");

describe("isValidEventPayload - invalid payloads", () => {
  it("returns false for non-object payloads", () => {
    expect(isValidEventPayload(null)).toBe(false);
    expect(isValidEventPayload("not-an-object")).toBe(false);
    expect(isValidEventPayload(123)).toBe(false);
  });

  it("returns false when title is empty", () => {
    const payload = {
      title: "   ",
      date: "2025-12-01T18:00:00.000Z",
    };

    expect(isValidEventPayload(payload)).toBe(false);
  });

  it("returns false when date is empty", () => {
    const payload = {
      title: "Valid Title",
      date: "   ",
    };

    expect(isValidEventPayload(payload)).toBe(false);
  });
});
