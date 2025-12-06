import { test, expect } from '../../../fixtures/base';
import { getStandaloneConfig, TEST_DB_PREFIX } from '../../../test-data/databases';
import { Tags } from '../../../config';

// Run tests serially to avoid parallel test interference with shared database state
test.describe.serial('Database List > Column Configuration', () => {
  // Use unique names per test run to avoid parallel test interference
  let uniquePrefix: string;
  let dbName: string;

  test.beforeEach(async ({ databasesPage, apiHelper }) => {
    // Generate unique names for this test run
    const uniqueId = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    uniquePrefix = `${TEST_DB_PREFIX}col-${uniqueId}`;
    dbName = `${uniquePrefix}-db`;

    // Create a test database to have data in the list
    await apiHelper.createDatabase(getStandaloneConfig({ name: dbName }));
    await databasesPage.goto();

    // Wait for the database to be visible to ensure the page has loaded
    await databasesPage.databaseList.expectDatabaseVisible(dbName);
  });

  test.afterEach(async ({ apiHelper }) => {
    // Only delete databases created by this specific test (using unique prefix)
    await apiHelper.deleteDatabasesByPattern(new RegExp(`^${uniquePrefix}`));
  });

  test(`should show columns button ${Tags.SMOKE}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    await expect(databaseList.columnsButton).toBeVisible();
  });

  test(`should open columns dropdown ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    await databaseList.openColumnConfig();

    // Verify dropdown content
    await expect(databasesPage.page.getByRole('checkbox', { name: /database alias/i })).toBeVisible();
    await expect(databasesPage.page.getByRole('checkbox', { name: /host:port/i })).toBeVisible();
    await expect(databasesPage.page.getByRole('checkbox', { name: /connection type/i })).toBeVisible();
  });

  test(`should have all columns visible by default ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    expect(await databaseList.isColumnVisible('Database Alias')).toBe(true);
    expect(await databaseList.isColumnVisible('Host:Port')).toBe(true);
    expect(await databaseList.isColumnVisible('Connection Type')).toBe(true);
    expect(await databaseList.isColumnVisible('Last connection')).toBe(true);
  });

  test(`should hide column when unchecked ${Tags.CRITICAL}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    // Verify column is initially visible
    expect(await databaseList.isColumnVisible('Connection Type')).toBe(true);

    // Toggle off
    await databaseList.toggleColumn('Connection Type');

    // Verify column is hidden
    expect(await databaseList.isColumnVisible('Connection Type')).toBe(false);

    // Toggle back on
    await databaseList.toggleColumn('Connection Type');
    expect(await databaseList.isColumnVisible('Connection Type')).toBe(true);
  });

  test(`should hide Tags column ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    expect(await databaseList.isColumnVisible('Tags')).toBe(true);

    await databaseList.toggleColumn('Tags');

    expect(await databaseList.isColumnVisible('Tags')).toBe(false);
  });

  test(`should hide Capabilities column ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    expect(await databaseList.isColumnVisible('Capabilities')).toBe(true);

    await databaseList.toggleColumn('Capabilities');

    expect(await databaseList.isColumnVisible('Capabilities')).toBe(false);
  });
});
