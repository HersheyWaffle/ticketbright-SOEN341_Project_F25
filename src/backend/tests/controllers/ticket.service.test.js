// src/backend/tests/unit/ticket.service.test.js
// 🔁 Adjust paths to match your project
import {
  canIssueTicket,
  computeRemainingCapacity,
  hasStudentAlreadyTicket,
} from "../../services/ticket.service.js";

describe("ticket.service - unit tests", () => {
  test("canIssueTicket returns true when capacity not reached", () => {
    const event = { capacity: 3, ticketsSold: 2 };
    expect(canIssueTicket(event)).toBe(true);
  });

  test("canIssueTicket returns false when capacity reached", () => {
    const event = { capacity: 3, ticketsSold: 3 };
    expect(canIssueTicket(event)).toBe(false);
  });

  test("computeRemainingCapacity returns correct difference", () => {
    const event = { capacity: 100, ticketsSold: 40 };
    expect(computeRemainingCapacity(event)).toBe(60);
  });

  test("hasStudentAlreadyTicket returns true if student is in attendees list", () => {
    const event = {
      attendees: [
        { studentId: "40299147" },
        { studentId: "40280000" },
      ],
    };
    expect(hasStudentAlreadyTicket(event, "40299147")).toBe(true);
  });

  test("hasStudentAlreadyTicket returns false if student not in attendees list", () => {
    const event = {
      attendees: [{ studentId: "x" }],
    };
    expect(hasStudentAlreadyTicket(event, "y")).toBe(false);
  });

  test("hasStudentAlreadyTicket handles missing attendees array gracefully", () => {
    const event = {};
    expect(hasStudentAlreadyTicket(event, "any")).toBe(false);
  });
});
