import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneEmptyConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance, Environment } from 'e2eSrc/types';

/**
 * End-to-end: a Workbench batch containing a dangerous command on a
 * Production database opens the type-to-confirm modal mid-batch. The
 * command only runs after the user confirms — verified against the
 * real Redis backend by polling a sentinel key.
 *
 * Uses the dedicated empty-Redis instance (port 8105) and runs serial
 * because the confirm branch issues `FLUSHDB`, which would otherwise wipe
 * keys other tests rely on on the shared standalone Redis.
 */
test.describe('Workbench > Command Execution — environment gating', () => {
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

    test('should require type-to-confirm modal for dangerous workbench batches', async ({
      apiHelper,
      workbenchPage,
      typeToConfirmModal,
    }) => {
      const sentinelKey = `test-wb-batch-${faker.string.alphanumeric(6)}`;
      await apiHelper.createStringKey(database.id, sentinelKey, 'present');

      await workbenchPage.goto(database.id);

      const batch = ['PING', `GET ${sentinelKey}`, 'FLUSHDB'].join('\n');
      await workbenchPage.editor.setCommand(batch);
      await workbenchPage.submitButton.click();

      await typeToConfirmModal.waitForOpen();
      // Workbench description lists the dangerous commands in the batch — only
      // FLUSHDB in this case — and names the target DB.
      await expect(typeToConfirmModal.description).toContainText('FLUSHDB');
      await expect(typeToConfirmModal.description).toContainText(database.name);

      // Cancel — sentinel key must still exist.
      await typeToConfirmModal.cancel();
      expect(Number(await apiHelper.sendCommand(database.id, `EXISTS ${sentinelKey}`))).toBe(1);

      // Re-submit and confirm — FLUSHDB runs.
      await workbenchPage.editor.setCommand(batch);
      await workbenchPage.submitButton.click();
      await typeToConfirmModal.confirm(database.name);

      await expect.poll(async () => Number(await apiHelper.sendCommand(database.id, `EXISTS ${sentinelKey}`))).toBe(0);
    });
  });
});
