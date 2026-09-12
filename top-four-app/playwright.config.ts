import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke tests: every screen, signed in, asserting it drew its own content.
 *
 * A 200 is not the bar. Three markets once rendered a title, a price and the
 * word OPEN with no controls beneath them, on the platform the design calls
 * primary, and everything still compiled and still answered 200.
 *
 * Credentials come from the environment and are never committed. Without them
 * the signed-in specs skip with a message rather than failing, so the suite
 * stays runnable by anyone.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // The dev server compiles each route on first hit, so five workers racing it
  // times out on navigation rather than on anything the page got wrong.
  workers: 2,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.TF_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    navigationTimeout: 45_000,
    actionTimeout: 15_000,
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/session.json' },
      dependencies: ['setup'],
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], storageState: '.auth/session.json' },
      dependencies: ['setup'],
    },
  ],
  // Assumes `npm run dev` is already up; it shares .next with `next build`, so
  // the suite must never start a build against a running dev server.
  webServer: process.env.TF_BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
