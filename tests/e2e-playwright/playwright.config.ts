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
  // Bail on CI after enough failures to catch a systemic breakage without
  // running the whole suite.
  maxFailures: process.env.CI ? 20 : undefined,
  reporter: [['html'], ['list'], ['json', { outputFile: 'test-results/results.json' }]],

  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 },
  },

  // Projects allow different test configurations (parallelism, setup, etc.)
  // Run specific project: npx playwright test --project=chromium-parallel
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
    // Folder structure determines parallelism:
    //   tests/parallel — safe to run with multiple workers
    //   tests/serial   — must run sequentially (shared DB state, dangerous
    //                    commands, vector-index ops, etc.)
    {
      name: 'chromium-parallel',
      testDir: './tests/parallel',
      dependencies: ['browser-setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: appConfig.clientUrl,
        apiUrl: appConfig.apiUrl,
      },
      workers: 4,
      timeout: 60000,
    },
    {
      name: 'chromium-serial',
      testDir: './tests/serial',
      // Depend on 'chromium-parallel' to force sequential execution: serial
      // tests share Redis state (FLUSHDB, broad index cleanups) with parallel
      // tests, so the two projects must not run concurrently.
      dependencies: ['browser-setup', 'chromium-parallel'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: appConfig.clientUrl,
        apiUrl: appConfig.apiUrl,
      },
      fullyParallel: false,
      workers: 1,
      timeout: 60000,
    },

    // ============================================
    // Electron Projects
    // ============================================
    {
      name: 'electron-parallel',
      testDir: './tests/parallel',
      dependencies: ['electron-setup'],
      use: {
        electronExecutablePath: appConfig.electronExecutablePath,
        apiUrl: appConfig.electronApiUrl,
      },
      // Single electron app instance — keep workers=1 until multi-instance is supported.
      fullyParallel: false,
      workers: 1,
      timeout: 60000,
    },
    {
      name: 'electron-serial',
      testDir: './tests/serial',
      // Depend on 'electron-parallel' to force sequential execution: each worker
      // spawns its own Electron app which binds the API on a fixed port, so the
      // two projects must not run concurrently.
      dependencies: ['electron-setup', 'electron-parallel'],
      use: {
        electronExecutablePath: appConfig.electronExecutablePath,
        apiUrl: appConfig.electronApiUrl,
      },
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
