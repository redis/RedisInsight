import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneV8ConfigFactory } from 'e2eSrc/test-data/databases';
import { TEST_KEY_PREFIX, VectorSetKeyFactory } from 'e2eSrc/test-data/browser';
import { DatabaseInstance, VectorSetKeyData } from 'e2eSrc/types';

/**
 * Browser > Vector Set > Element actions
 *
 * Per-row actions on the elements table: view (opens drawer with the vector
 * value + copy button), and remove (popover-confirmed deletion).
 */
test.use({ featureFlags: { 'dev-vectorSet': true } });

const seedFullVectorSet = async (
  apiHelper: { sendCommand(databaseId: string, command: string): Promise<unknown> },
  databaseId: string,
  keyData: VectorSetKeyData,
): Promise<void> => {
  for (const element of keyData.elements) {
    const components = element.vector.split(',').map((v) => v.trim());
    const cmd = `VADD ${keyData.keyName} VALUES ${components.length} ${components.join(' ')} ${element.name}`;
    await apiHelper.sendCommand(databaseId, cmd);
  }
};

test.describe('Browser > Vector Set > Element actions', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(
      StandaloneV8ConfigFactory.build({ name: 'test-vector-set-element-actions' }),
    );
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_KEY_PREFIX}*`);
  });

  test('should open element details drawer and show the vector value', async ({ browserPage, apiHelper }) => {
    const keyData = VectorSetKeyFactory.build();
    await seedFullVectorSet(apiHelper, database.id, keyData);
    await browserPage.goto(database.id);

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.vectorSetKeyDetails.waitForLoad();

    const target = keyData.elements[0].name;
    await browserPage.vectorSetKeyDetails.openElementDetails(target);

    await expect(browserPage.vectorSetKeyDetails.vectorValue).toBeVisible();
    // Copy vector button is shown for non-truncated vectors (the test data is short)
    await expect(browserPage.vectorSetKeyDetails.copyVectorButton).toBeVisible();
  });

  test('should remove an element from the Vector Set via the row action', async ({ browserPage, apiHelper }) => {
    const keyData = VectorSetKeyFactory.build();
    await seedFullVectorSet(apiHelper, database.id, keyData);
    await browserPage.goto(database.id);

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.vectorSetKeyDetails.waitForLoad();

    const [first, second] = keyData.elements;
    await expect(browserPage.vectorSetKeyDetails.elementValueCell(first.name)).toBeVisible();

    await browserPage.vectorSetKeyDetails.removeElement(first.name);

    // First element gone, second element still listed
    await expect(browserPage.vectorSetKeyDetails.elementValueCell(first.name)).toBeHidden();
    await expect(browserPage.vectorSetKeyDetails.elementValueCell(second.name)).toBeVisible();
  });
});
