import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance, Environment } from 'e2eSrc/types';

/**
 * RI-8190 — Scenario 5: a Workbench batch containing a dangerous command
 * triggers the type-to-confirm modal mid-batch on a Production-classified DB.
 */
test.use({ featureFlags: { 'dev-prodMode': true } });

test.describe('Environment classification — Workbench dangerous batch', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneConfigFactory.build({ environment: Environment.Production }));
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteDatabase(database.id).catch(() => {});
  });

  test('Production DB: batch with a dangerous command opens the type-to-confirm modal', async ({
    apiHelper,
    workbenchPage,
    typeToConfirmModal,
  }) => {
    const sentinelKey = `test-wb-batch-${faker.string.alphanumeric(6)}`;
    await apiHelper.createStringKey(database.id, sentinelKey, 'present');

    await workbenchPage.goto(database.id);

    // Build a batch where the dangerous command is not the first line.
    const batch = ['PING', `GET ${sentinelKey}`, 'FLUSHDB'].join('\n');
    await workbenchPage.editor.setCommand(batch);
    await workbenchPage.submitButton.click();

    await typeToConfirmModal.waitForOpen();
    // Per RI-8201 the Workbench dangerous-command modal shows the production
    // safety copy, keeps the type-to-confirm input, and surfaces the ACL tip.
    await expect(typeToConfirmModal.title).toHaveText(/Proceed with caution in production/i);
    await expect(typeToConfirmModal.input).toBeVisible();
    await expect(typeToConfirmModal.tip).toBeVisible();

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
