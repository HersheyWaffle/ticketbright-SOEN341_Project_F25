// src/backend/tests/password.test.js

const { isStrongPassword } = require("../utils/password");

describe("isStrongPassword", () => {
  it("rejects non-string values", () => {
    expect(isStrongPassword(null)).toBe(false);
    expect(isStrongPassword(123456)).toBe(false);
  });

  it("rejects short passwords", () => {
    expect(isStrongPassword("123")).toBe(false);
    expect(isStrongPassword("abc")).toBe(false);
  });

  it("accepts passwords with length >= 6", () => {
    expect(isStrongPassword("123456")).toBe(true);
    expect(isStrongPassword("abcdef")).toBe(true);
  });
});
