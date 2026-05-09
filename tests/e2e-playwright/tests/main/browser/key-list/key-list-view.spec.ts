import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { TEST_KEY_PREFIX } from 'e2eSrc/test-data/browser';
import { DatabaseInstance } from 'e2eSrc/types';

/**
 * Browser Key List View — consolidated E2E (TEST_PLAN 2.1).
 * Pattern/wildcard matrix lives in ../key-filtering/key-filtering.spec.ts (2.14).
 *
 * Serial: shared database with destructive tests (delete / bulk delete).
 */
test.describe('Browser > Key List View', () => {
  test.describe.configure({ mode: 'serial' });

  let database: DatabaseInstance;
  const suffix = Date.now().toString(36);
  const stringKey = `${TEST_KEY_PREFIX}kl-str-${suffix}`;
  const refreshKey = `${TEST_KEY_PREFIX}kl-refresh-${suffix}`;
  const hashKey = `${TEST_KEY_PREFIX}kl-hash-${suffix}`;
  const hashKeyExtra = `${TEST_KEY_PREFIX}kl-hash-extra-${suffix}`;
  const deleteMeKey = `${TEST_KEY_PREFIX}kl-del-${suffix}`;
  const bulkKey1 = `${TEST_KEY_PREFIX}kl-bulk-a-${suffix}`;
  const bulkKey2 = `${TEST_KEY_PREFIX}kl-bulk-b-${suffix}`;
  const bulkPattern = `${TEST_KEY_PREFIX}kl-bulk-*-${suffix}`;
  const allTestKeysPattern = `${TEST_KEY_PREFIX}*`;

  test.beforeAll(async ({ apiHelper }) => {
    const config = StandaloneConfigFactory.build({
      name: `test-key-list-${suffix}`,
    });
    database = await apiHelper.createDatabase(config);
  });

  test.afterEach(async ({ apiHelper, browserPage }) => {
    if (database?.id) {
      await apiHelper.deleteKeysByPattern(database.id, allTestKeysPattern);
    }
    // These keys are persisted in localStorage and shared across all specs in the same Electron
    // instance. Clear them so the next spec gets the app's true defaults instead of the state these
    // tests force (browserViewType -> list view; autoRefreshRatekeys -> 1s rate from the auto-refresh test).
    await browserPage.page.evaluate(() => {
      localStorage.removeItem('browserViewType');
      localStorage.removeItem('autoRefreshRatekeys');
    });
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test('should show key list with seeded keys in list view', async ({ apiHelper, browserPage }) => {
    // Seed data for this test
    await apiHelper.createStringKey(database.id, stringKey, 'hello');

    // Open the Browser page in List view
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToListView();

    // Verify the seeded key is visible in the list
    await expect(browserPage.keyList.keyListContainer).toBeVisible();
    await expect(browserPage.keyList.keysSummary).toBeVisible();
    await expect(browserPage.keyList.getKeyRow(stringKey)).toBeVisible();
  });

  test('should filter by key type, then exact name, and open key details', async ({ apiHelper, browserPage }) => {
    // Seed data for this test
    await apiHelper.createStringKey(database.id, stringKey, 'hello');
    await apiHelper.createHashKey(database.id, hashKey, [{ field: 'f1', value: 'v1' }]);
    await apiHelper.createHashKey(database.id, hashKeyExtra, [{ field: 'f2', value: 'v2' }]);

    // Open the Browser page in List view
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToListView();

    // Verify key type filtering first
    await browserPage.keyList.filterByType('Hash');
    await expect(browserPage.keyList.getKeyRow(hashKey)).toBeVisible();
    await expect(browserPage.keyList.getKeyRow(hashKeyExtra)).toBeVisible();
    await expect(browserPage.keyList.getKeyRow(stringKey)).not.toBeVisible();

    // Verify exact-name search narrows results on top of key-type filter
    await browserPage.keyList.searchKeys(hashKey);
    await expect(browserPage.keyList.getKeyRow(hashKey)).toBeVisible();
    await expect(browserPage.keyList.getKeyRow(hashKeyExtra)).not.toBeVisible();
    await expect(browserPage.keyList.getKeyRow(stringKey)).not.toBeVisible();

    // Verify key details can be opened from the narrowed result
    await browserPage.keyList.clickKey(hashKey);
    await browserPage.keyDetails.waitForKeyDetails();
    expect(await browserPage.keyDetails.getKeyName()).toContain(hashKey);

    // Verify reset path back to all key types
    await browserPage.keyList.clearSearch();
    await browserPage.keyList.filterByType('All Key Types');
    await browserPage.keyList.waitForKeysLoaded();
    await expect(browserPage.keyList.getKeyRow(stringKey)).toBeVisible();
    await expect(browserPage.keyList.getKeyRow(hashKey)).toBeVisible();
  });

  test('should refresh key list', async ({ apiHelper, browserPage }) => {
    // Seed data for this test
    await apiHelper.createStringKey(database.id, stringKey, 'hello');

    // Open the Browser page in List view
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToListView();

    // Verify Refresh loads data created after the page has already rendered
    expect(await browserPage.keyList.keyExists(refreshKey, 1000)).toBe(false);
    await apiHelper.createStringKey(database.id, refreshKey, 'from-refresh-check');
    expect(await browserPage.keyList.keyExists(refreshKey, 1000)).toBe(false);

    await browserPage.keyList.refresh();
    await browserPage.keyList.waitForKeysLoaded();
    await expect(browserPage.keyList.getKeyRow(refreshKey)).toBeVisible();
  });

  test('should configure auto-refresh and update key list automatically', async ({ apiHelper, browserPage }) => {
    // Seed data for this test
    await apiHelper.createStringKey(database.id, stringKey, 'hello');

    // Open the Browser page in List view
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToListView();

    // Configure auto-refresh to 1 second and enable it
    await browserPage.keyList.openKeysAutoRefreshPopover();
    await expect(browserPage.keyList.keysAutoRefreshSwitch).toBeVisible();
    await browserPage.page.getByTestId('keys-refresh-rate').click();
    await browserPage.page.getByTestId('inline-item-editor').fill('1');
    await browserPage.page.getByTestId('apply-btn').click();
    await browserPage.keyList.keysAutoRefreshSwitch.click();
    await browserPage.page.keyboard.press('Escape');

    // Verify list updates without manual refresh
    await expect(browserPage.keyList.getKeyRow(refreshKey)).not.toBeVisible();
    await apiHelper.createStringKey(database.id, refreshKey, 'from-auto-refresh-check');
    await expect(browserPage.keyList.getKeyRow(refreshKey)).toBeVisible();

    // Disable auto-refresh so the 1s interval stops firing before the next serial test runs.
    await browserPage.keyList.openKeysAutoRefreshPopover();
    await browserPage.keyList.keysAutoRefreshSwitch.click();
    await browserPage.page.keyboard.press('Escape');
  });

  test('should show no results message for non-matching pattern', async ({ apiHelper, browserPage }) => {
    // Seed data for this test
    await apiHelper.createStringKey(database.id, stringKey, 'hello');

    // Open the Browser page in List view
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToListView();

    // Verify no-results state for a non-existing pattern
    await browserPage.keyList.searchKeys(`nonexistent-kl-${suffix}-zzz`);
    expect(await browserPage.keyList.isNoKeysMessageVisible()).toBe(true);
  });

  test('should configure columns visibility', async ({ apiHelper, browserPage }) => {
    // Seed data for this test
    await apiHelper.createStringKey(database.id, stringKey, 'hello');

    // Open the Browser page in List view
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToListView();

    // Verify TTL column visibility toggle in Columns popover
    await browserPage.keyList.openColumnsPopover();

    const ttlCheckbox = browserPage.page.getByTestId('show-ttl');
    const ttlColumnHeader = browserPage.page.getByRole('columnheader', { name: 'TTL' });

    // Start from a known state: enable TTL in popover, close, verify visible in table
    await ttlCheckbox.check();
    await browserPage.keyList.closeColumnsPopover();
    await expect(ttlColumnHeader).toBeVisible();

    // Hide TTL in popover, close, verify hidden in table
    await browserPage.keyList.openColumnsPopover();
    await ttlCheckbox.uncheck();
    await browserPage.keyList.closeColumnsPopover();
    await expect(ttlColumnHeader).toBeHidden();

    // Restore TTL in popover, close, verify visible in table
    await browserPage.keyList.openColumnsPopover();
    await ttlCheckbox.check();
    await browserPage.keyList.closeColumnsPopover();
    await expect(ttlColumnHeader).toBeVisible();
  });

  test('should switch UI when opening search by values', async ({ apiHelper, browserPage }) => {
    // Seed data for this test
    await apiHelper.createStringKey(database.id, stringKey, 'hello');

    // Open the Browser page in List view
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToListView();

    // Verify switching between Pattern search and Search by values UI
    await browserPage.keyList.searchByValuesButton.click();
    const indexOrHint = browserPage.keyList.indexSelector.or(
      browserPage.page.getByText(/Redis Query Engine|Select an index|Query Engine/i),
    );
    await expect(indexOrHint.first()).toBeVisible();
    await browserPage.keyList.filterByNameButton.click();
    await browserPage.keyList.waitForKeysLoaded();
  });

  test('should delete key', async ({ apiHelper, browserPage }) => {
    // Seed data for this test
    await apiHelper.createStringKey(database.id, deleteMeKey, 'delete-me');

    // Open the Browser page in List view
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToListView();

    // Verify deleting a single key removes it from the list
    await browserPage.keyList.searchKeys(deleteMeKey);
    await browserPage.keyList.clickKey(deleteMeKey);
    await browserPage.keyDetails.waitForKeyDetails();
    await browserPage.keyDetails.deleteKey();

    await browserPage.keyList.clearSearch();
    await browserPage.keyList.waitForKeysLoaded();
    expect(await browserPage.keyList.keyExists(deleteMeKey)).toBe(false);
  });

  test('should delete multiple keys (bulk)', async ({ apiHelper, browserPage }) => {
    // Seed data for this test
    await apiHelper.createStringKey(database.id, bulkKey1, 'b1');
    await apiHelper.createStringKey(database.id, bulkKey2, 'b2');

    // Open the Browser page in List view
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToListView();

    // Verify bulk delete removes all keys matching the pattern
    await browserPage.keyList.searchKeys(bulkPattern);
    await expect(browserPage.keyList.getKeyRow(bulkKey1)).toBeVisible();
    await expect(browserPage.keyList.getKeyRow(bulkKey2)).toBeVisible();

    await browserPage.bulkActionsPanel.open();
    await browserPage.bulkActionsPanel.selectDeleteKeysTab();
    await browserPage.bulkActionsPanel.performBulkDelete();

    await browserPage.bulkActionsPanel.close();

    await browserPage.keyList.searchKeys(bulkPattern);
    await expect(browserPage.keyList.emptyDatabasePanel).toBeVisible();
    await expect(browserPage.keyList.getKeyRow(bulkKey1)).not.toBeVisible();
    await expect(browserPage.keyList.getKeyRow(bulkKey2)).not.toBeVisible();
  });
});
