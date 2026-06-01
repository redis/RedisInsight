import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneV8ConfigFactory } from 'e2eSrc/test-data/databases';
import { TEST_KEY_PREFIX, VectorSetKeyFactory } from 'e2eSrc/test-data/browser';
import { DatabaseInstance } from 'e2eSrc/types';
import { seedVectorSet } from './helpers';

/**
 * Browser > Vector Set > Add Elements
 *
 * Seeds a vector set via VADD, then exercises the in-panel "Add Elements"
 * form on the key details view.
 */
test.use({ featureFlags: { 'dev-vectorSet': true } });

/**
 * Encode an array of floats as an FP32 little-endian escaped-byte string —
 * the format the element-vector input auto-detects (e.g. `\x00\x00\x80\x3f`
 * for 1.0). Byte length must be a multiple of 4 and the resulting dim
 * (bytes / 4) must match the vector set's existing dimension.
 */
const toFp32EscapedString = (floats: number[]): string => {
  const buf = new ArrayBuffer(floats.length * 4);
  const view = new DataView(buf);
  floats.forEach((v, i) => view.setFloat32(i * 4, v, true));
  const bytes = new Uint8Array(buf);
  return Array.from(bytes, (b) => `\\x${b.toString(16).padStart(2, '0')}`).join('');
};

test.describe('Browser > Vector Set > Add Elements', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(
      StandaloneV8ConfigFactory.build({ name: 'test-vector-set-add-elements' }),
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

  test('should add a new element to an existing Vector Set via the side panel', async ({ browserPage, apiHelper }) => {
    const keyData = VectorSetKeyFactory.build();
    const [first, second] = keyData.elements;

    await seedVectorSet(apiHelper, database.id, keyData.keyName, [keyData.elements[0]]);
    await browserPage.goto(database.id);

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.vectorSetKeyDetails.waitForLoad();

    // First element is already present
    await expect(browserPage.vectorSetKeyDetails.elementValueCell(first.name)).toBeVisible();

    await browserPage.vectorSetKeyDetails.addElement(second.name, second.vector);

    await expect(browserPage.vectorSetKeyDetails.elementValueCell(second.name)).toBeVisible();
  });

  test('should add a new element with an FP32-encoded vector to an existing Vector Set', async ({
    browserPage,
    apiHelper,
  }) => {
    // Factory builds 3-dim vectors; FP32 input must match → 3 floats / 12 bytes.
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

    // The element-vector input auto-detects the FP32 escaped-byte format;
    // no explicit mode toggle is needed.
    await browserPage.vectorSetKeyDetails.addElement(fp32ElementName, fp32Vector);

    await expect(browserPage.vectorSetKeyDetails.elementValueCell(fp32ElementName)).toBeVisible();
  });
});
