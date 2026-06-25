import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance, Environment } from 'e2eSrc/types';

/**
 * End-to-end: Browser write actions go through the production-write
 * confirmation provider on Production databases and bypass it on Development
 * databases (per-connection gating).
 *
 * One representative write action is exercised per environment — modal logic,
 * per-component wiring, and per-action confirmation strings are covered by
 * unit tests.
 */
test.use({ featureFlags: { prodMode: true } });

const uniqueId = () => faker.string.alphanumeric(6);

test.describe('Browser > Key Details — environment gating', () => {
  test.describe('Production DB', () => {
    let database: DatabaseInstance;
    const keys: string[] = [];

    test.beforeAll(async ({ apiHelper }) => {
      database = await apiHelper.createDatabase(StandaloneConfigFactory.build({ environment: Environment.Production }));
    });

    test.afterAll(async ({ apiHelper }) => {
      for (const key of keys) {
        await apiHelper.deleteKeysByPattern(database.id, key).catch(() => {});
      }
      await apiHelper.deleteDatabase(database.id).catch(() => {});
    });

    test('should require type-to-confirm modal when renaming a key', async ({
      apiHelper,
      browserPage,
      typeToConfirmModal,
    }) => {
      const keyName = `test-rename-${uniqueId()}`;
      keys.push(keyName);
      await apiHelper.createStringKey(database.id, keyName, 'original-value');

      await browserPage.goto(database.id);
      await browserPage.keyList.searchKeys(keyName);
      await browserPage.keyList.clickKey(keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      const newName = `${keyName}-renamed`;
      keys.push(newName);

      // Enter rename mode, type the new name, click Apply.
      const renameInput = browserPage.page.getByRole('textbox', { name: 'Enter Key name' });
      await browserPage.keyDetails.keyName.click();
      await renameInput.waitFor({ state: 'visible' });
      await renameInput.fill(newName);
      await browserPage.page.getByRole('button', { name: 'Apply' }).click();

      // Cancel the modal — the key keeps its original name.
      await typeToConfirmModal.cancel();
      await expect(browserPage.keyDetails.keyName).toContainText(keyName);

      // Retry and confirm — the rename goes through.
      await browserPage.keyDetails.keyName.click();
      await renameInput.fill(newName);
      await browserPage.page.getByRole('button', { name: 'Apply' }).click();
      await typeToConfirmModal.confirmWithoutInput();

      await expect(browserPage.keyDetails.keyName).toContainText(newName);
    });
  });

  test.describe('Development DB', () => {
    let database: DatabaseInstance;
    const keys: string[] = [];

    test.beforeAll(async ({ apiHelper }) => {
      database = await apiHelper.createDatabase(
        StandaloneConfigFactory.build({ environment: Environment.Development }),
      );
    });

    test.afterAll(async ({ apiHelper }) => {
      for (const key of keys) {
        await apiHelper.deleteKeysByPattern(database.id, key).catch(() => {});
      }
      await apiHelper.deleteDatabase(database.id).catch(() => {});
    });

    test('should bypass type-to-confirm modal when editing a key', async ({
      apiHelper,
      browserPage,
      typeToConfirmModal,
    }) => {
      const keyName = `test-dev-${uniqueId()}`;
      keys.push(keyName);
      await apiHelper.createStringKey(database.id, keyName, 'dev-value');

      await browserPage.goto(database.id);
      await browserPage.keyList.searchKeys(keyName);
      await browserPage.keyList.clickKey(keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      await browserPage.keyDetails.editStringValue('new-dev-value');

      // Development is per-connection bypass — no modal should appear.
      expect(await typeToConfirmModal.isOpen()).toBe(false);
      await expect(browserPage.keyDetails.stringValue).toHaveText('new-dev-value');
    });
  });
});
