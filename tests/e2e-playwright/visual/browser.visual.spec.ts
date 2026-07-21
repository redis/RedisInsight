import { test, expect } from '@playwright/test';
import { BrowserPage, CommandHelperPanel } from 'e2eSrc/pages';
import { newApi, maskDynamic, captureFullPage } from './fixtures';

/**
 * Scene: Browser — filter-by-key-type dropdown and the Command Helper panel.
 * Uses a reachable Redis (defaults to the RTE container on 127.0.0.1:6399);
 * these screens are not data-dependent.
 */

const REDIS_HOST = process.env.SPIKE_REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.SPIKE_REDIS_PORT || 6399);

const api = newApi();
let databaseId: string;

test.beforeAll(async () => {
  await api.acceptEula();
  const db = await api.createDatabase({
    name: 'visual-browser-db',
    host: REDIS_HOST,
    port: REDIS_PORT,
  });
  databaseId = db.id;
});

test.afterAll(async () => {
  if (databaseId) await api.deleteDatabase(databaseId).catch(() => {});
  await api.dispose();
});

test('browser — filter by key type dropdown open', async ({ page }) => {
  await page.goto('/');
  const browserPage = new BrowserPage(page);
  await browserPage.goto(databaseId);

  await page.getByTestId('select-filter-key-type').click();
  await expect(page.getByTestId('all-key-types-option')).toBeVisible();

  await captureFullPage(page, 'browser-filter-key-type-open.png', {
    mask: maskDynamic(page),
  });
});

test('command helper — panel open', async ({ page }) => {
  await page.goto('/');
  const browserPage = new BrowserPage(page);
  await browserPage.goto(databaseId);

  const commandHelper = new CommandHelperPanel(page);
  await commandHelper.open();
  await expect(page.getByTestId('cli-helper')).toBeVisible();

  // Scope to the Command Helper panel itself — avoids the auto-refreshing header.
  await expect(page.getByTestId('command-helper')).toHaveScreenshot('command-helper-open.png');
});
