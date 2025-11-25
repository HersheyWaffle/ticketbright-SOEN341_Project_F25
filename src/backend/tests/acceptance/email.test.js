const { isValidEmail } = require("../../utils/email");

describe("isValidEmail", () => {
  it("returns false for null", () => {
    expect(isValidEmail(null)).toBe(false);
  });

  it("returns false for missing @ symbol", () => {
    expect(isValidEmail("shayan.com")).toBe(false);
  });

  it("returns false for missing dot", () => {
    expect(isValidEmail("shayan@com")).toBe(false);
  });

  it("returns true for a basic valid email", () => {
    expect(isValidEmail("shayan@example.com")).toBe(true);
  });
});
