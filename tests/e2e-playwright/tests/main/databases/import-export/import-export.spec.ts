import * as path from 'path';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';
import {
  generateValidSingle,
  generateValidMultiple,
  generatePartialValid,
  generateWithTags,
} from 'e2eSrc/test-data/databases/import-fixtures/generate';

const fixturesDir = path.resolve(__dirname, '../../../../test-data/databases/import-fixtures');

/**
 * Import/Export Tests (TEST_PLAN.md: 1.5 Import/Export)
 *
 * Tests for importing and exporting database connections.
 */
test.describe('Import / Export Databases', () => {
  const importedDbNames: string[] = [];

  test.beforeEach(async ({ databasesPage }) => {
    await databasesPage.goto();
  });

  test.afterEach(async ({ databasesPage }) => {
    for (const name of importedDbNames) {
      try {
        if (await databasesPage.databaseList.exists(name)) {
          await databasesPage.databaseList.delete(name);
        }
      } catch {
        // Ignore cleanup errors
      }
    }
    importedDbNames.length = 0;
  });

  // ==================== IMPORT ====================

  test('should open import dialog', async ({ databasesPage }) => {
    await databasesPage.openImportDialog();
    await expect(databasesPage.importDatabaseDialog.dialog).toBeVisible();
    await databasesPage.importDatabaseDialog.cancel();
  });

  test('should import single database', async ({ databasesPage }) => {
    const filePath = generateValidSingle();
    importedDbNames.push('test-import-single');

    await databasesPage.openImportDialog();
    await databasesPage.importDatabaseDialog.uploadFile(filePath);
    await databasesPage.importDatabaseDialog.submit();

    await expect(databasesPage.importDatabaseDialog.okButton).toBeVisible({ timeout: 30000 });
    const successCount = await databasesPage.importDatabaseDialog.getSuccessCount();
    expect(successCount).toBeGreaterThanOrEqual(1);

    await databasesPage.importDatabaseDialog.close();
  });

  test('should import multiple databases', async ({ databasesPage }) => {
    const filePath = generateValidMultiple();
    importedDbNames.push('test-import-multi-1', 'test-import-multi-2');

    const result = await databasesPage.importDatabasesFromFile(filePath);
    expect(result.success).toBe(2);
  });

  test('should show success count after import', async ({ databasesPage }) => {
    const filePath = generateValidSingle();
    importedDbNames.push('test-import-single');

    await databasesPage.openImportDialog();
    await databasesPage.importDatabaseDialog.uploadFile(filePath);
    await databasesPage.importDatabaseDialog.submit();

    await expect(databasesPage.importDatabaseDialog.okButton).toBeVisible({ timeout: 30000 });

    await databasesPage.importDatabaseDialog.expandSuccessResults();
    const successCount = await databasesPage.importDatabaseDialog.getSuccessCount();
    expect(successCount).toBeGreaterThanOrEqual(1);

    await databasesPage.importDatabaseDialog.close();
  });

  test('should cancel import dialog', async ({ databasesPage }) => {
    await databasesPage.openImportDialog();
    await expect(databasesPage.importDatabaseDialog.dialog).toBeVisible();

    await databasesPage.importDatabaseDialog.cancel();
    await expect(databasesPage.importDatabaseDialog.dialog).not.toBeVisible();
  });

  test('should import with errors (partial success)', async ({ databasesPage }) => {
    const filePath = generatePartialValid();
    importedDbNames.push('test-import-partial-ok', 'test-import-partial-fail');

    await databasesPage.openImportDialog();
    await databasesPage.importDatabaseDialog.uploadFile(filePath);
    await databasesPage.importDatabaseDialog.submit();

    await expect(databasesPage.importDatabaseDialog.okButton).toBeVisible({ timeout: 30000 });

    const successCount = await databasesPage.importDatabaseDialog.getSuccessCount();
    const failedCount = await databasesPage.importDatabaseDialog.getFailedCount();

    // At least one should succeed and at least one should fail
    expect(successCount).toBeGreaterThanOrEqual(1);
    expect(failedCount).toBeGreaterThanOrEqual(1);

    await databasesPage.importDatabaseDialog.close();
  });

  test('should import invalid file format', async ({ databasesPage }) => {
    const filePath = path.join(fixturesDir, 'invalid-format.txt');

    await databasesPage.openImportDialog();
    await databasesPage.importDatabaseDialog.uploadFile(filePath);
    await databasesPage.importDatabaseDialog.submit();

    await expect(databasesPage.importDatabaseDialog.okButton).toBeVisible({ timeout: 30000 });

    const failedCount = await databasesPage.importDatabaseDialog.getFailedCount();
    expect(failedCount).toBeGreaterThanOrEqual(1);

    await databasesPage.importDatabaseDialog.close();
  });

  test('should confirm database tags are imported correctly', async ({ databasesPage }) => {
    const filePath = generateWithTags();
    importedDbNames.push('test-import-tagged');

    const result = await databasesPage.importDatabasesFromFile(filePath);
    expect(result.success).toBeGreaterThanOrEqual(1);

    // Verify the imported database exists and has tags
    const { databaseList, tagsDialog } = databasesPage;
    await databaseList.expectDatabaseVisible('test-import-tagged', { searchFirst: true });

    await databaseList.openTagsManager('test-import-tagged');
    await tagsDialog.waitForVisible();

    const tagCount = await tagsDialog.getTagCount();
    expect(tagCount).toBe(2);

    await tagsDialog.close();
  });

  // ==================== EXPORT ====================

  test('should export databases', async ({ apiHelper, databasesPage }) => {
    const config = StandaloneConfigFactory.build({ name: 'test-export-db' });
    const db: DatabaseInstance = await apiHelper.createDatabase(config);
    importedDbNames.push(config.name);

    await databasesPage.goto();

    const { databaseList } = databasesPage;
    await databaseList.search(config.name);
    await databaseList.selectRow(config.name);

    const [download] = await Promise.all([
      databasesPage.page.waitForEvent('download'),
      databaseList.exportSelected(),
    ]);

    const suggestedName = download.suggestedFilename();
    expect(suggestedName).toMatch(/\.json$/i);

    await apiHelper.deleteDatabase(db.id);
  });
});
