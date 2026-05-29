import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneV8ConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';

/**
 * Browser > Vector Set > Add Key (sample data)
 *
 * Covers the "Load sample dataset" populate mode — the bundled `vec2word`
 * embeddings. Switching to sample mode locks the key name to `vec2word` and
 * swaps the form for a static preview of the bundled rows.
 *
 * Cleanup deletes the fixed key by name (rather than the test prefix) since
 * the sample dataset uses a non-prefixed key.
 */
const VEC2WORD_KEY = 'vec2word';

test.use({ featureFlags: { 'dev-vectorSet': true } });

test.describe('Browser > Vector Set > Add Key (sample data)', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneV8ConfigFactory.build({ name: 'test-vector-set-add-sample' }));
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ browserPage, apiHelper }) => {
    // Ensure no pre-existing vec2word key — sample-mode short-circuits with an
    // info toast if the key already exists.
    await apiHelper.sendCommand(database.id, `DEL ${VEC2WORD_KEY}`).catch(() => {});
    await browserPage.goto(database.id);
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.sendCommand(database.id, `DEL ${VEC2WORD_KEY}`).catch(() => {});
  });

  test('should show sample dataset preview when switching populate mode to sample', async ({ browserPage }) => {
    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('Vector Set');
    await browserPage.addKeyDialog.selectVectorSetPopulateMode('sample');

    await expect(browserPage.addKeyDialog.vectorSetSampleDatasetPreview).toBeVisible();
    // Manual-mode element fields disappear in sample mode
    await expect(browserPage.addKeyDialog.vectorSetElementNameInput).toBeHidden();
  });

  test('should load the vec2word sample dataset and add it to the key list', async ({ browserPage }) => {
    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('Vector Set');
    await browserPage.addKeyDialog.selectVectorSetPopulateMode('sample');

    await browserPage.addKeyDialog.clickAddKey();

    await browserPage.keyList.searchKeys(VEC2WORD_KEY);
    await browserPage.expectKeyInList(VEC2WORD_KEY);
  });
});
