import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance, Environment } from 'e2eSrc/types';

/**
 * RI-8190 — Scenario 4: dangerous CLI commands (e.g. FLUSHDB) on a Production
 * DB trigger the type-to-confirm modal. Cancelling does nothing; confirming
 * runs the command.
 */
test.use({ featureFlags: { 'dev-prodMode': true } });

test.describe('Environment classification — CLI dangerous commands', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(
      StandaloneConfigFactory.build({ environment: Environment.Production }),
    );
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteDatabase(database.id).catch(() => {});
  });

  test('Production DB: FLUSHDB shows modal — cancel leaves keys, confirm runs the command', async ({
    apiHelper,
    browserPage,
    cliPanel,
    typeToConfirmModal,
  }) => {
    const sentinelKey = `test-cli-flushdb-${faker.string.alphanumeric(6)}`;
    await apiHelper.createStringKey(database.id, sentinelKey, 'present');

    await browserPage.goto(database.id);
    await cliPanel.open();

    // Cancel first attempt — sentinel key must still exist.
    await cliPanel.executeCommand('FLUSHDB');
    await typeToConfirmModal.waitForOpen();
    // Per RI-8201 the CLI/Workbench variant keeps the input AND shows
    // a "Proceed with caution in production" title plus the ACL tip.
    await expect(typeToConfirmModal.title).toHaveText(/Proceed with caution in production/i);
    await expect(typeToConfirmModal.input).toBeVisible();
    await expect(typeToConfirmModal.tip).toBeVisible();
    await typeToConfirmModal.cancel();
    expect(Number(await apiHelper.sendCommand(database.id, `EXISTS ${sentinelKey}`))).toBe(1);

    // Confirm second attempt — keyspace is wiped.
    await cliPanel.executeCommand('FLUSHDB');
    await typeToConfirmModal.confirm(database.name);
    await expect(cliPanel.successOutput.last()).toBeVisible();
    expect(Number(await apiHelper.sendCommand(database.id, `EXISTS ${sentinelKey}`))).toBe(0);
  });
});
