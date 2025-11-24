// src/backend/tests/unit/eventValidation.test.js
// 🔁 Adjust path as needed
import { validateEventPayload } from "../../utils/eventValidation.js";

describe("validateEventPayload - unit tests", () => {
  test("returns no errors for a valid payload", () => {
    const payload = {
      title: "Hackathon",
      date: "2025-12-10T18:00:00.000Z",
      capacity: 100,
    };

    const errors = validateEventPayload(payload);
    expect(errors).toEqual([]);
  });

  test("returns error when title is missing or empty", () => {
    const payload = {
      title: "",
      date: "2025-12-10T18:00:00.000Z",
      capacity: 50,
    };

    const errors = validateEventPayload(payload);
    expect(errors).toContain("Title is required");
  });

  test("returns error when date is missing", () => {
    const payload = {
      title: "No Date Event",
      capacity: 50,
    };

    const errors = validateEventPayload(payload);
    expect(errors).toContain("Date is required");
  });

  test("returns error when capacity is zero or negative", () => {
    const payload = {
      title: "Invalid Capacity",
      date: "2025-12-10T18:00:00.000Z",
      capacity: 0,
    };

    const errors = validateEventPayload(payload);
    expect(errors).toContain("Capacity must be greater than 0");
  });
});
