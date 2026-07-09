import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory, StandaloneEmptyConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';
import { faker } from '@faker-js/faker';

/**
 * Databases > Edit > Host field
 *
 * Guards the host-editability rules end-to-end:
 * - Non-managed databases expose an editable host field in edit mode.
 * - Cloud-managed databases (carrying cloudDetails) keep the endpoint
 *   read-only: the host field is hidden and shown only as read-only info.
 *
 * The backend guard that rejects endpoint changes for managed databases is
 * covered by the API integration tests (PATCH /databases/:id); here we verify
 * the user-facing form wiring that the unit tests cannot exercise full-stack.
 */
test.describe('Databases > Edit > Host field', () => {
  let standaloneDb: DatabaseInstance;
  let managedDb: DatabaseInstance | undefined;

  test.beforeAll(async ({ apiHelper }) => {
    standaloneDb = await apiHelper.createDatabase(StandaloneConfigFactory.build());

    // A managed database is a real (reachable) database that additionally
    // carries cloudDetails. Use the isolated "empty" instance to avoid the
    // cloud uniqueness check colliding with other tests' databases on the
    // primary standalone endpoint.
    try {
      const managedConfig = StandaloneEmptyConfigFactory.build({
        name: `test-managed-${faker.string.alphanumeric(8)}`,
        cloudDetails: { cloudId: faker.number.int({ min: 100000, max: 999999 }), subscriptionType: 'fixed' },
      });
      managedDb = await apiHelper.createDatabase(managedConfig);
    } catch {
      // Managed fixture unavailable in this environment - the managed test is skipped
    }
  });

  test.afterAll(async ({ apiHelper }) => {
    for (const db of [standaloneDb, managedDb]) {
      if (db?.id) {
        await apiHelper.deleteDatabase(db.id).catch(() => {});
      }
    }
  });

  test.beforeEach(async ({ databasesPage }) => {
    await databasesPage.goto();
  });

  test('should expose an editable host field when editing a non-managed database', async ({ databasesPage }) => {
    const { databaseList, addDatabaseDialog } = databasesPage;

    await databaseList.expectDatabaseVisible(standaloneDb.name, { searchFirst: true });
    await databaseList.edit(standaloneDb.name);

    await expect(addDatabaseDialog.dialog).toBeVisible();
    await expect(addDatabaseDialog.hostInput).toBeVisible();
    await expect(addDatabaseDialog.hostInput).toHaveValue(standaloneDb.host);
    await expect(addDatabaseDialog.hostInput).toBeEditable();
  });

  test('should keep the host field read-only when editing a cloud-managed database', async ({ databasesPage }) => {
    test.skip(!managedDb, 'Managed database fixture unavailable in this environment');

    const { databaseList, addDatabaseDialog } = databasesPage;

    await databaseList.expectDatabaseVisible(managedDb!.name, { searchFirst: true });
    await databaseList.edit(managedDb!.name);

    await expect(addDatabaseDialog.dialog).toBeVisible();
    // Endpoint is not editable for managed databases: the host input is absent,
    // and the endpoint is surfaced as read-only info instead.
    await expect(addDatabaseDialog.hostInput).toHaveCount(0);
    await expect(addDatabaseDialog.dbInfoHost).toBeVisible();
  });
});
