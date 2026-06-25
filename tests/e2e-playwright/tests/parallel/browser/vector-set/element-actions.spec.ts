import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneV880ConfigFactory } from 'e2eSrc/test-data/databases';
import { TEST_KEY_PREFIX, VectorSetKeyFactory } from 'e2eSrc/test-data/browser';
import { DatabaseInstance } from 'e2eSrc/types';
import { seedVectorSet } from './helpers';

test.use({ featureFlags: { vectorSet: true } });

test.describe('Browser > Vector set > Element actions', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(
      StandaloneV880ConfigFactory.build({ name: 'test-vector-set-element-actions' }),
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
    await seedVectorSet(apiHelper, database.id, keyData.keyName, keyData.elements);
    await browserPage.goto(database.id);

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.vectorSetKeyDetails.waitForLoad();

    const target = keyData.elements[0].name;
    await browserPage.vectorSetKeyDetails.openElementDetails(target);

    await expect(browserPage.vectorSetKeyDetails.vectorValue).toBeVisible();
    await expect(browserPage.vectorSetKeyDetails.copyVectorButton).toBeVisible();
  });

  test('should remove an element from the Vector set via the row action', async ({ browserPage, apiHelper }) => {
    const keyData = VectorSetKeyFactory.build();
    await seedVectorSet(apiHelper, database.id, keyData.keyName, keyData.elements);
    await browserPage.goto(database.id);

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.vectorSetKeyDetails.waitForLoad();

    const [first, second] = keyData.elements;
    await expect(browserPage.vectorSetKeyDetails.elementValueCell(first.name)).toBeVisible();

    await browserPage.vectorSetKeyDetails.removeElement(first.name);

    await expect(browserPage.vectorSetKeyDetails.elementValueCell(first.name)).toBeHidden();
    await expect(browserPage.vectorSetKeyDetails.elementValueCell(second.name)).toBeVisible();
  });
});
