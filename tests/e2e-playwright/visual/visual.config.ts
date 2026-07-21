import { defineConfig, devices } from '@playwright/test';

/**
 * Local visual-regression tool — NOT part of the e2e projects, never runs in CI.
 *
 * Deliberately independent of the main playwright.config.ts (no setup/teardown
 * projects). Points at a locally running web app and captures full-app
 * screenshots via toHaveScreenshot. Baselines live under `__screenshots__/`
 * and are gitignored — regenerate them from `main`.
 *
 * Workflow (see README):
 *   1. Serve the app on `main`   → `yarn visual:ref`    (writes the reference)
 *   2. Serve the app on <branch> → `yarn visual:check`  (compares → HTML report)
 */
const CLIENT_URL = process.env.RI_CLIENT_URL || 'http://localhost:8080';

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.visual\.spec\.ts/,
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  // Bound each scene so a transient app stall fails fast instead of retrying
  // toHaveScreenshot for many minutes.
  timeout: 60_000,
  reporter: [['html', { outputFolder: 'playwright-report-visual', open: 'never' }], ['list']],
  use: {
    baseURL: CLIENT_URL,
    viewport: { width: 1920, height: 1080 },
  },
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      // Full-page captures reflow text; sub-pixel/anti-aliasing jitter between
      // the reference and compare runs is unavoidable. Allow up to 1% differing
      // pixels to absorb that while still catching any real (>1%) change.
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
    },
  },
  projects: [
    {
      name: 'chromium-visual',
      // NB: spread the device first, then override its 1280x720 viewport — the
      // device preset otherwise clobbers the top-level use.viewport.
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
  ],
});
