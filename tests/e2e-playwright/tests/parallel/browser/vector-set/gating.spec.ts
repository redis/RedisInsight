import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneV8ConfigFactory, StandaloneV880ConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';

test.describe('Browser > Vector Set > Gating > Redis below 8.0', () => {
  // V8 factory points at redis:8.0-M02, which reports redis_version:7.9.225.
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(
      StandaloneV8ConfigFactory.build({ name: 'test-vector-set-gating-version' }),
    );
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test('hides Vector Set from the key-type filter dropdown', async ({ browserPage }) => {
    await browserPage.goto(database.id);

    await browserPage.keyList.keyTypeFilter.click();
    await expect(browserPage.keyList.keyTypeFilterDropdown).toBeVisible();

    await expect(
      browserPage.keyList.keyTypeFilterDropdown.getByRole('option', { name: 'Vector Set', exact: true }),
    ).toHaveCount(0);
  });

  test('hides Vector Set from the Add Key type dropdown', async ({ browserPage }) => {
    await browserPage.goto(database.id);
    await browserPage.openAddKeyDialog();

    await browserPage.addKeyDialog.keyTypeSelect.click();
    await expect(browserPage.addKeyDialog.keyTypeDropdown).toBeVisible();

    await expect(
      browserPage.addKeyDialog.keyTypeDropdown.getByRole('option', { name: 'Vector Set', exact: true }),
    ).toHaveCount(0);
  });
});

test.describe('Browser > Vector Set > Gating > Redis 8.8.0', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(
      StandaloneV880ConfigFactory.build({ name: 'test-vector-set-gating-version-supported' }),
    );
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test('shows Vector Set in the key-type filter dropdown', async ({ browserPage }) => {
    await browserPage.goto(database.id);

    await browserPage.keyList.keyTypeFilter.click();
    await expect(browserPage.keyList.keyTypeFilterDropdown).toBeVisible();

    await expect(
      browserPage.keyList.keyTypeFilterDropdown.getByRole('option', { name: 'Vector Set', exact: true }),
    ).toBeVisible();
  });

  test('shows Vector Set in the Add Key type dropdown', async ({ browserPage }) => {
    await browserPage.goto(database.id);
    await browserPage.openAddKeyDialog();

    await browserPage.addKeyDialog.keyTypeSelect.click();
    await expect(browserPage.addKeyDialog.keyTypeDropdown).toBeVisible();

    await expect(
      browserPage.addKeyDialog.keyTypeDropdown.getByRole('option', { name: 'Vector Set', exact: true }),
    ).toBeVisible();
  });
});
