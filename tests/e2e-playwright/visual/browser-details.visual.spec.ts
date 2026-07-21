import { test, expect } from '@playwright/test';
import { BrowserPage } from 'e2eSrc/pages';
import { newApi, maskDynamic, captureFullPage } from './fixtures';

/**
 * Scene: Browser — key list, add-key dialog, and key details.
 * Seeds a clean DB (empty oss-standalone :8100) with a stable mixed-type key
 * set for determinism.
 */

const REDIS_HOST = process.env.SPIKE_REDIS_HOST2 || '127.0.0.1';
const REDIS_PORT = Number(process.env.SPIKE_REDIS_PORT2 || 8100);

// No ':' delimiter so keys render as flat leaves (not grouped into a tree folder).
const STR_KEY = 'spikeString';

const api = newApi();
let databaseId: string;

test.beforeAll(async () => {
  await api.acceptEula();
  const db = await api.createDatabase({
    name: 'visual-browser-details-db',
    host: REDIS_HOST,
    port: REDIS_PORT,
  });
  databaseId = db.id;
  await api.deleteKeysByPattern(databaseId, 'spike*').catch(() => {});
  await api.createStringKey(databaseId, STR_KEY, 'hello world');
  await api.createHashKey(databaseId, 'spikeHash', [{ field: 'f1', value: 'v1' }]);
  await api.createListKey(databaseId, 'spikeList', ['a', 'b', 'c']);
  await api.createSetKey(databaseId, 'spikeSet', ['m1', 'm2']);
});

test.afterAll(async () => {
  if (databaseId) {
    await api.deleteKeysByPattern(databaseId, 'spike*').catch(() => {});
    await api.deleteDatabase(databaseId).catch(() => {});
  }
  await api.dispose();
});

test('browser — key list (search, key rows, type badges)', async ({ page }) => {
  await page.goto('/');
  const browserPage = new BrowserPage(page);
  await browserPage.goto(databaseId);

  await expect(page.getByText(STR_KEY)).toBeVisible();
  await captureFullPage(page, 'browser-key-list.png', {
    mask: maskDynamic(page),
  });
});

test('browser — add key dialog', async ({ page }) => {
  await page.goto('/');
  const browserPage = new BrowserPage(page);
  await browserPage.goto(databaseId);

  await page.getByText('Add key', { exact: true }).click();
  await expect(page.getByText('New Key')).toBeVisible();

  await captureFullPage(page, 'browser-add-key.png', {
    mask: maskDynamic(page),
  });
});

test('browser — key details header + actions', async ({ page }) => {
  await page.goto('/');
  const browserPage = new BrowserPage(page);
  await browserPage.goto(databaseId);

  await page.getByText(STR_KEY).click();
  await expect(page.getByTestId('key-details-header')).toBeVisible();

  await captureFullPage(page, 'browser-key-details.png', {
    mask: maskDynamic(page),
  });
});
