import { test, expect } from '@playwright/test';
import { BrowserPage, AnalyticsPage } from 'e2eSrc/pages';
import { newApi, maskDynamic, captureFullPage } from './fixtures';

/**
 * Scene: Analytics → Database Analysis, initial (no-reports) state. The empty
 * state is deterministic; populated reports carry charts we don't screenshot.
 */

const REDIS_HOST = process.env.SPIKE_REDIS_HOST2 || '127.0.0.1';
const REDIS_PORT = Number(process.env.SPIKE_REDIS_PORT2 || 8100);

const api = newApi();
let databaseId: string;

test.beforeAll(async () => {
  await api.acceptEula();
  const db = await api.createDatabase({
    name: 'visual-analytics-db',
    host: REDIS_HOST,
    port: REDIS_PORT,
  });
  databaseId = db.id;
});

test.afterAll(async () => {
  if (databaseId) await api.deleteDatabase(databaseId).catch(() => {});
  await api.dispose();
});

test('analytics — database analysis (empty)', async ({ page }) => {
  await page.goto('/');
  const browserPage = new BrowserPage(page);
  await browserPage.goto(databaseId);

  const analytics = new AnalyticsPage(page);
  await analytics.gotoDatabaseAnalysis(databaseId);
  await expect(page.getByTestId('empty-reports-wrapper')).toBeVisible();

  await captureFullPage(page, 'analytics-db-analysis-empty.png', {
    mask: maskDynamic(page),
  });
});
