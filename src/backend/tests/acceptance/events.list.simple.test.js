// src/backend/tests/events.list.simple.test.js

const { isValidEventPayload } = require("../../utils/eventValidation");

describe("event payload list", () => {
  it("all events in a list can be valid", () => {
    const events = [
      { title: "Event 1", date: "2025-12-01T18:00:00.000Z" },
      { title: "Event 2", date: "2025-12-02T18:00:00.000Z" },
    ];

    events.forEach((e) => {
      expect(isValidEventPayload(e)).toBe(true);
    });
  });
});
