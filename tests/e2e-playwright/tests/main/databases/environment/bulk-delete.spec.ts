import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance, Environment } from 'e2eSrc/types';

/**
 * RI-8190 — Scenario 3: bulk delete on a Production DB requires typing the DB
 * name in the type-to-confirm modal.
 */
test.use({ featureFlags: { 'dev-prodMode': true } });

test.describe('Environment classification — Bulk delete', () => {
  let database: DatabaseInstance;
  const keyPrefix = `test-bulk-${faker.string.alphanumeric(6)}:`;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneConfigFactory.build({ environment: Environment.Production }));
    for (let i = 0; i < 5; i++) {
      await apiHelper.createStringKey(database.id, `${keyPrefix}${i}`, `value-${i}`);
    }
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteKeysByPattern(database.id, `${keyPrefix}*`).catch(() => {});
    await apiHelper.deleteDatabase(database.id).catch(() => {});
  });

  test('Production DB: bulk delete requires correct DB name, mistyped keeps button disabled', async ({
    browserPage,
    typeToConfirmModal,
  }) => {
    await browserPage.goto(database.id);
    await browserPage.keyList.searchKeys(`${keyPrefix}*`);

    await browserPage.bulkActionsPanel.open();
    await browserPage.bulkActionsPanel.selectDeleteKeysTab();
    await browserPage.bulkActionsPanel.clickDelete();

    // Mistyped value keeps Confirm disabled.
    await typeToConfirmModal.expectConfirmDisabledWhen('not-the-db-name');

    // Correct DB name enables and completes the bulk delete.
    await typeToConfirmModal.confirm(database.name);
    await browserPage.bulkActionsPanel.waitForDeleteComplete();

    await expect(browserPage.bulkActionsPanel.statusCompleted).toBeVisible();
  });
});
