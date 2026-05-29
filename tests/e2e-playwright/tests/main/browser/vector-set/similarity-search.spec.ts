import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneV8ConfigFactory } from 'e2eSrc/test-data/databases';
import { TEST_KEY_PREFIX, VectorSetKeyFactory } from 'e2eSrc/test-data/browser';
import { DatabaseInstance, VectorSetKeyData } from 'e2eSrc/types';

/**
 * Browser > Vector Set > Similarity search
 *
 * Tests run on a seeded vector set with multiple elements so VSIM has data
 * to rank against. The form supports Vector and Element modes — both are
 * exercised here.
 */
test.use({ featureFlags: { 'dev-vectorSet': true } });

/**
 * Seed a vector set with all elements via repeated VADD. The first VADD
 * creates the key; subsequent ones append.
 */
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

test.describe('Browser > Vector Set > Similarity search', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneV8ConfigFactory.build({ name: 'test-vector-set-similarity' }));
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_KEY_PREFIX}*`);
  });

  test('should run similarity search by vector and show ranked results', async ({ browserPage, apiHelper }) => {
    const keyData = VectorSetKeyFactory.build();
    await seedFullVectorSet(apiHelper, database.id, keyData);
    await browserPage.goto(database.id);

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.vectorSetKeyDetails.waitForLoad();

    // Reuse the first seeded vector to guarantee a near-perfect match
    await browserPage.vectorSetKeyDetails.runSimilaritySearchByVector(keyData.elements[0].vector);

    // At least one result row rendered
    await expect(browserPage.vectorSetKeyDetails.similarityResultRank(0)).toBeVisible();
  });

  test('should run similarity search by element name and rank the queried element first', async ({
    browserPage,
    apiHelper,
  }) => {
    const keyData = VectorSetKeyFactory.build();
    await seedFullVectorSet(apiHelper, database.id, keyData);
    await browserPage.goto(database.id);

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.vectorSetKeyDetails.waitForLoad();

    const queried = keyData.elements[0].name;
    await browserPage.vectorSetKeyDetails.runSimilaritySearchByElement(queried);

    // The queried element is the closest match to itself
    await expect(browserPage.vectorSetKeyDetails.similarityResultCell(0)).toContainText(queried);
  });

  test('should reset the similarity search form', async ({ browserPage, apiHelper }) => {
    const keyData = VectorSetKeyFactory.build();
    await seedFullVectorSet(apiHelper, database.id, keyData);
    await browserPage.goto(database.id);

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.vectorSetKeyDetails.waitForLoad();

    await browserPage.vectorSetKeyDetails.setSimilarityMode('element');
    await browserPage.vectorSetKeyDetails.similarityElementInput.fill(keyData.elements[0].name);
    await browserPage.vectorSetKeyDetails.similarityResetButton.click();

    await expect(browserPage.vectorSetKeyDetails.similarityElementInput).toHaveValue('');
  });

  test('should prefill similarity search by clicking the row "Find similar" button', async ({
    browserPage,
    apiHelper,
  }) => {
    const keyData = VectorSetKeyFactory.build();
    await seedFullVectorSet(apiHelper, database.id, keyData);
    await browserPage.goto(database.id);

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.vectorSetKeyDetails.waitForLoad();

    const target = keyData.elements[1].name;
    await browserPage.vectorSetKeyDetails.searchSimilarByElementButton(target).click();

    await expect(browserPage.vectorSetKeyDetails.similarityElementInput).toHaveValue(target);
  });
});
