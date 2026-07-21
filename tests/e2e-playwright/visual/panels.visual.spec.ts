import { test, expect } from '@playwright/test';
import { BrowserPage, InsightsPanel, BottomPanel } from 'e2eSrc/pages';
import { newApi, maskDynamic, captureFullPage } from './fixtures';

/**
 * Scene: side panels — Insights (Tutorials/enablement area + Tips) and the
 * Profiler bottom panel. Covers the enablement-area, recommendations-panel and
 * monitor styling.
 */

const REDIS_HOST = process.env.SPIKE_REDIS_HOST2 || '127.0.0.1';
const REDIS_PORT = Number(process.env.SPIKE_REDIS_PORT2 || 8100);

const api = newApi();
let databaseId: string;

test.beforeAll(async () => {
  await api.acceptEula();
  const db = await api.createDatabase({
    name: 'visual-panels-db',
    host: REDIS_HOST,
    port: REDIS_PORT,
  });
  databaseId = db.id;
});

test.afterAll(async () => {
  if (databaseId) await api.deleteDatabase(databaseId).catch(() => {});
  await api.dispose();
});

test('insights — tutorials (enablement area)', async ({ page }) => {
  await page.goto('/');
  await new BrowserPage(page).goto(databaseId);

  const insights = new InsightsPanel(page);
  await insights.open();
  await insights.switchToTutorialsTab();
  await expect(page.getByTestId('enablementArea')).toBeVisible();

  await expect(page.getByTestId('side-panels-insights')).toHaveScreenshot('insights-tutorials.png');
});

test('insights — tips', async ({ page }) => {
  await page.goto('/');
  await new BrowserPage(page).goto(databaseId);

  const insights = new InsightsPanel(page);
  await insights.open();
  await insights.switchToTipsTab();
  await expect(page.getByTestId('side-panels-insights')).toBeVisible();

  await expect(page.getByTestId('side-panels-insights')).toHaveScreenshot('insights-tips.png');
});

test('profiler — panel open', async ({ page }) => {
  await page.goto('/');
  await new BrowserPage(page).goto(databaseId);

  await new BottomPanel(page).profilerButton.click();
  await expect(page.getByRole('button', { name: 'start monitor' })).toBeVisible();

  await captureFullPage(page, 'profiler-open.png', { mask: maskDynamic(page) });
});
