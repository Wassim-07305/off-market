import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  fullyParallel: true,
  retries: 0,
  workers: 2,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
  },
  projects: [{
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  }],
  // No webServer - use existing dev server
});
