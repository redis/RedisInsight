import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { faker } from '@faker-js/faker';
import { TEST_DB_PREFIX } from '../../../test-data/databases';

// Run tests serially to avoid parallel test interference with shared database state
test.describe.serial('Database Import', () => {
  let tempDir: string;
  let testFilePath: string;
  // Use unique names per test run to avoid parallel test interference
  let uniquePrefix: string;

  test.beforeAll(async () => {
    // Create temp directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-import-'));
    // Generate unique prefix for this test run
    const uniqueId = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    uniquePrefix = `${TEST_DB_PREFIX}imp-${uniqueId}`;
  });

  test.afterAll(async ({ apiHelper }) => {
    // Cleanup temp directory
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    // Only delete databases created by this specific test (using unique prefix)
    await apiHelper.deleteDatabasesByPattern(new RegExp(`^${uniquePrefix}`));
  });

  test.beforeEach(async ({ databasesPage }) => {
    await databasesPage.goto();
  });

  /**
   * Helper to create a test import file
   */
  function createImportFile(databases: object[]): string {
    const filePath = path.join(tempDir, `import-${faker.string.alphanumeric(8)}.json`);
    fs.writeFileSync(filePath, JSON.stringify(databases, null, 2));
    return filePath;
  }

  test(`should open import dialog ${Tags.SMOKE}`, async ({ databasesPage }) => {
    await databasesPage.openImportDialog();

    await expect(databasesPage.importDatabaseDialog.dialog).toBeVisible();
    await expect(databasesPage.importDatabaseDialog.filePicker).toBeVisible();
  });

  test(`should import single database from file ${Tags.CRITICAL}`, async ({ databasesPage }) => {
    const dbName = `${uniquePrefix}-single`;
    testFilePath = createImportFile([
      {
        name: dbName,
        host: '127.0.0.1',
        port: 6379,
        connectionType: 'STANDALONE',
      },
    ]);

    const result = await databasesPage.importDatabasesFromFile(testFilePath);

    expect(result.success).toBe(1);
    expect(result.failed).toBe(0);
    await databasesPage.databaseList.expectDatabaseVisible(dbName);
  });

  test(`should import multiple databases from file ${Tags.CRITICAL}`, async ({ databasesPage }) => {
    const dbNames = [
      `${uniquePrefix}-multi-1`,
      `${uniquePrefix}-multi-2`,
      `${uniquePrefix}-multi-3`,
    ];
    testFilePath = createImportFile(
      dbNames.map((name) => ({
        name,
        host: '127.0.0.1',
        port: 6379,
        connectionType: 'STANDALONE',
      })),
    );

    const result = await databasesPage.importDatabasesFromFile(testFilePath);

    expect(result.success).toBe(3);
    expect(result.failed).toBe(0);

    for (const dbName of dbNames) {
      await databasesPage.databaseList.expectDatabaseVisible(dbName);
    }
  });

  test(`should show success count after import ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const dbName = `${uniquePrefix}-count`;
    testFilePath = createImportFile([
      {
        name: dbName,
        host: '127.0.0.1',
        port: 6379,
        connectionType: 'STANDALONE',
      },
    ]);

    await databasesPage.openImportDialog();
    await databasesPage.importDatabaseDialog.uploadFile(testFilePath);
    await databasesPage.importDatabaseDialog.submit();

    // Wait for results to appear (OK button indicates import is complete)
    await expect(databasesPage.importDatabaseDialog.okButton).toBeVisible({ timeout: 30000 });

    // Check success count in dialog
    const successCount = await databasesPage.importDatabaseDialog.getSuccessCount();
    expect(successCount).toBe(1);

    await databasesPage.importDatabaseDialog.close();
  });

  test(`should cancel import dialog ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    await databasesPage.openImportDialog();
    await databasesPage.importDatabaseDialog.cancel();

    await expect(databasesPage.importDatabaseDialog.dialog).not.toBeVisible();
  });

  test(`should go back from import dialog ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    await databasesPage.openImportDialog();
    await databasesPage.importDatabaseDialog.goBack();

    // Should be back at the main add database dialog
    await expect(databasesPage.addDatabaseDialog.connectionSettingsButton).toBeVisible();
  });
});
