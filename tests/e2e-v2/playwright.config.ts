import { defineConfig, devices } from '@playwright/test';
import { appConfig } from './config';

export default defineConfig({
  testDir: './tests',
  // Parallel execution within files, but limit workers to reduce test interference
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retry failed tests to handle transient failures
  retries: process.env.CI ? 2 : 1,
  // Limit workers to reduce parallel test interference with shared database state
  // CI uses 1 worker for stability, local uses 2 for speed while reducing flakiness
  workers: process.env.CI ? 1 : 2,
  reporter: [['html'], ['list'], ['json', { outputFile: 'test-results/results.json' }]],

  // Global setup and teardown
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',

  use: {
    baseURL: appConfig.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
});
