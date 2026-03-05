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

    // Open edit dialog for the database
    await databaseList.edit(database.name);
    const editDialog = databasesPage.page.getByRole('dialog', { name: /edit database/i });
    await expect(editDialog).toBeVisible();

    // Navigate to Decompression & Formatters tab
    await addDatabaseDialog.decompressionTab.click();

    // Enable automatic data decompression
    const isChecked = await addDatabaseDialog.enableDecompressionCheckbox.isChecked();
    if (!isChecked) {
      await addDatabaseDialog.enableDecompressionCheckbox.click();
    }
    await expect(addDatabaseDialog.enableDecompressionCheckbox).toBeChecked();

    // Save the changes
    await addDatabaseDialog.generalTab.click();
    await addDatabaseDialog.submit();
    await editDialog.waitFor({ state: 'hidden' });

    // Reopen edit dialog and verify the setting persisted
    await databaseList.edit(database.name);
    await expect(editDialog).toBeVisible();
    await addDatabaseDialog.decompressionTab.click();
    await expect(addDatabaseDialog.enableDecompressionCheckbox).toBeChecked();

    // Clean up: uncheck and save
    await addDatabaseDialog.enableDecompressionCheckbox.click();
    await addDatabaseDialog.generalTab.click();
    await addDatabaseDialog.submit();
    await editDialog.waitFor({ state: 'hidden' });
  });
});
