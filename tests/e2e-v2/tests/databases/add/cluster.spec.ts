import { test } from '../../../fixtures/base';
import { getClusterConfig, TEST_DB_PREFIX } from '../../../test-data/databases';
import { Tags } from '../../../config';

// Run tests serially to avoid parallel test interference with shared database state
test.describe.serial('Add Database > Cluster', () => {
  // Use unique names per test run to avoid parallel test interference
  let uniquePrefix: string;

  test.beforeEach(async ({ databasesPage }) => {
    // Generate unique prefix for this test run
    const uniqueId = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    uniquePrefix = `${TEST_DB_PREFIX}clst-${uniqueId}`;
    await databasesPage.goto();
  });

  test.afterEach(async ({ apiHelper }) => {
    // Only delete databases created by this specific test (using unique prefix)
    await apiHelper.deleteDatabasesByPattern(new RegExp(`^${uniquePrefix}`));
  });

  test(`should add cluster database ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ databasesPage }) => {
    const config = getClusterConfig({ name: `${uniquePrefix}-cluster` });

    await databasesPage.addDatabase(config);

    // Search for the database to handle pagination and parallel test interference
    await databasesPage.databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });
});
