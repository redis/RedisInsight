import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneV8ConfigFactory, StandaloneV880ConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';

/**
 * Browser > Vector Set > Gating
 *
 * The Vector Set key-type option is hidden in the Browser UI by two
 * independent gates:
 *   1. Redis must report version >= 8.0 (isVersionHigherOrEquals in
 *      redisinsight/ui/.../key-type-options.ts).
 *   2. The `dev-vectorSet` feature flag must be enabled.
 *
 * Each describe block toggles one gate off in isolation; the option must
 * disappear from both the key-list filter dropdown and the Add Key dialog's
 * type dropdown.
 */

test.describe('Browser > Vector Set > Gating > Redis below 8.0, flag on', () => {
  // oss-standalone-v8 is pinned to redis:8.0-M02, which reports
  // redis_version:7.9.225 — below the UI's 8.0 cutoff for Vector Sets.
  test.use({ featureFlags: { 'dev-vectorSet': true } });

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

test.describe('Browser > Vector Set > Gating > Redis 8.8.0, flag off', () => {
  // V880 supports Vector Set at the protocol level; the dev flag is the
  // only thing suppressing the option in this block.
  test.use({ featureFlags: { 'dev-vectorSet': false } });

  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(
      StandaloneV880ConfigFactory.build({ name: 'test-vector-set-gating-flag' }),
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
