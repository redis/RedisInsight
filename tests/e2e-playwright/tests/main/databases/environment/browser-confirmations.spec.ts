import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance, Environment } from 'e2eSrc/types';

/**
 * RI-8190 — E2E coverage for prod vs non-prod modes.
 *
 * Browser write confirmations:
 *  - Scenario 2: dangerous writes on a Production-classified DB open the
 *    type-to-confirm modal. Per RI-8201, the Browser variant of the modal
 *    no longer requires typing the DB name — the user just confirms.
 *  - Scenario 8 (per-connection Development): writes on a Development DB skip
 *    the modal, proving the gating is per-connection, not a global setting.
 */
test.use({ featureFlags: { 'dev-prodMode': true } });

const uniqueId = () => faker.string.alphanumeric(6);

test.describe('Environment classification — Browser confirmations', () => {
  let productionDb: DatabaseInstance;
  let developmentDb: DatabaseInstance;
  const productionKeys: string[] = [];
  const developmentKeys: string[] = [];

  test.beforeAll(async ({ apiHelper }) => {
    productionDb = await apiHelper.createDatabase(
      StandaloneConfigFactory.build({ environment: Environment.Production }),
    );
    developmentDb = await apiHelper.createDatabase(
      StandaloneConfigFactory.build({ environment: Environment.Development }),
    );
  });

  test.afterAll(async ({ apiHelper }) => {
    for (const key of productionKeys) {
      await apiHelper.deleteKeysByPattern(productionDb.id, key).catch(() => {});
    }
    for (const key of developmentKeys) {
      await apiHelper.deleteKeysByPattern(developmentDb.id, key).catch(() => {});
    }
    await apiHelper.deleteDatabase(productionDb.id).catch(() => {});
    await apiHelper.deleteDatabase(developmentDb.id).catch(() => {});
  });

  test('Production DB: rename key opens modal — cancel reverts, confirm renames (no typing required)', async ({
    apiHelper,
    browserPage,
    typeToConfirmModal,
  }) => {
    const keyName = `test-rename-${uniqueId()}`;
    productionKeys.push(keyName);
    await apiHelper.createStringKey(productionDb.id, keyName, 'original-value');

    await browserPage.goto(productionDb.id);
    await browserPage.keyList.searchKeys(keyName);
    await browserPage.keyList.clickKey(keyName);
    await browserPage.keyDetails.waitForKeyDetails();

    const newName = `${keyName}-renamed`;
    productionKeys.push(newName);

    // Click on the key name to enter rename mode, type, and click Apply.
    await browserPage.keyDetails.keyName.click();
    const renameInput = browserPage.page.getByRole('textbox', { name: 'Enter Key Name' });
    await renameInput.waitFor({ state: 'visible' });
    await renameInput.fill(newName);
    await browserPage.page.getByRole('button', { name: 'Apply' }).click();

    // Cancel the first time — key should remain.
    await typeToConfirmModal.cancel();
    await expect(browserPage.keyDetails.keyName).toContainText(keyName);

    // Retry, confirm. Browser variant skips the typing step (RI-8201).
    await browserPage.keyDetails.keyName.click();
    await renameInput.fill(newName);
    await browserPage.page.getByRole('button', { name: 'Apply' }).click();
    await typeToConfirmModal.confirmWithoutInput();

    await expect(browserPage.keyDetails.keyName).toContainText(newName);
  });

  test('Production DB: edit TTL opens modal with no typing required', async ({
    apiHelper,
    browserPage,
    typeToConfirmModal,
  }) => {
    const keyName = `test-ttl-${uniqueId()}`;
    productionKeys.push(keyName);
    await apiHelper.createStringKey(productionDb.id, keyName, 'value');

    await browserPage.goto(productionDb.id);
    await browserPage.keyList.searchKeys(keyName);
    await browserPage.keyList.clickKey(keyName);
    await browserPage.keyDetails.waitForKeyDetails();

    await browserPage.keyDetails.ttlValue.click();
    const ttlInput = browserPage.page.getByRole('textbox', { name: /no limit/i });
    await ttlInput.fill('600');
    await browserPage.keyDetails.ttlApplyButton.click();

    // Per RI-8201, Browser variant of the modal has no type-to-confirm input.
    await typeToConfirmModal.confirmWithoutInput();

    await expect(browserPage.keyDetails.ttlValue).toContainText(/^TTL:\s*\d/);
  });

  test('Production DB: add hash field opens modal with no typing required', async ({
    apiHelper,
    browserPage,
    typeToConfirmModal,
  }) => {
    const keyName = `test-hash-${uniqueId()}`;
    productionKeys.push(keyName);
    await apiHelper.createHashKey(productionDb.id, keyName, [{ field: 'seed', value: 'seed-value' }]);

    await browserPage.goto(productionDb.id);
    await browserPage.keyList.searchKeys(keyName);
    await browserPage.keyList.clickKey(keyName);
    await browserPage.keyDetails.waitForKeyDetails();

    const newField = `field-${uniqueId()}`;
    await browserPage.page.getByRole('button', { name: 'Add Fields' }).click();
    await browserPage.page.getByPlaceholder('Enter Field').fill(newField);
    await browserPage.page.getByPlaceholder('Enter Value').fill('new-value');
    await browserPage.page.getByRole('button', { name: 'Save' }).click();

    await typeToConfirmModal.confirmWithoutInput();

    await expect(browserPage.page.getByRole('gridcell', { name: newField })).toBeVisible();
  });

  test('Development DB: in-Browser writes are NOT gated by the modal', async ({
    apiHelper,
    browserPage,
    typeToConfirmModal,
  }) => {
    const keyName = `test-dev-${uniqueId()}`;
    developmentKeys.push(keyName);
    await apiHelper.createStringKey(developmentDb.id, keyName, 'dev-value');

    await browserPage.goto(developmentDb.id);
    await browserPage.keyList.searchKeys(keyName);
    await browserPage.keyList.clickKey(keyName);
    await browserPage.keyDetails.waitForKeyDetails();

    await browserPage.keyDetails.editStringValue('new-dev-value');

    // No modal must appear — Development is per-connection bypass.
    expect(await typeToConfirmModal.isOpen()).toBe(false);
    await expect(browserPage.keyDetails.stringValue).toHaveText('new-dev-value');
  });
});
