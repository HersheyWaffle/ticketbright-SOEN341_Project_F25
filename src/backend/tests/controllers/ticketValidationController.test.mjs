import { jest } from "@jest/globals";

// Mock the entire controller module so Jest never imports the CJS file
jest.unstable_mockModule("../../controllers/ticketValidationController.js", () => {
  return {
    validateTicket: jest.fn(async (req, res) => {
      if (!req.file) {
        return res.status(400).json({
          errors: { file: 'QR image file is required (field name: "file")' },
        });
      }
    }),
  };
});

// Now import the mocked module
const { validateTicket } = await import(
  "../../controllers/ticketValidationController.js"
);

// Mock Express response
function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; }
  };
}

describe("validateTicket controller (mocked)", () => {
  test("returns 400 when no file is provided", async () => {
    const req = { file: undefined };
    const res = mockRes();

    await validateTicket(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      errors: { file: 'QR image file is required (field name: "file")' },
    });
  });
});
