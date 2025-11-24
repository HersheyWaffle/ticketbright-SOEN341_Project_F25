// src/backend/tests/events.create.missingDate.test.js

const { isValidEventPayload } = require("../utils/eventValidation");

describe("isValidEventPayload - missing date", () => {
  it("returns false when date is missing", () => {
    const payload = {
      title: "Event without date",
      description: "Test event",
      // date missing on purpose
    };

    expect(isValidEventPayload(payload)).toBe(false);
  });
});
