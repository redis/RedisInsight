import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneV880ConfigFactory } from 'e2eSrc/test-data/databases';
import { TEST_KEY_PREFIX, VectorSetKeyFactory } from 'e2eSrc/test-data/browser';
import { DatabaseInstance } from 'e2eSrc/types';
import { seedVectorSet } from './helpers';

test.use({ featureFlags: { 'dev-vectorSet': true } });

test.describe('Browser > Vector Set > Similarity search', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(
      StandaloneV880ConfigFactory.build({ name: 'test-vector-set-similarity' }),
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

  test('should run similarity search by vector and show ranked results', async ({ browserPage, apiHelper }) => {
    const keyData = VectorSetKeyFactory.build();
    await seedVectorSet(apiHelper, database.id, keyData.keyName, keyData.elements);
    await browserPage.goto(database.id);

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.vectorSetKeyDetails.waitForLoad();

    await browserPage.vectorSetKeyDetails.runSimilaritySearchByVector(keyData.elements[0].vector);

    await expect(browserPage.vectorSetKeyDetails.similarityResultRank(0)).toBeVisible();
  });

  test('should run similarity search by element name, rank the queried element first, and reset the form', async ({
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

    // Self-match: an element vs. itself has cosine similarity 1 (= 100%),
    // so VSIM by element name must rank the queried element first.
    await expect(browserPage.vectorSetKeyDetails.similarityResultCell(0)).toContainText('100');
    await expect(browserPage.vectorSetKeyDetails.similarityResultElementValue(queried)).toBeVisible();

    // Reset returns the form to Vector mode (see SimilaritySearchForm.utils
    // `initialFormState`), unmounting the element input.
    await browserPage.vectorSetKeyDetails.similarityResetButton.click();
    await expect(browserPage.vectorSetKeyDetails.similarityElementInput).toBeHidden();
    await expect(browserPage.vectorSetKeyDetails.similarityVectorInput).toBeVisible();
    await expect(browserPage.vectorSetKeyDetails.similarityVectorInput).toHaveValue('');
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
