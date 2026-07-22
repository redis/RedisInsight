import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneEmptyConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance, Environment } from 'e2eSrc/types';

/**
 * End-to-end: a dangerous command typed in the CLI panel against a
 * Production database opens the type-to-confirm modal and only executes
 * after the user types the database name and confirms — verified against
 * the real Redis backend by checking a sentinel key before and after.
 *
 * Uses the dedicated empty-Redis instance (port 8105) and runs serial
 * because the confirm branch issues `FLUSHDB`, which would otherwise wipe
 * keys other tests rely on on the shared standalone Redis.
 */
test.describe('CLI Panel — environment gating', () => {
  test.describe('Production DB', () => {
    let database: DatabaseInstance;

    test.beforeAll(async ({ apiHelper }) => {
      database = await apiHelper.createDatabase(
        StandaloneEmptyConfigFactory.build({ environment: Environment.Production }),
      );
    });

    test.afterAll(async ({ apiHelper }) => {
      await apiHelper.deleteDatabase(database.id).catch(() => {});
    });

    test('should require type-to-confirm modal for dangerous CLI commands', async ({
      apiHelper,
      browserPage,
      cliPanel,
      typeToConfirmModal,
    }) => {
      const sentinelKey = `test-cli-flushdb-${faker.string.alphanumeric(6)}`;
      await apiHelper.createStringKey(database.id, sentinelKey, 'present');

      await browserPage.goto(database.id);
      await cliPanel.open();

      // Cancel — sentinel key must still exist.
      await cliPanel.executeCommand('FLUSHDB');
      await typeToConfirmModal.waitForOpen();
      // Modal description lists the command being gated, on the named DB.
      await expect(typeToConfirmModal.description).toContainText('FLUSHDB');
      await expect(typeToConfirmModal.description).toContainText(database.name);
      await typeToConfirmModal.cancel();
      expect(Number(await apiHelper.sendCommand(database.id, `EXISTS ${sentinelKey}`))).toBe(1);

      // Confirm — keyspace is wiped.
      await cliPanel.executeCommand('FLUSHDB');
      await typeToConfirmModal.confirm(database.name);
      await expect(cliPanel.successOutput.last()).toBeVisible();
      expect(Number(await apiHelper.sendCommand(database.id, `EXISTS ${sentinelKey}`))).toBe(0);
    });
  });
});
