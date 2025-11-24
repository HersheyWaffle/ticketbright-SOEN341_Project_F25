// jest.config.js
export default {
  testEnvironment: "node",
  transform: {},

  // Tell Jest not to touch Playwright tests
  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests/e2e/",
    "/tests/acceptance/tickets.purchase.accept.test.js" 
  ]
};

