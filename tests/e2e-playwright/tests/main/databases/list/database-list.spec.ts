import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory, ClusterConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';
import { faker } from '@faker-js/faker';

/**
 * Database List Tests (TEST_PLAN.md: 1.2 Database List)
 *
 * Tests for the database list page: search, columns, selection, bulk actions,
 * row actions, and status indicators.
 */
test.describe('Database List', () => {
  const databases: DatabaseInstance[] = [];
  let standaloneDb1: DatabaseInstance;
  let standaloneDb2: DatabaseInstance;
  let clusterDb: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    const config1 = StandaloneConfigFactory.build({ name: `test-alpha-${faker.string.alphanumeric(6)}` });
    standaloneDb1 = await apiHelper.createDatabase(config1);
    databases.push(standaloneDb1);

    const config2 = StandaloneConfigFactory.build({ name: `test-beta-${faker.string.alphanumeric(6)}` });
    standaloneDb2 = await apiHelper.createDatabase(config2);
    databases.push(standaloneDb2);

    const clusterConfig = ClusterConfigFactory.build({ name: `test-gamma-cluster-${faker.string.alphanumeric(6)}` });
    clusterDb = await apiHelper.createDatabase(clusterConfig);
    databases.push(clusterDb);
  });

  test.afterAll(async ({ apiHelper }) => {
    for (const db of databases) {
      if (db?.id) {
        try {
          await apiHelper.deleteDatabase(db.id);
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  });

  test.beforeEach(async ({ databasesPage }) => {
    await databasesPage.goto();
  });

  // ==================== SEARCH ====================

  test.describe('Search', () => {
    test('should filter databases by search query', async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      await databaseList.search(standaloneDb1.name);
      await databaseList.expectDatabaseVisible(standaloneDb1.name);
      await databaseList.expectDatabaseNotVisible(standaloneDb2.name);
    });

    test('should filter with partial match', async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      // Search with partial name (the "test-alpha" prefix)
      const partial = standaloneDb1.name.substring(0, 10);
      await databaseList.search(partial);
      await databaseList.expectDatabaseVisible(standaloneDb1.name);
    });

    test('should perform case-insensitive search', async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      await databaseList.search(standaloneDb1.name.toUpperCase());
      await databaseList.expectDatabaseVisible(standaloneDb1.name);
    });

    test('should filter by host:port', async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      await databaseList.search(`${standaloneDb1.host}:${standaloneDb1.port}`);

      // Both standalone databases share the same host:port, so both should be visible
      await databaseList.expectDatabaseVisible(standaloneDb1.name);
      await databaseList.expectDatabaseVisible(standaloneDb2.name);
    });

    test('should clear search', async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      await databaseList.search(standaloneDb1.name);
      await databaseList.expectDatabaseVisible(standaloneDb1.name);

      await databaseList.clearSearch();
      const searchValue = await databaseList.getSearchValue();
      expect(searchValue).toBe('');

      // All databases should be visible again
      await databaseList.expectDatabaseVisible(standaloneDb1.name);
      await databaseList.expectDatabaseVisible(standaloneDb2.name);
    });

    test('should show no results message', async ({ databasesPage }) => {
      const { databaseList } = databasesPage;
      const nonExistentName = `non-existent-${faker.string.alphanumeric(16)}`;

      await databaseList.search(nonExistentName);

      const noResults = databasesPage.page.getByText(/no results/i);
      await expect(noResults).toBeVisible();
    });

    test('should search by database name', async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      await databaseList.search(standaloneDb2.name);
      await databaseList.expectDatabaseVisible(standaloneDb2.name);
      await databaseList.expectDatabaseNotVisible(standaloneDb1.name);
    });

    test('should search by host', async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      await databaseList.search(standaloneDb1.host);
      await databaseList.expectDatabaseVisible(standaloneDb1.name);
    });

    test('should search by port', async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      await databaseList.search(clusterDb.port.toString());
      await databaseList.expectDatabaseVisible(clusterDb.name);
    });
  });

  // ==================== COLUMNS ====================

  test.describe('Columns', () => {
    test('should show columns button', async ({ databasesPage }) => {
      const { databaseList } = databasesPage;
      await expect(databaseList.columnsButton).toBeVisible();
    });

    test('should hide and show columns', async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      // Verify Host column is visible by default
      const isHostVisible = await databaseList.isColumnVisible('Host');
      expect(isHostVisible).toBe(true);

      // Toggle Host column off
      await databaseList.toggleColumn('Host');
      const isHostHidden = await databaseList.isColumnVisible('Host');
      expect(isHostHidden).toBe(false);

      // Toggle Host column back on
      await databaseList.toggleColumn('Host');
      const isHostRestored = await databaseList.isColumnVisible('Host');
      expect(isHostRestored).toBe(true);
    });
  });

  // ==================== SELECTION ====================

  test.describe('Selection', () => {
    test('should select single database', async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      await databaseList.selectRow(standaloneDb1.name);
      const isSelected = await databaseList.isRowSelected(standaloneDb1.name);
      expect(isSelected).toBe(true);

      await databaseList.expectSelectedCount(1);
      await databaseList.cancelSelection();
    });

    test('should select multiple databases', async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      await databaseList.selectRow(standaloneDb1.name);
      await databaseList.selectRow(standaloneDb2.name);

      await databaseList.expectSelectedCount(2);
      await databaseList.cancelSelection();
    });

    test('should select all databases', async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      await databaseList.selectAll();

      const totalCount = await databaseList.getVisibleRowCount();
      const selectedCount = await databaseList.getSelectedCount();
      expect(selectedCount).toBe(totalCount);

      await databaseList.cancelSelection();
    });

    test('should delete multiple databases', async ({ apiHelper, databasesPage }) => {
      const { databaseList } = databasesPage;

      // Create two temporary databases for deletion
      const tmpConfig1 = StandaloneConfigFactory.build({ name: `test-del-a-${faker.string.alphanumeric(6)}` });
      const tmpConfig2 = StandaloneConfigFactory.build({ name: `test-del-b-${faker.string.alphanumeric(6)}` });
      await apiHelper.createDatabase(tmpConfig1);
      await apiHelper.createDatabase(tmpConfig2);

      // Refresh the page to see new databases
      await databasesPage.goto();

      await databaseList.search('test-del-');
      await databaseList.selectRow(tmpConfig1.name);
      await databaseList.selectRow(tmpConfig2.name);
      await databaseList.deleteSelected();

      await databaseList.clearSearch();
      await databaseList.expectDatabaseNotVisible(tmpConfig1.name);
      await databaseList.expectDatabaseNotVisible(tmpConfig2.name);
    });
  });

  // ==================== ROW ACTIONS ====================

  test.describe('Row Actions', () => {
    test('should edit database connection', async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      await databaseList.edit(standaloneDb1.name);

      const editDialog = databasesPage.page.getByRole('dialog', { name: /edit database/i });
      await expect(editDialog).toBeVisible();

      await databasesPage.page.getByRole('button', { name: 'Cancel' }).click();
      await expect(editDialog).not.toBeVisible();
    });

    test('should clone database connection', async ({ databasesPage }) => {
      const { databaseList, cloneDatabaseDialog } = databasesPage;

      await databaseList.openCloneDialog(standaloneDb1.name);
      await expect(cloneDatabaseDialog.dialog).toBeVisible();

      await cloneDatabaseDialog.cancel();
    });

    test('should connect to database', async ({ databasesPage, browserPage }) => {
      const { databaseList } = databasesPage;

      await databaseList.connect(standaloneDb1.name);

      // Verify we navigated to the browser page
      await expect(browserPage.page.getByTestId('browser-page')).toBeVisible({ timeout: 15000 });

      // Navigate back
      await browserPage.gotoHome();
    });
  });

  // ==================== REDIS STACK ====================

  test('should verify Redis Stack icon displayed for databases with modules', async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    const row = databaseList.getRow(standaloneDb1.name);
    await expect(row).toBeVisible();

    const moduleIcons = row.getByTestId(/_module$/);
    await expect(moduleIcons.first()).toBeVisible();
  });
});
