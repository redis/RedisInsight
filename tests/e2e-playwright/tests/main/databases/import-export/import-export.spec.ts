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

  test.afterEach(async ({ apiHelper }) => {
    if (importedDbNames.length === 0) return;
    try {
      const allDbs = await apiHelper.getDatabases();
      for (const db of allDbs) {
        if (importedDbNames.includes(db.name)) {
          await apiHelper.deleteDatabase(db.id);
        }
      }
    } catch {
      // Ignore cleanup errors
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
    importedDbNames.push('test-import-partial-ok');

    await databasesPage.openImportDialog();
    await databasesPage.importDatabaseDialog.uploadFile(filePath);
    await databasesPage.importDatabaseDialog.submit();

    await expect(databasesPage.importDatabaseDialog.okButton).toBeVisible({ timeout: 30000 });

    const successCount = await databasesPage.importDatabaseDialog.getSuccessCount();
    const failedCount = await databasesPage.importDatabaseDialog.getFailedCount();

    expect(successCount).toBeGreaterThanOrEqual(1);
    expect(failedCount).toBeGreaterThanOrEqual(1);

    await databasesPage.importDatabaseDialog.close();
  });

  test('should import invalid file format', async ({ databasesPage }) => {
    const filePath = path.join(fixturesDir, 'invalid-format.txt');

    await databasesPage.openImportDialog();
    await databasesPage.importDatabaseDialog.uploadFile(filePath);
    await databasesPage.importDatabaseDialog.submit();

    // Invalid format shows a parse error with a Retry button (not OK)
    await expect(databasesPage.importDatabaseDialog.errorMessage).toBeVisible({ timeout: 30000 });
    await expect(databasesPage.importDatabaseDialog.retryButton).toBeVisible();

    // Close the dialog via the X button
    await databasesPage.importDatabaseDialog.dialog.getByRole('button', { name: 'close' }).click();
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

  test('should export databases', async ({ databasesPage }) => {
    const { databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build({ name: 'test-export-db' });
    importedDbNames.push(config.name);

    // Add via UI so the list updates immediately
    await databasesPage.addDatabase(config);
    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });

    await databaseList.selectRow(config.name);

    // Click the toolbar Export button to open the export popover
    await databaseList.exportSelected();

    // Click the Export button inside the confirmation popover to trigger download
    const exportPopoverButton = databasesPage.page.getByRole('button', { name: 'Export' }).last();
    const [download] = await Promise.all([
      databasesPage.page.waitForEvent('download'),
      exportPopoverButton.click(),
    ]);

    const suggestedName = download.suggestedFilename();
    expect(suggestedName).toMatch(/\.json$/i);
  });
});
