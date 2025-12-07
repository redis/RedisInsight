import { test, expect } from '../../../fixtures/base';
import { getStandaloneConfig, TEST_DB_PREFIX } from '../../../test-data/databases';
import { Tags } from '../../../config';

// Run tests serially to avoid parallel test interference with shared database state
test.describe.serial('Database List > Search', () => {
  // Use unique names per test run to avoid parallel test interference
  let uniquePrefix: string;
  let dbNames: { alpha: string; beta: string; gamma: string; unique: string };

  test.beforeEach(async ({ databasesPage, apiHelper }) => {
    // Generate unique names for this test run
    const uniqueId = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    uniquePrefix = `${TEST_DB_PREFIX}srch-${uniqueId}`;
    dbNames = {
      alpha: `${uniquePrefix}-alpha`,
      beta: `${uniquePrefix}-beta`,
      gamma: `${uniquePrefix}-gamma`,
      unique: `${uniquePrefix}-unique`,
    };

    // Create test databases with different names for search testing
    await apiHelper.createDatabase(getStandaloneConfig({ name: dbNames.alpha }));
    await apiHelper.createDatabase(getStandaloneConfig({ name: dbNames.beta }));
    await apiHelper.createDatabase(getStandaloneConfig({ name: dbNames.gamma }));
    await apiHelper.createDatabase(getStandaloneConfig({ name: dbNames.unique }));

    // Navigate and reload to ensure the list shows newly created databases
    await databasesPage.goto();
    await databasesPage.reload();

    // Wait for the first database to be visible (search first to handle pagination)
    await databasesPage.databaseList.expectDatabaseVisible(dbNames.alpha, { searchFirst: true });
    // Clear search for the actual test
    await databasesPage.databaseList.clearSearch();
  });

  test.afterEach(async ({ apiHelper }) => {
    // Only delete databases created by this specific test (using unique prefix)
    await apiHelper.deleteDatabasesByPattern(new RegExp(`^${uniquePrefix}`));
  });

  test(`should filter databases by search query ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    await databaseList.search(dbNames.alpha);

    await databaseList.expectDatabaseVisible(dbNames.alpha);
    await databaseList.expectDatabaseNotVisible(dbNames.beta);
    await databaseList.expectDatabaseNotVisible(dbNames.gamma);
    await databaseList.expectDatabaseNotVisible(dbNames.unique);
  });

  test(`should filter multiple databases with partial match ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    // Search by the unique prefix to find all test databases except 'unique'
    await databaseList.search(`${uniquePrefix}-`);

    await databaseList.expectDatabaseVisible(dbNames.alpha);
    await databaseList.expectDatabaseVisible(dbNames.beta);
    await databaseList.expectDatabaseVisible(dbNames.gamma);
    await databaseList.expectDatabaseVisible(dbNames.unique);
  });

  test(`should show all databases when search is cleared ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    // First filter
    await databaseList.search(dbNames.unique);
    await databaseList.expectDatabaseNotVisible(dbNames.alpha);

    // Clear and verify all visible (use searchFirst to handle pagination)
    await databaseList.clearSearch();

    await databaseList.expectDatabaseVisible(dbNames.alpha, { searchFirst: true });
    await databaseList.clearSearch();
    await databaseList.expectDatabaseVisible(dbNames.unique, { searchFirst: true });
  });

  test(`should be case-insensitive search ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    await databaseList.search(dbNames.alpha.toUpperCase());

    await databaseList.expectDatabaseVisible(dbNames.alpha);
  });

  test(`should show no results for non-matching query ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    await databaseList.search('nonexistent-database-xyz');

    // All test databases should be hidden
    await databaseList.expectDatabaseNotVisible(dbNames.alpha);
    await databaseList.expectDatabaseNotVisible(dbNames.unique);
  });

  test(`should filter by host:port ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    // Search by port (6379 is the standalone port from config)
    await databaseList.search('6379');

    // All databases on port 6379 should be visible
    const visibleCount = await databaseList.getVisibleRowCount();
    expect(visibleCount).toBeGreaterThan(0);
  });
});
