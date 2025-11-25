
const { isValidUsername } = require("../../utils/validation"); // relative path

describe("isValidUsername", () => {
  it("returns false for null", () => {
    expect(isValidUsername(null)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidUsername("")).toBe(false);
  });

  it("returns false for whitespace-only string", () => {
    expect(isValidUsername("   ")).toBe(false);
  });

  it("returns true for a normal username", () => {
    expect(isValidUsername("shayan")).toBe(true);
  });
});
