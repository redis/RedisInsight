import { expect, Locator, Page } from '@playwright/test';
import { ApiHelper } from 'e2eSrc/helpers';

/**
 * Shared helpers for the local visual-regression tool.
 *
 * This suite is NOT part of the e2e test projects and never runs in CI. It
 * captures full-app screenshots so a feature branch can be compared against a
 * `main` reference. Baselines live under `__screenshots__/` and are gitignored
 * — regenerate them from `main` (see README).
 */

export const API_URL = process.env.RI_API_URL || 'http://localhost:5540';

/** Fresh ApiHelper against the running app's API. */
export const newApi = (): ApiHelper => new ApiHelper({ apiUrl: API_URL });

/** Accept EULA via API so the consent modal never blocks navigation. */
export const acceptEula = async (): Promise<void> => {
  const api = newApi();
  try {
    await api.acceptEula();
  } finally {
    await api.dispose();
  }
};

/**
 * Regions that auto-refresh on every database screen (keys/memory stats, the
 * "Calculating…" spinner, the scan summary). Always mask these — they flicker
 * between captures and would otherwise produce false diffs.
 */
export const maskDynamic = (page: Page): Locator[] => [
  page.getByTestId('instance-header'),
  page.getByTestId('keys-summary'),
  // "Last refresh: now / N min ago" — relative time that drifts if the
  // reference and compare runs are minutes apart. One locator matches every
  // AutoRefresh instance (key list, key details, overview, …).
  page.locator('[data-testid*="auto-refresh-container"]'),
];

const MAX_CAPTURE_HEIGHT = 5000;

/**
 * Full-page screenshot that actually captures the whole page.
 *
 * RedisInsight is a `100vh` shell whose panels scroll *internally*, so
 * `document.scrollHeight` ≈ the viewport and Playwright's `fullPage: true`
 * clips anything overflowing an inner `overflow:auto` container. To work around
 * that we grow the viewport to the tallest inner scroll container's content
 * height first, so everything lays out on-screen, then capture.
 */
export const captureFullPage = async (page: Page, name: string, options: { mask?: Locator[] } = {}): Promise<void> => {
  const needed = await page.evaluate(() => {
    // Ignore scrollers whose height is virtual/internal, not real page content:
    // Monaco's canvas layers and windowed lists report enormous scrollHeights.
    const SKIP = '.monaco-editor,[class*="virtual"],[class*="ReactVirtualized"],[class*="react-window"]';
    let max = document.documentElement.scrollHeight;
    document.querySelectorAll('*').forEach((el) => {
      if (el.scrollHeight <= el.clientHeight + 8) return;
      if (el.scrollHeight > 6000) return; // spurious/virtualized
      if (el.closest(SKIP)) return;
      const bottom = el.getBoundingClientRect().top + el.scrollHeight;
      max = Math.max(max, Math.ceil(bottom));
    });
    return max;
  });
  const width = page.viewportSize()?.width ?? 1920;
  // Quantise to 100px buckets so sub-pixel layout jitter between the reference
  // and compare runs can't change the image size (which would fail the diff).
  const raw = Math.max(needed + 40, 1080);
  const height = Math.min(Math.ceil(raw / 100) * 100, MAX_CAPTURE_HEIGHT);
  await page.setViewportSize({ width, height });
  await expect(page).toHaveScreenshot(name, { fullPage: true, ...options });
};
