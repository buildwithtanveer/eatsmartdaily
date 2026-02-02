import "dotenv/config";
import { defineConfig } from "@playwright/test";

const hasDatabase = !!process.env.DATABASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
  },
  webServer: hasDatabase
    ? {
        command: "npx next dev -p 3000",
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
});
