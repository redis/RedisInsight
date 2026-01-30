import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';
import { appConfig } from './config';

/**
 * Custom test options for our projects
 */
interface CustomTestOptions {
  electronExecutablePath: string | undefined;
  apiUrl: string;
}

const config: PlaywrightTestConfig<CustomTestOptions> = {
  forbidOnly: !!process.env.CI,
  // Retry failed tests to handle transient failures
  retries: process.env.CI ? 2 : 1,
  reporter: [['html'], ['list'], ['json', { outputFile: 'test-results/results.json' }]],

  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 },
  },

  // Projects allow different test configurations (parallelism, setup, etc.)
  // Run specific project: npx playwright test --project=chromium
  // Run all projects: npx playwright test
  //
  // Setup projects run before their dependent test projects.
  // Teardown projects run after all tests complete.
  projects: [
    // ============================================
    // Setup Projects (run first)
    // ============================================
    {
      name: 'browser-setup',
      testMatch: /setup\/browser\.setup\.ts/,
      teardown: 'browser-teardown',
    },
    {
      name: 'electron-setup',
      testMatch: /setup\/electron\.setup\.ts/,
      teardown: 'electron-teardown',
    },

    // ============================================
    // Teardown Projects (run last)
    // ============================================
    {
      name: 'browser-teardown',
      testMatch: /setup\/browser\.teardown\.ts/,
    },
    {
      name: 'electron-teardown',
      testMatch: /setup\/electron\.teardown\.ts/,
    },

    // ============================================
    // Browser Projects (Chromium)
    // ============================================
    {
      name: 'chromium',
      testDir: './tests/main',
      dependencies: ['browser-setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: appConfig.clientUrl,
        apiUrl: appConfig.apiUrl,
      },
      workers: 4,
      timeout: 60000,
    },

    // ============================================
    // Electron Projects
    // ============================================
    {
      name: 'electron',
      testDir: './tests/main',
      dependencies: ['electron-setup'],
      use: {
        electronExecutablePath: appConfig.electronExecutablePath,
        apiUrl: appConfig.electronApiUrl,
      },
      // Electron tests run with single worker (single app instance)
      fullyParallel: false,
      workers: 1,
      timeout: 60000,
    },
    // Example: auto-update tests for Electron
    // {
    //   name: 'electron-auto-update',
    //   testDir: './tests/auto-update',
    //   dependencies: ['electron-setup'],
    //   use: {
    //     electronExecutablePath,
    //     apiUrl: appConfig.electronApiUrl,
    //   },
    //   fullyParallel: false,
    //   workers: 1,
    //   timeout: 180000,
    // },
  ],

  expect: {
    timeout: 10000,
  },
};

export default defineConfig(config);
