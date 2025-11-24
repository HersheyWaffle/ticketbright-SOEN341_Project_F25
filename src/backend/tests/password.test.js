const { isStrongPassword } = require("../utils/password");

describe("isStrongPassword", () => {
  it("rejects non-string", () => {
    expect(isStrongPassword(null)).toBe(false);
  });

  it("rejects short passwords", () => {
    expect(isStrongPassword("123")).toBe(false);
  });

  it("accepts long passwords", () => {
    expect(isStrongPassword("abcdef")).toBe(true);
  });
});
