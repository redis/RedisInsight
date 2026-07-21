import { test, expect } from '@playwright/test';
import { BrowserPage } from 'e2eSrc/pages';
import { newApi } from './fixtures';

/**
 * Scene: toasts (success + error). Adding a new key shows a green success
 * toast; adding a name that already exists shows a red conflict toast. Scoped
 * to the toast element with animations:'allow' + the progress bar masked (see
 * the per-call notes below); toasts live 6s — plenty to capture.
 */

const REDIS_HOST = process.env.SPIKE_REDIS_HOST2 || '127.0.0.1';
const REDIS_PORT = Number(process.env.SPIKE_REDIS_PORT2 || 8100);

const api = newApi();
let databaseId: string;

// A pre-existing key so the "add duplicate" flow reliably conflicts.
const DUP_KEY = 'toastDupKey';

test.beforeAll(async () => {
  await api.acceptEula();
  const db = await api.createDatabase({
    name: 'visual-toasts-db',
    host: REDIS_HOST,
    port: REDIS_PORT,
  });
  databaseId = db.id;
  await api.deleteKeysByPattern(databaseId, 'toast*').catch(() => {});
  await api.createHashKey(databaseId, DUP_KEY, [{ field: 'f', value: 'v' }]);
});

test.afterAll(async () => {
  if (databaseId) {
    await api.deleteKeysByPattern(databaseId, 'toast*').catch(() => {});
    await api.deleteDatabase(databaseId).catch(() => {});
  }
  await api.dispose();
});

const addHashKey = async (page: import('@playwright/test').Page, name: string) => {
  await page.getByText('Add key', { exact: true }).click();
  await page.getByTestId('key').fill(name);
  await page.getByTestId('field-name').fill('f1');
  await page.getByTestId('field-value').fill('v1');
  await page.getByTestId('add-key-hash-btn').click();
};

test('toast — success (key added)', async ({ page }) => {
  await page.goto('/');
  await new BrowserPage(page).goto(databaseId);

  await addHashKey(page, 'toastNewKey');
  const toast = page.locator('.Toastify__toast');
  await expect(toast).toBeVisible();

  // animations:'allow' — the config default ('disabled') fast-forwards the 6s
  // progress animation which auto-dismisses the toast; mask the countdown bar.
  await expect(toast).toHaveScreenshot('toast-success.png', {
    animations: 'allow',
    mask: [page.locator('.Toastify__progress-bar')],
  });
});

test('toast — error (duplicate key)', async ({ page }) => {
  await page.goto('/');
  await new BrowserPage(page).goto(databaseId);

  await addHashKey(page, DUP_KEY);
  const toast = page.locator('.Toastify__toast');
  await expect(toast).toBeVisible();

  await expect(toast).toHaveScreenshot('toast-error.png', {
    animations: 'allow',
    mask: [page.locator('.Toastify__progress-bar')],
  });
});
