import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",          // where your Playwright tests live
  timeout: 30 * 1000,              // 30 seconds per test
  use: {
    baseURL: "http://localhost:3000", // your dev server
    headless: true,                   // run without opening a browser window
    trace: "on-first-retry"           // collect traces for failing tests
  },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }]
  ]
});

