import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance, Environment } from 'e2eSrc/types';

/**
 * End-to-end: bulk delete on a Production database requires the user to
 * type the database name in the type-to-confirm modal before the
 * destructive action runs against the real Redis backend.
 */
test.use({ featureFlags: { 'dev-prodMode': true } });

test.describe('Browser > Bulk Actions — environment gating', () => {
  test.describe('Production DB', () => {
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

    test('should require typing the database name to bulk-delete', async ({ browserPage, typeToConfirmModal }) => {
      await browserPage.goto(database.id);
      await browserPage.keyList.searchKeys(`${keyPrefix}*`);

      await browserPage.bulkActionsPanel.open();
      await browserPage.bulkActionsPanel.selectDeleteKeysTab();
      await browserPage.bulkActionsPanel.clickDelete();

      // Mistyped value keeps Confirm disabled; only the exact DB name enables it.
      await typeToConfirmModal.expectConfirmDisabledWhen(`${database.name}-wrong`);
      await typeToConfirmModal.confirm(database.name);
      await browserPage.bulkActionsPanel.waitForDeleteComplete();

      await expect(browserPage.bulkActionsPanel.statusCompleted).toBeVisible();
    });
  });
});
