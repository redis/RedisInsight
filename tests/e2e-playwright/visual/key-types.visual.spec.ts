import { test, expect } from '@playwright/test';
import { BrowserPage } from 'e2eSrc/pages';
import { newApi, maskDynamic, captureFullPage } from './fixtures';

/**
 * Scene: key-details value renderers for every Redis type. Seeds one key per
 * type (flat names, fixed data) so the details panels are deterministic.
 */

const REDIS_HOST = process.env.SPIKE_REDIS_HOST2 || '127.0.0.1';
const REDIS_PORT = Number(process.env.SPIKE_REDIS_PORT2 || 8100);

const api = newApi();
let databaseId: string;

// Fixed stream entry id so the decoded timestamp doesn't drift between runs.
const STREAM_ID = '1700000000000-0';

const KEYS = ['vsHash', 'vsList', 'vsSet', 'vsZset', 'vsJson', 'vsStream'] as const;

test.beforeAll(async () => {
  await api.acceptEula();
  const db = await api.createDatabase({
    name: 'visual-key-types-db',
    host: REDIS_HOST,
    port: REDIS_PORT,
  });
  databaseId = db.id;
  await api.deleteKeysByPattern(databaseId, 'vs*').catch(() => {});
  await api.createHashKey(databaseId, 'vsHash', [
    { field: 'field1', value: 'value1' },
    { field: 'field2', value: 'value2' },
  ]);
  await api.createListKey(databaseId, 'vsList', ['one', 'two', 'three']);
  await api.createSetKey(databaseId, 'vsSet', ['alpha', 'beta', 'gamma']);
  await api.createZSetKey(databaseId, 'vsZset', [
    { member: 'first', score: '1' },
    { member: 'second', score: '2' },
  ]);
  await api.createJsonKey(databaseId, 'vsJson', '{"name":"redis","nums":[1,2,3]}');
  await api.createStreamKey(databaseId, 'vsStream', [{ field: 'sensor', value: '42' }], STREAM_ID);
});

test.afterAll(async () => {
  if (databaseId) {
    await api.deleteKeysByPattern(databaseId, 'vs*').catch(() => {});
    await api.deleteDatabase(databaseId).catch(() => {});
  }
  await api.dispose();
});

for (const key of KEYS) {
  test(`key details — ${key}`, async ({ page }) => {
    await page.goto('/');
    const browserPage = new BrowserPage(page);
    await browserPage.goto(databaseId);

    await page.getByText(key, { exact: true }).click();
    await expect(page.getByTestId('key-details-header')).toBeVisible();

    await captureFullPage(page, `key-details-${key}.png`, {
      mask: maskDynamic(page),
    });
  });
}
