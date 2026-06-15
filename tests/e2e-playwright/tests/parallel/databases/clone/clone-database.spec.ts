import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory, ClusterConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';
import { faker } from '@faker-js/faker';

/**
 * Clone Database Tests (TEST_PLAN.md: 1.3 Clone Database)
 *
 * Tests for cloning database connections via the Edit -> Clone flow.
 */
test.describe('Clone Database', () => {
  let standaloneDb: DatabaseInstance;
  let clusterDb: DatabaseInstance | undefined;

  const clonedNames: string[] = [];

  test.beforeAll(async ({ apiHelper }) => {
    const standaloneConfig = StandaloneConfigFactory.build();
    standaloneDb = await apiHelper.createDatabase(standaloneConfig);

    try {
      const clusterConfig = ClusterConfigFactory.build();
      clusterDb = await apiHelper.createDatabase(clusterConfig);
    } catch {
      // Cluster may not be available in all environments
    }
  });

  test.afterAll(async ({ apiHelper }) => {
    if (standaloneDb?.id) {
      await apiHelper.deleteDatabase(standaloneDb.id);
    }
    if (clusterDb?.id) {
      await apiHelper.deleteDatabase(clusterDb.id);
    }
  });

  test.beforeEach(async ({ databasesPage }) => {
    await databasesPage.goto();
  });

  test.afterEach(async ({ apiHelper }) => {
    if (clonedNames.length === 0) return;

    const knownIds = new Set([standaloneDb?.id, clusterDb?.id].filter(Boolean));

    try {
      const allDbs = await apiHelper.getDatabases();
      for (const db of allDbs) {
        if (clonedNames.includes(db.name) && !knownIds.has(db.id)) {
          await apiHelper.deleteDatabase(db.id);
        }
      }
    } catch {
      // Ignore cleanup errors
    }

    clonedNames.length = 0;
  });

  test('should clone standalone database with pre-populated form', async ({ databasesPage }) => {
    const { databaseList, cloneDatabaseDialog } = databasesPage;

    await databaseList.openCloneDialog(standaloneDb.name);

    const alias = await cloneDatabaseDialog.getDatabaseAlias();
    const host = await cloneDatabaseDialog.getHost();
    const port = await cloneDatabaseDialog.getPort();

    expect(alias).toBe(standaloneDb.name);
    expect(host).toBe(standaloneDb.host);
    expect(port).toBe(standaloneDb.port.toString());

    await cloneDatabaseDialog.cancel();
  });

  test('should clone database with same name', async ({ databasesPage }) => {
    const { databaseList, cloneDatabaseDialog } = databasesPage;

    await databaseList.openCloneDialog(standaloneDb.name);
    clonedNames.push(standaloneDb.name);

    await cloneDatabaseDialog.submit();
    await cloneDatabaseDialog.dialog.waitFor({ state: 'hidden' });

    await databaseList.expectDatabaseVisible(standaloneDb.name, { searchFirst: true });
  });

  test('should clone database with new name', async ({ databasesPage }) => {
    const { databaseList, cloneDatabaseDialog } = databasesPage;
    const newName = `test-cloned-${faker.string.alphanumeric(8)}`;
    clonedNames.push(newName);

    await databaseList.openCloneDialog(standaloneDb.name);
    await cloneDatabaseDialog.setDatabaseAlias(newName);
    await cloneDatabaseDialog.submit();
    await cloneDatabaseDialog.dialog.waitFor({ state: 'hidden' });

    await databaseList.expectDatabaseVisible(newName, { searchFirst: true });
  });

  test('should cancel clone operation', async ({ databasesPage }) => {
    const { databaseList, cloneDatabaseDialog } = databasesPage;
    const newName = `test-cancel-clone-${faker.string.alphanumeric(8)}`;

    await databaseList.openCloneDialog(standaloneDb.name);
    await cloneDatabaseDialog.setDatabaseAlias(newName);
    await cloneDatabaseDialog.cancel();

    await expect(cloneDatabaseDialog.dialog).not.toBeVisible();
    await databaseList.expectDatabaseNotVisible(newName);
  });

  test('should go back to edit dialog from clone dialog', async ({ databasesPage }) => {
    const { databaseList, cloneDatabaseDialog } = databasesPage;

    await databaseList.openCloneDialog(standaloneDb.name);
    await expect(cloneDatabaseDialog.dialog).toBeVisible();

    await cloneDatabaseDialog.goBack();

    const editDialog = databasesPage.page.getByRole('dialog', { name: /edit database/i });
    await expect(editDialog).toBeVisible();

    await databasesPage.page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('should clone OSS Cluster database', async ({ databasesPage }) => {
    test.skip(!clusterDb, 'OSS Cluster not available in this environment');

    const { databaseList, cloneDatabaseDialog } = databasesPage;
    const clonedName = `test-clone-cluster-${faker.string.alphanumeric(8)}`;
    clonedNames.push(clonedName);

    await databaseList.openCloneDialog(clusterDb!.name);

    const host = await cloneDatabaseDialog.getHost();
    const port = await cloneDatabaseDialog.getPort();
    expect(host).toBe(clusterDb!.host);
    expect(port).toBe(clusterDb!.port.toString());

    await cloneDatabaseDialog.setDatabaseAlias(clonedName);
    await cloneDatabaseDialog.submit();
    await cloneDatabaseDialog.dialog.waitFor({ state: 'hidden' });

    await databaseList.expectDatabaseVisible(clonedName, { searchFirst: true });
  });

  test('should verify cloned database appears in list after creation', async ({ databasesPage }) => {
    const { databaseList, cloneDatabaseDialog } = databasesPage;
    const clonedName = `test-verify-clone-${faker.string.alphanumeric(8)}`;
    clonedNames.push(clonedName);

    await databaseList.openCloneDialog(standaloneDb.name);
    await cloneDatabaseDialog.setDatabaseAlias(clonedName);
    await cloneDatabaseDialog.submit();
    await cloneDatabaseDialog.dialog.waitFor({ state: 'hidden' });

    await databaseList.clearSearch();
    await databaseList.search(clonedName);
    const row = databaseList.getRow(clonedName);
    await expect(row).toBeVisible();
  });

  test('should verify "New Connection" badge on cloned database', async ({ databasesPage }) => {
    const { databaseList, cloneDatabaseDialog } = databasesPage;
    const clonedName = `test-badge-clone-${faker.string.alphanumeric(8)}`;
    clonedNames.push(clonedName);

    await databaseList.openCloneDialog(standaloneDb.name);
    await cloneDatabaseDialog.setDatabaseAlias(clonedName);
    await cloneDatabaseDialog.submit();
    await cloneDatabaseDialog.dialog.waitFor({ state: 'hidden' });

    await databaseList.expectDatabaseVisible(clonedName, { searchFirst: true });

    const row = databaseList.getRow(clonedName);
    const newIndicator = row.getByTestId(/database-status-new-/);
    await expect(newIndicator).toBeVisible();
  });
});
