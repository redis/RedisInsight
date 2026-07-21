import { test, expect } from '@playwright/test';
import { BrowserPage } from 'e2eSrc/pages';
import { newApi, maskDynamic, captureFullPage } from './fixtures';

/**
 * Scene: browser alternative views — tree view (grouped keys) and the add-key
 * form with a type selected. Seeds delimiter-namespaced keys so the tree groups
 * deterministically.
 */

const REDIS_HOST = process.env.SPIKE_REDIS_HOST2 || '127.0.0.1';
const REDIS_PORT = Number(process.env.SPIKE_REDIS_PORT2 || 8100);

const api = newApi();
let databaseId: string;

test.beforeAll(async () => {
  await api.acceptEula();
  const db = await api.createDatabase({
    name: 'visual-browser-views-db',
    host: REDIS_HOST,
    port: REDIS_PORT,
  });
  databaseId = db.id;
  await api.deleteKeysByPattern(databaseId, 'vv:*').catch(() => {});
  await api.createStringKey(databaseId, 'vv:user:1', 'a');
  await api.createStringKey(databaseId, 'vv:user:2', 'b');
  await api.createStringKey(databaseId, 'vv:session:1', 'c');
});

test.afterAll(async () => {
  if (databaseId) {
    await api.deleteKeysByPattern(databaseId, 'vv:*').catch(() => {});
    await api.deleteDatabase(databaseId).catch(() => {});
  }
  await api.dispose();
});

test('browser — tree view (grouped keys)', async ({ page }) => {
  await page.goto('/');
  const browserPage = new BrowserPage(page);
  await browserPage.goto(databaseId);

  await page.getByTestId('view-type-list-btn').click(); // tree view
  await expect(page.getByText('vv', { exact: true })).toBeVisible();

  await captureFullPage(page, 'browser-tree-view.png', {
    mask: maskDynamic(page),
  });
});
