import { test, expect } from '@playwright/test';
import { WorkbenchPage, PubSubPage } from 'e2eSrc/pages';
import { newApi, maskDynamic, captureFullPage } from './fixtures';

/**
 * Scene: instance-level pages reachable with a plain standalone Redis —
 * Workbench and Pub/Sub. (Analytics/RDI/discovery pages need charts / an RDI
 * instance / cloud flows and are tracked in scripts/list-pages.mjs for later.)
 */

const REDIS_HOST = process.env.SPIKE_REDIS_HOST2 || '127.0.0.1';
const REDIS_PORT = Number(process.env.SPIKE_REDIS_PORT2 || 8100);

const api = newApi();
let databaseId: string;

test.beforeAll(async () => {
  await api.acceptEula();
  const db = await api.createDatabase({
    name: 'visual-instance-pages-db',
    host: REDIS_HOST,
    port: REDIS_PORT,
  });
  databaseId = db.id;
});

test.afterAll(async () => {
  if (databaseId) await api.deleteDatabase(databaseId).catch(() => {});
  await api.dispose();
});

test('workbench — empty editor + tutorials', async ({ page }) => {
  await page.goto('/');
  const workbench = new WorkbenchPage(page);
  await workbench.goto(databaseId);

  // Mask the Monaco editor: it renders its own (canvas) cursor that Playwright's
  // caret:'hide' can't suppress, plus the auto-refreshing instance header.
  await captureFullPage(page, 'workbench-landing.png', {
    mask: [...maskDynamic(page), page.locator('.monaco-editor')],
  });
});

test('pub/sub — not subscribed', async ({ page }) => {
  await page.goto('/');
  const pubSub = new PubSubPage(page);
  await pubSub.goto(databaseId);
  await expect(page.getByText('You are not subscribed')).toBeVisible();

  await captureFullPage(page, 'pubsub-not-subscribed.png', {
    mask: maskDynamic(page),
  });
});

test('workbench — command result (PING)', async ({ page }) => {
  await page.goto('/');
  const workbench = new WorkbenchPage(page);
  await workbench.goto(databaseId);

  // PING → PONG is a stable, data-independent result.
  await workbench.executeCommand('PING');
  await expect(page.getByText('PONG')).toBeVisible();

  await captureFullPage(page, 'workbench-ping-result.png', {
    mask: [...maskDynamic(page), page.locator('.monaco-editor')],
  });
});

// NOTE: a CLI-panel scene was attempted but the panel has a persistent
// animation that never settles (even with the input masked) — it needs a
// dedicated stability strategy before it can be added.
