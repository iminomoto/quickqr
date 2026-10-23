import { defineConfig, devices } from "@playwright/test";

// E2E regression suite for behavior that unit tests can't reach (jsdom-free
// node env): splash dismissal, inert gating, ARIA semantics, and the
// scannability warning bar. See e2e/app.spec.ts.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3200",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // CI runs `npm run build` as its own step, so only start the server there;
    // locally, build first so the newest code is what's tested.
    command: process.env.CI
      ? "npm run start -- -p 3200"
      : "npm run build && npm run start -- -p 3200",
    url: "http://127.0.0.1:3200",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
