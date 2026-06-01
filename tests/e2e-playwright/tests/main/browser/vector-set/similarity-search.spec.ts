import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneV8ConfigFactory } from 'e2eSrc/test-data/databases';
import { TEST_KEY_PREFIX, VectorSetKeyFactory } from 'e2eSrc/test-data/browser';
import { DatabaseInstance } from 'e2eSrc/types';
import { seedVectorSet } from './helpers';

/**
 * Browser > Vector Set > Similarity search
 *
 * Tests run on a seeded vector set with multiple elements so VSIM has data
 * to rank against. The form supports Vector and Element modes — both are
 * exercised here.
 */
test.use({ featureFlags: { 'dev-vectorSet': true } });

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
    await seedVectorSet(apiHelper, database.id, keyData.keyName, keyData.elements);
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
    await seedVectorSet(apiHelper, database.id, keyData.keyName, keyData.elements);
    await browserPage.goto(database.id);

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.vectorSetKeyDetails.waitForLoad();

    const queried = keyData.elements[0].name;
    await browserPage.vectorSetKeyDetails.runSimilaritySearchByElement(queried);

    // Invariant: an element compared to itself yields cosine similarity 1,
    // so VSIM by element name MUST rank the queried element at index 0
    // regardless of how the other random vectors land.
    await expect(browserPage.vectorSetKeyDetails.similarityResultCell(0)).toContainText(queried);
  });

  test('should reset the similarity search form', async ({ browserPage, apiHelper }) => {
    const keyData = VectorSetKeyFactory.build();
    await seedVectorSet(apiHelper, database.id, keyData.keyName, keyData.elements);
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
    await seedVectorSet(apiHelper, database.id, keyData.keyName, keyData.elements);
    await browserPage.goto(database.id);

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.vectorSetKeyDetails.waitForLoad();

    const target = keyData.elements[1].name;
    await browserPage.vectorSetKeyDetails.searchSimilarByElementButton(target).click();

    await expect(browserPage.vectorSetKeyDetails.similarityElementInput).toHaveValue(target);
  });
});
