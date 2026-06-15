import { gzipSync } from 'zlib';
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

  test('should decompress GZIP-compressed key values in Browser', async ({ apiHelper, browserPage }) => {
    const originalText = 'Hello, this is decompressed data!';
    const keyName = `decompression-test:${Date.now()}`;
    const compressedBuffer = gzipSync(Buffer.from(originalText));

    // Seed a GZIP-compressed key into the database
    await apiHelper.createStringKey(database.id, keyName, {
      type: 'Buffer',
      data: Array.from(compressedBuffer),
    });

    // Enable GZIP decompression on the database via API
    await apiHelper.updateDatabase(database.id, { compressor: 'GZIP' });

    try {
      // Navigate to Browser and verify decompressed value
      await browserPage.goto(database.id);
      await browserPage.keyList.searchKeys(keyName);
      await browserPage.keyList.clickKey(keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      const displayedValue = await browserPage.keyDetails.getStringValue();
      expect(displayedValue).toContain(originalText);
    } finally {
      // Clean up: remove compressor and delete test key
      await apiHelper.updateDatabase(database.id, { compressor: 'NONE' });
      await apiHelper.deleteKeysByPattern(database.id, keyName);
    }
  });
});
