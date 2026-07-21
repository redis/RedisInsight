import { test, expect } from '@playwright/test';
import { newApi, captureFullPage } from './fixtures';

/**
 * Scene: home / databases — the databases list and the Add Database dialog.
 */

const REDIS_HOST = process.env.SPIKE_REDIS_HOST2 || '127.0.0.1';
const REDIS_PORT = Number(process.env.SPIKE_REDIS_PORT2 || 8100);

const api = newApi();
let databaseId: string;

test.beforeAll(async () => {
  await api.acceptEula();
  const db = await api.createDatabase({
    name: 'visual-home-db',
    host: REDIS_HOST,
    port: REDIS_PORT,
  });
  databaseId = db.id;
});

test.afterAll(async () => {
  if (databaseId) await api.deleteDatabase(databaseId).catch(() => {});
  await api.dispose();
});

test('databases list', async ({ page }) => {
  await page.goto('/');
  // Our seeded DB row is a stable anchor that the list has rendered.
  await expect(page.getByTestId(`instance-name-${databaseId}`)).toBeVisible();

  // "Last connection" is relative ("less than a minute ago") and drifts between
  // the reference and compare runs — mask those cells.
  await captureFullPage(page, 'databases-list.png', {
    mask: [page.getByText(/ago$/)],
  });
});

test('add database dialog', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('add-redis-database-short').click();

  const dialog = page.getByRole('dialog', {
    name: /add database|connection settings/i,
  });
  await expect(dialog).toBeVisible();

  await expect(dialog).toHaveScreenshot('add-database-dialog.png');
});
