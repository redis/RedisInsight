import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneV880ConfigFactory } from 'e2eSrc/test-data/databases';
import { TEST_KEY_PREFIX, VectorSetKeyFactory } from 'e2eSrc/test-data/browser';
import { DatabaseInstance } from 'e2eSrc/types';

test.use({ featureFlags: { vectorSet: true } });

test.describe('Browser > Vector set > Add Key (manual)', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(
      StandaloneV880ConfigFactory.build({ name: 'test-vector-set-add-manual' }),
    );
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ browserPage }) => {
    await browserPage.goto(database.id);
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_KEY_PREFIX}*`);
  });

  test('should add a Vector set key with a single element manually', async ({ browserPage }) => {
    const keyData = VectorSetKeyFactory.build();
    const [first] = keyData.elements;

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('Vector set');
    await browserPage.addKeyDialog.expectVectorSetManualModeSelected();

    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.fillVectorSetElement(first.name, first.vector);

    await browserPage.addKeyDialog.clickAddKey();

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyInList(keyData.keyName);
  });

  test('should disable Add Key button until both element name and vector are filled', async ({ browserPage }) => {
    const keyData = VectorSetKeyFactory.build();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('Vector set');
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);

    await browserPage.addKeyDialog.vectorSetElementNameInput.fill(keyData.elements[0].name);
    await browserPage.addKeyDialog.expectAddKeyDisabled();

    await browserPage.addKeyDialog.vectorSetElementVectorInput.fill(keyData.elements[0].vector);
    await browserPage.addKeyDialog.expectAddKeyEnabled();
  });

  test('should cancel adding a Vector set key', async ({ browserPage }) => {
    const keyData = VectorSetKeyFactory.build();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('Vector set');
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.clickCancel();

    expect(await browserPage.addKeyDialog.isVisible()).toBe(false);

    // The dialog also disappears on successful submit, so confirm the key
    // wasn't created.
    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyNotInList(keyData.keyName);
  });
});
