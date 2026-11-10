import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance, Environment } from 'e2eSrc/types';

/**
 * End-to-end: the Key Size column is hidden on Production databases and the
 * Browser never asks Redis for key sizes there (MEMORY USAGE can block a large
 * production database). Other environments keep the column and the toggle.
 */
const uniqueId = () => faker.string.alphanumeric(6);
const KEY_SIZE_ENDPOINTS = /keys\/get-(metadata|info)/;
const DATABASE_RECORD_DELAY_MS = 3000;

const collectSizeRequests = (page: Page): Array<{ includeSize?: boolean }> => {
  const bodies: Array<{ includeSize?: boolean }> = [];
  page.on('request', (request) => {
    if (request.method() !== 'POST' || !KEY_SIZE_ENDPOINTS.test(request.url())) return;
    const body = request.postDataJSON();
    if (Array.isArray(body.keys) && body.keys.length === 0) return;
    bodies.push(body);
  });
  return bodies;
};

test.describe('Browser > Key List > Key size by environment', () => {
  test.describe('Production DB', () => {
    let database: DatabaseInstance;
    const keyName = `test-size-prod-${uniqueId()}`;

    test.beforeAll(async ({ apiHelper }) => {
      database = await apiHelper.createDatabase(StandaloneConfigFactory.build({ environment: Environment.Production }));
      await apiHelper.createStringKey(database.id, keyName, 'value');
    });

    test.afterAll(async ({ apiHelper }) => {
      await apiHelper.deleteKeysByPattern(database.id, keyName).catch(() => {});
      await apiHelper.deleteDatabase(database.id).catch(() => {});
    });

    test('should not show the size column or request key sizes', async ({ browserPage }) => {
      const requestBodies = collectSizeRequests(browserPage.page);

      await browserPage.goto(database.id);
      await browserPage.keyList.searchKeys(keyName);
      await expect(browserPage.keyList.getKeyRow(keyName)).toBeVisible();

      await expect.poll(() => requestBodies.length).toBeGreaterThan(0);
      expect(requestBodies.every(({ includeSize }) => includeSize === false)).toBe(true);
      await expect(browserPage.keyList.getKeySizeCell(keyName)).toBeHidden();
    });

    test('should not offer the key size toggle in the Columns menu', async ({ browserPage }) => {
      await browserPage.goto(database.id);
      await browserPage.keyList.columnsButton.click();

      await expect(browserPage.keyList.showTtlToggle).toBeVisible();
      await expect(browserPage.keyList.showKeySizeToggle).toBeHidden();
    });

    test('should not request key sizes after the database record fails to load', async ({ browserPage }) => {
      const databaseRecord = new RegExp(`/api/databases/${database.id}(\\?.*)?$`);
      await browserPage.page.route(databaseRecord, (route) =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Database record unavailable' }),
        }),
      );
      const requestBodies = collectSizeRequests(browserPage.page);

      await browserPage.goto(database.id);
      await browserPage.keyList.searchKeys(keyName);
      await expect(browserPage.keyList.getKeyRow(keyName)).toBeVisible();

      await expect.poll(() => requestBodies.length).toBeGreaterThan(0);
      expect(requestBodies.every(({ includeSize }) => includeSize === false)).toBe(true);
    });

    test('should not request key sizes while the database record is still loading', async ({ browserPage }) => {
      const databaseRecord = new RegExp(`/api/databases/${database.id}(\\?.*)?$`);
      await browserPage.page.route(databaseRecord, async (route) => {
        await new Promise((resolve) => setTimeout(resolve, DATABASE_RECORD_DELAY_MS));
        await route.continue();
      });
      const requestBodies = collectSizeRequests(browserPage.page);

      await browserPage.goto(database.id);
      await browserPage.keyList.searchKeys(keyName);
      await expect(browserPage.keyList.getKeyRow(keyName)).toBeVisible();

      await expect.poll(() => requestBodies.length).toBeGreaterThan(0);
      expect(requestBodies.every(({ includeSize }) => includeSize === false)).toBe(true);
    });
  });

  test.describe('Database labelled production after it was already in use', () => {
    let database: DatabaseInstance;
    const keyName = `test-size-relabel-${uniqueId()}`;

    test.beforeAll(async ({ apiHelper }) => {
      database = await apiHelper.createDatabase(
        StandaloneConfigFactory.build({ environment: Environment.Development }),
      );
      await apiHelper.createStringKey(database.id, keyName, 'value');
    });

    test.afterAll(async ({ apiHelper }) => {
      await apiHelper.deleteKeysByPattern(database.id, keyName).catch(() => {});
      await apiHelper.deleteDatabase(database.id).catch(() => {});
    });

    test('should hide the size column and stop requesting sizes even with a saved column choice', async ({
      apiHelper,
      browserPage,
    }) => {
      await browserPage.goto(database.id);
      await browserPage.keyList.columnsButton.click();
      await browserPage.keyList.showTtlToggle.click();
      await browserPage.keyList.showTtlToggle.click();
      await browserPage.keyList.searchKeys(keyName);
      await expect(browserPage.keyList.getKeySizeCell(keyName)).toBeVisible();

      await apiHelper.updateDatabase(database.id, { environment: Environment.Production });

      const requestBodies = collectSizeRequests(browserPage.page);

      await browserPage.goto(database.id);
      await browserPage.keyList.searchKeys(keyName);
      await expect(browserPage.keyList.getKeyRow(keyName)).toBeVisible();

      await expect.poll(() => requestBodies.length).toBeGreaterThan(0);
      expect(requestBodies.every(({ includeSize }) => includeSize === false)).toBe(true);
      await expect(browserPage.keyList.getKeySizeCell(keyName)).toBeHidden();
    });
  });

  test.describe('Database labelled production after it was already in use (tree view)', () => {
    let database: DatabaseInstance;
    const keyName = `test-size-relabel-tree-${uniqueId()}`;

    test.beforeAll(async ({ apiHelper }) => {
      database = await apiHelper.createDatabase(
        StandaloneConfigFactory.build({ environment: Environment.Development }),
      );
      await apiHelper.createStringKey(database.id, keyName, 'value');
    });

    test.afterAll(async ({ apiHelper }) => {
      await apiHelper.deleteKeysByPattern(database.id, keyName).catch(() => {});
      await apiHelper.deleteDatabase(database.id).catch(() => {});
    });

    test('should hide the size cell with a saved column choice', async ({ apiHelper, browserPage }) => {
      await browserPage.goto(database.id);
      await browserPage.keyList.columnsButton.click();
      await browserPage.keyList.showTtlToggle.click();
      await browserPage.keyList.showTtlToggle.click();
      await browserPage.keyList.switchToTreeView();
      await browserPage.keyList.searchKeys(keyName);
      await expect(browserPage.keyList.getKeySizeCell(keyName)).toBeVisible();

      await apiHelper.updateDatabase(database.id, { environment: Environment.Production });

      await browserPage.goto(database.id);
      await browserPage.keyList.switchToTreeView();
      await browserPage.keyList.searchKeys(keyName);
      await expect(browserPage.keyList.getTreeNode(keyName)).toBeVisible();

      await expect(browserPage.keyList.getKeySizeCell(keyName)).toBeHidden();
    });
  });

  test.describe('Development DB', () => {
    let database: DatabaseInstance;
    const keyName = `test-size-dev-${uniqueId()}`;

    test.beforeAll(async ({ apiHelper }) => {
      database = await apiHelper.createDatabase(
        StandaloneConfigFactory.build({ environment: Environment.Development }),
      );
      await apiHelper.createStringKey(database.id, keyName, 'value');
    });

    test.afterAll(async ({ apiHelper }) => {
      await apiHelper.deleteKeysByPattern(database.id, keyName).catch(() => {});
      await apiHelper.deleteDatabase(database.id).catch(() => {});
    });

    test('should show the size column and request key sizes', async ({ browserPage }) => {
      const requestBodies = collectSizeRequests(browserPage.page);

      await browserPage.goto(database.id);
      await browserPage.keyList.searchKeys(keyName);
      await expect(browserPage.keyList.getKeySizeCell(keyName)).toBeVisible();

      expect(requestBodies.some(({ includeSize }) => includeSize === true)).toBe(true);
    });

    test('should offer the key size toggle in the Columns menu', async ({ browserPage }) => {
      await browserPage.goto(database.id);
      await browserPage.keyList.columnsButton.click();

      await expect(browserPage.keyList.showKeySizeToggle).toBeVisible();
    });
  });
});
