import { test } from '../../../fixtures/base';
import { getStandaloneConfig, TEST_DB_PREFIX } from '../../../test-data/databases';
import { Tags } from '../../../config';

// Run tests serially to avoid parallel test interference with shared database state
test.describe.serial('Add Database > Standalone', () => {
  // Use unique names per test run to avoid parallel test interference
  let uniquePrefix: string;

  test.beforeEach(async ({ databasesPage }) => {
    // Generate unique prefix for this test run
    const uniqueId = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    uniquePrefix = `${TEST_DB_PREFIX}add-${uniqueId}`;
    await databasesPage.goto();
  });

  test.afterEach(async ({ apiHelper }) => {
    // Only delete databases created by this specific test (using unique prefix)
    await apiHelper.deleteDatabasesByPattern(new RegExp(`^${uniquePrefix}`));
  });

  test(`should add standalone database ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ databasesPage }) => {
    const config = getStandaloneConfig({ name: `${uniquePrefix}-standalone` });

    await databasesPage.addDatabase(config);

    // Search for the database to handle pagination
    await databasesPage.databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test(`should add database with no auth ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const config = getStandaloneConfig({
      name: `${uniquePrefix}-noauth`,
      username: undefined,
      password: undefined,
    });

    await databasesPage.addDatabase(config);

    // Search for the database to handle pagination
    await databasesPage.databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test(`should add database with username only ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const config = getStandaloneConfig({
      name: `${uniquePrefix}-useronly`,
      username: 'default',
      password: undefined,
    });

    await databasesPage.addDatabase(config);

    // Search for the database to handle pagination
    await databasesPage.databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test(`should add database with username and password ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const config = getStandaloneConfig({
      name: `${uniquePrefix}-userpass`,
      username: 'default',
      password: 'password',
    });

    await databasesPage.addDatabase(config);

    // Search for the database to handle pagination
    await databasesPage.databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });
});
