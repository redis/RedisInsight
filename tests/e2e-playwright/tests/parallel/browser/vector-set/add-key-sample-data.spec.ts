import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneV880ConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';

const VEC2WORD_KEY = 'vec2word';

test.describe('Browser > Vector Set > Add Key (sample data)', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(
      StandaloneV880ConfigFactory.build({ name: 'test-vector-set-add-sample' }),
    );
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ browserPage, apiHelper }) => {
    // Sample mode short-circuits with an info toast if vec2word already exists.
    // DEL on a missing key returns 0 — swallow transient errors so they don't
    // mask the real test failure.
    await apiHelper.sendCommand(database.id, `DEL ${VEC2WORD_KEY}`).catch(() => {});
    await browserPage.goto(database.id);
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.sendCommand(database.id, `DEL ${VEC2WORD_KEY}`).catch(() => {});
  });

  test('should show sample dataset preview when switching populate mode to sample', async ({ browserPage }) => {
    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('Vector Set');
    await browserPage.addKeyDialog.selectVectorSetSampleMode();

    await expect(browserPage.addKeyDialog.vectorSetSampleDatasetPreview).toBeVisible();
    await expect(browserPage.addKeyDialog.vectorSetElementNameInput).toBeHidden();
  });

  test('should load the vec2word sample dataset and add it to the key list', async ({ browserPage }) => {
    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('Vector Set');
    await browserPage.addKeyDialog.selectVectorSetSampleMode();

    await browserPage.addKeyDialog.clickAddKey();

    await browserPage.keyList.searchKeys(VEC2WORD_KEY);
    await browserPage.expectKeyInList(VEC2WORD_KEY);
  });
});
