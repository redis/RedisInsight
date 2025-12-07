import { test, expect } from '../../../fixtures/base';
import { getStandaloneConfig, TEST_DB_PREFIX } from '../../../test-data/databases';
import { Tags } from '../../../config';

// Run tests serially to avoid parallel test interference with shared database state
test.describe.serial('Database List > Bulk Actions', () => {
  // Use unique names per test run to avoid parallel test interference
  let dbNames: { first: string; second: string; third: string };
  let uniquePrefix: string;

  test.beforeEach(async ({ databasesPage, apiHelper }) => {
    // Generate unique names for this test run using timestamp + random string
    const uniqueId = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    uniquePrefix = `${TEST_DB_PREFIX}bulk-${uniqueId}`;
    dbNames = {
      first: `${uniquePrefix}-first`,
      second: `${uniquePrefix}-second`,
      third: `${uniquePrefix}-third`,
    };

    // Create test databases for bulk action testing
    await apiHelper.createDatabase(getStandaloneConfig({ name: dbNames.first }));
    await apiHelper.createDatabase(getStandaloneConfig({ name: dbNames.second }));
    await apiHelper.createDatabase(getStandaloneConfig({ name: dbNames.third }));

    // Navigate and reload to ensure the list shows newly created databases
    await databasesPage.goto();
    await databasesPage.reload();

    // Wait for the first database to be visible (search first to handle pagination)
    await databasesPage.databaseList.expectDatabaseVisible(dbNames.first, { searchFirst: true });
    // Clear search for the actual test
    await databasesPage.databaseList.clearSearch();
  });

  test.afterEach(async ({ apiHelper }) => {
    // Only delete databases created by this specific test (using unique prefix)
    await apiHelper.deleteDatabasesByPattern(new RegExp(`^${uniquePrefix}`));
  });

  test.describe('Selection', () => {
    test(`should select single database ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      // Filter to show only our test databases
      await databaseList.search(uniquePrefix);

      await databaseList.selectRow(dbNames.first);

      expect(await databaseList.isRowSelected(dbNames.first)).toBe(true);
      expect(await databaseList.isRowSelected(dbNames.second)).toBe(false);
      await databaseList.expectSelectedCount(1);
    });

    test(`should select multiple databases ${Tags.REGRESSION}`, async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      // Filter to show only our test databases
      await databaseList.search(uniquePrefix);

      await databaseList.selectRow(dbNames.first);
      await databaseList.selectRow(dbNames.second);

      expect(await databaseList.isRowSelected(dbNames.first)).toBe(true);
      expect(await databaseList.isRowSelected(dbNames.second)).toBe(true);
      await databaseList.expectSelectedCount(2);
    });

    test(`should unselect database ${Tags.REGRESSION}`, async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      // Filter to show only our test databases
      await databaseList.search(uniquePrefix);

      await databaseList.selectRow(dbNames.first);
      await databaseList.selectRow(dbNames.second);
      await databaseList.unselectRow(dbNames.first);

      expect(await databaseList.isRowSelected(dbNames.first)).toBe(false);
      expect(await databaseList.isRowSelected(dbNames.second)).toBe(true);
      await databaseList.expectSelectedCount(1);
    });

    test(`should select all databases ${Tags.REGRESSION}`, async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      // Filter to show only our test databases using the unique prefix
      await databaseList.search(uniquePrefix);

      // Wait for the list to show only 3 databases
      await expect(async () => {
        const count = await databaseList.getVisibleRowCount();
        expect(count).toBe(3);
      }).toPass({ timeout: 10000 });

      await databaseList.selectAll();

      expect(await databaseList.isRowSelected(dbNames.first)).toBe(true);
      expect(await databaseList.isRowSelected(dbNames.second)).toBe(true);
      expect(await databaseList.isRowSelected(dbNames.third)).toBe(true);
      await databaseList.expectSelectedCount(3);
    });

    test(`should cancel selection ${Tags.REGRESSION}`, async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      // Filter to show only our test databases
      await databaseList.search(uniquePrefix);

      await databaseList.selectRow(dbNames.first);
      await databaseList.selectRow(dbNames.second);
      await databaseList.cancelSelection();

      expect(await databaseList.isRowSelected(dbNames.first)).toBe(false);
      expect(await databaseList.isRowSelected(dbNames.second)).toBe(false);
      await databaseList.expectSelectedCount(0);
    });
  });

  test.describe('Bulk Delete', () => {
    test(`should delete multiple selected databases ${Tags.CRITICAL}`, async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      // Filter to show only our test databases
      await databaseList.search(uniquePrefix);

      await databaseList.selectRow(dbNames.first);
      await databaseList.selectRow(dbNames.second);
      await databaseList.deleteSelected();

      // Verify databases are removed (clear search first to check full list)
      await databaseList.clearSearch();
      await databaseList.expectDatabaseNotVisible(dbNames.first);
      await databaseList.expectDatabaseNotVisible(dbNames.second);
      await databaseList.expectDatabaseVisible(dbNames.third, { searchFirst: true });
    });

    test(`should show delete confirmation dialog ${Tags.REGRESSION}`, async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      // Filter to show only our test databases
      await databaseList.search(uniquePrefix);

      await databaseList.selectRow(dbNames.first);
      await databaseList.bulkDeleteButton.click();

      // Verify confirmation dialog appears
      const dialog = databasesPage.page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('button', { name: 'Delete' })).toBeVisible();

      // Cancel
      await databasesPage.page.keyboard.press('Escape');
    });
  });

  test.describe('Export', () => {
    test(`should show export button when databases selected ${Tags.REGRESSION}`, async ({ databasesPage }) => {
      const { databaseList } = databasesPage;

      // Filter to show only our test databases
      await databaseList.search(uniquePrefix);

      // Initially export button might not be visible without selection
      await databaseList.selectRow(dbNames.first);

      await expect(databaseList.exportButton).toBeVisible();
    });

    test(`should export selected databases ${Tags.CRITICAL}`, async ({ databasesPage }) => {
      const { databaseList, page } = databasesPage;

      // Filter to show only our test databases
      await databaseList.search(uniquePrefix);

      // Select a database
      await databaseList.selectRow(dbNames.first);

      // Click export button
      await databaseList.exportButton.click();

      // Verify export dialog appears
      const exportDialog = page.getByRole('dialog');
      await expect(exportDialog).toBeVisible();
      await expect(exportDialog.getByText(/will be exported/)).toBeVisible();

      // Verify export passwords checkbox is visible
      const exportPasswordsCheckbox = page.getByRole('checkbox', { name: 'Export passwords' });
      await expect(exportPasswordsCheckbox).toBeVisible();

      // Start download and wait for it
      const downloadPromise = page.waitForEvent('download');
      await page.getByTestId('export-selected-dbs').click();
      const download = await downloadPromise;

      // Verify download started
      expect(download.suggestedFilename()).toContain('RedisInsight');
      expect(download.suggestedFilename()).toContain('.json');
    });
  });
});
