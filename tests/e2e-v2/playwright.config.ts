import { defineConfig, devices } from '@playwright/test';
import { appConfig, isElectron } from './config';

export default defineConfig({
  testDir: './tests',
  // Parallel execution within files, but limit workers to reduce test interference
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retry failed tests to handle transient failures
  retries: process.env.CI ? 2 : 1,
  // Limit workers to reduce parallel test interference with shared database state
  // CI uses 1 worker for stability, local uses 2 for speed while reducing flakiness
  // Electron tests should always use 1 worker (single app instance)
  workers: isElectron ? 1 : process.env.CI ? 1 : 2,
  reporter: [['html'], ['list'], ['json', { outputFile: 'test-results/results.json' }]],

  // Global setup and teardown
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',

  use: {
    // baseURL is only used for browser tests, not Electron
    baseURL: isElectron ? undefined : appConfig.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 },
  },
  projects: isElectron
    ? [
        {
          name: 'electron',
          // Electron tests don't use browser devices
        },
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ],
  timeout: isElectron ? 120000 : 60000, // Electron needs more time for app startup
  expect: {
    timeout: 10000,
  },
});
