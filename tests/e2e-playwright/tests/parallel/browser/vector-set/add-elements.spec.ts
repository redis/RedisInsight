import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneV880ConfigFactory } from 'e2eSrc/test-data/databases';
import { TEST_KEY_PREFIX, VectorSetKeyFactory, toFp32EscapedString } from 'e2eSrc/test-data/browser';
import { DatabaseInstance } from 'e2eSrc/types';
import { seedVectorSet, getRedisMajorVersion, VECTOR_SET_MIN_REDIS_MAJOR, VECTOR_SET_SKIP_REASON } from './helpers';

test.use({ featureFlags: { 'dev-vectorSet': true } });

test.describe('Browser > Vector Set > Add Elements', () => {
  let database: DatabaseInstance;
  let redisMajorVersion: number;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(
      StandaloneV880ConfigFactory.build({ name: 'test-vector-set-add-elements' }),
    );
    redisMajorVersion = await getRedisMajorVersion(apiHelper, database.id);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(() => {
    test.skip(redisMajorVersion < VECTOR_SET_MIN_REDIS_MAJOR, VECTOR_SET_SKIP_REASON);
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_KEY_PREFIX}*`);
  });

  test('should add a new element to an existing Vector Set via the side panel', async ({ browserPage, apiHelper }) => {
    const keyData = VectorSetKeyFactory.build();
    const [first, second] = keyData.elements;

    await seedVectorSet(apiHelper, database.id, keyData.keyName, [keyData.elements[0]]);
    await browserPage.goto(database.id);

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.vectorSetKeyDetails.waitForLoad();

    await expect(browserPage.vectorSetKeyDetails.elementValueCell(first.name)).toBeVisible();

    await browserPage.vectorSetKeyDetails.addElement(second.name, second.vector);

    await expect(browserPage.vectorSetKeyDetails.elementValueCell(second.name)).toBeVisible();
  });

  test('should add a new element with an FP32-encoded vector to an existing Vector Set', async ({
    browserPage,
    apiHelper,
  }) => {
    // FP32 vector must match the factory's 3-dim shape (3 floats / 12 bytes).
    const keyData = VectorSetKeyFactory.build();
    const [first] = keyData.elements;
    const fp32ElementName = `element-fp32-${faker.string.alphanumeric(6)}`;
    const fp32Vector = toFp32EscapedString([0.25, -0.5, 0.75]);

    await seedVectorSet(apiHelper, database.id, keyData.keyName, [keyData.elements[0]]);
    await browserPage.goto(database.id);

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.vectorSetKeyDetails.waitForLoad();

    await expect(browserPage.vectorSetKeyDetails.elementValueCell(first.name)).toBeVisible();

    await browserPage.vectorSetKeyDetails.addElement(fp32ElementName, fp32Vector);

    await expect(browserPage.vectorSetKeyDetails.elementValueCell(fp32ElementName)).toBeVisible();
  });
});
