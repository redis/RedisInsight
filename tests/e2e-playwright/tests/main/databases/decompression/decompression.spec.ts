import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';

/**
 * Decompression Tests (TEST_PLAN.md: 1.8 Decompression)
 *
 * Tests for configuring automatic data decompression on database connections.
 */
test.describe('Decompression', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    const config = StandaloneConfigFactory.build();
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ databasesPage }) => {
    await databasesPage.goto();
  });

  test('should confirm setting a decompression type works', async ({ databasesPage }) => {
    const { databaseList, addDatabaseDialog } = databasesPage;
    const compressorFormat = 'GZIP';

    // Open edit dialog for the database
    await databaseList.search(database.name);
    await databaseList.edit(database.name);
    const editDialog = databasesPage.page.getByRole('dialog', { name: /edit database/i });
    await expect(editDialog).toBeVisible();

    // Enable decompression with GZIP format
    await addDatabaseDialog.enableDecompression(compressorFormat);
    await expect(addDatabaseDialog.enableDecompressionCheckbox).toBeChecked();

    // Save the changes
    await addDatabaseDialog.generalTab.click();
    await addDatabaseDialog.submit();
    await editDialog.waitFor({ state: 'hidden' });

    // Reopen edit dialog and verify the setting persisted
    await databaseList.search(database.name);
    await databaseList.edit(database.name);
    await expect(editDialog).toBeVisible();
    await addDatabaseDialog.decompressionTab.click();
    await expect(addDatabaseDialog.enableDecompressionCheckbox).toBeChecked();
    await expect(addDatabaseDialog.compressorDropdown).toContainText(compressorFormat);

    // Clean up: disable decompression and save
    await addDatabaseDialog.enableDecompressionCheckbox.click();
    await addDatabaseDialog.generalTab.click();
    await addDatabaseDialog.submit();
    await editDialog.waitFor({ state: 'hidden' });
  });
});
