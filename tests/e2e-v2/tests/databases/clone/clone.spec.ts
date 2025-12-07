import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig, TEST_DB_PREFIX } from '../../../test-data/databases';

test.describe('Clone Database', () => {
  let uniquePrefix: string;
  let sourceDatabaseName: string;

  test.beforeEach(async ({ databasesPage, apiHelper }) => {
    // Generate unique prefix for this test run
    const uniqueId = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    uniquePrefix = `${TEST_DB_PREFIX}clone-${uniqueId}`;

    // Create a source database to clone
    const sourceConfig = getStandaloneConfig({ name: `${uniquePrefix}-source` });
    sourceDatabaseName = sourceConfig.name;
    await apiHelper.createDatabase(sourceConfig);

    // Navigate to databases page
    await databasesPage.goto();
    // Search for the database to ensure it's visible (handles pagination)
    await databasesPage.databaseList.search(sourceDatabaseName);
    await databasesPage.databaseList.expectDatabaseVisible(sourceDatabaseName);
  });

  test.afterEach(async ({ apiHelper }) => {
    // Clean up all databases created during this test
    await apiHelper.deleteDatabasesByPattern(new RegExp(`^${uniquePrefix}`));
  });

  test(`should open clone dialog with pre-populated values ${Tags.SMOKE}`, async ({
    databasesPage,
  }) => {
    // Open clone dialog for the source database
    await databasesPage.databaseList.openCloneDialog(sourceDatabaseName);

    // Verify the clone dialog is visible
    await expect(databasesPage.cloneDatabaseDialog.dialog).toBeVisible();

    // Verify the form is pre-populated with source database values
    const alias = await databasesPage.cloneDatabaseDialog.getDatabaseAlias();
    const host = await databasesPage.cloneDatabaseDialog.getHost();
    const port = await databasesPage.cloneDatabaseDialog.getPort();
    const timeout = await databasesPage.cloneDatabaseDialog.getTimeout();

    expect(alias).toBe(sourceDatabaseName);
    expect(host).toBe('127.0.0.1');
    expect(port).toBe('6379');
    expect(timeout).toBe('30');
  });

  test(`should clone database with same name ${Tags.SMOKE}`, async ({
    databasesPage,
    apiHelper,
  }) => {
    // Open clone dialog
    await databasesPage.databaseList.openCloneDialog(sourceDatabaseName);

    // Submit the clone form without changing anything
    await databasesPage.cloneDatabaseDialog.submit();

    // Wait for the dialog to close
    await expect(databasesPage.cloneDatabaseDialog.dialog).not.toBeVisible({ timeout: 10000 });

    // Verify there are now two databases with the same name
    const allDatabases = await apiHelper.getDatabases();
    const databases = allDatabases.filter((db) => db.name === sourceDatabaseName);
    expect(databases.length).toBe(2);
  });

  test(`should clone database with new name ${Tags.SMOKE}`, async ({
    databasesPage,
    apiHelper,
  }) => {
    const clonedName = `${uniquePrefix}-cloned`;

    // Open clone dialog
    await databasesPage.databaseList.openCloneDialog(sourceDatabaseName);

    // Change the database alias
    await databasesPage.cloneDatabaseDialog.setDatabaseAlias(clonedName);

    // Submit the clone form
    await databasesPage.cloneDatabaseDialog.submit();

    // Wait for the dialog to close
    await expect(databasesPage.cloneDatabaseDialog.dialog).not.toBeVisible({ timeout: 10000 });

    // Search for the cloned database to make it visible
    await databasesPage.databaseList.search(clonedName);

    // Verify the cloned database exists
    await databasesPage.databaseList.expectDatabaseVisible(clonedName);

    // Verify original database still exists via API
    const allDatabases = await apiHelper.getDatabases();
    const originalExists = allDatabases.some((db) => db.name === sourceDatabaseName);
    expect(originalExists).toBe(true);
  });

  test(`should cancel clone operation ${Tags.REGRESSION}`, async ({ databasesPage, apiHelper }) => {
    // Get initial database count
    const allDatabases = await apiHelper.getDatabases();
    const initialDatabases = allDatabases.filter((db) => db.name.startsWith(uniquePrefix));
    const initialCount = initialDatabases.length;

    // Open clone dialog
    await databasesPage.databaseList.openCloneDialog(sourceDatabaseName);

    // Cancel the clone
    await databasesPage.cloneDatabaseDialog.cancel();

    // Verify the dialog is closed
    await expect(databasesPage.cloneDatabaseDialog.dialog).not.toBeVisible();

    // Verify no new database was created
    const allDatabasesAfter = await apiHelper.getDatabases();
    const finalDatabases = allDatabasesAfter.filter((db) => db.name.startsWith(uniquePrefix));
    expect(finalDatabases.length).toBe(initialCount);
  });

  test(`should go back to edit dialog ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    // Open clone dialog
    await databasesPage.databaseList.openCloneDialog(sourceDatabaseName);

    // Click back button
    await databasesPage.cloneDatabaseDialog.goBack();

    // Verify we're back to the Edit dialog
    await expect(databasesPage.page.getByRole('dialog', { name: /edit database/i })).toBeVisible();
    await expect(databasesPage.cloneDatabaseDialog.dialog).not.toBeVisible();
  });
});

