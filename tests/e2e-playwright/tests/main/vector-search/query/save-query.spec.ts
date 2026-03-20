import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { IndexConfigFactory, IndexHashKeyFactory } from 'e2eSrc/test-data/vector-search';
import { DatabaseInstance } from 'e2eSrc/types';

const uniqueId = faker.string.alphanumeric(6);
const TEST_INDEX_PREFIX = `test-vs-save-${uniqueId}:`;
const TEST_INDEX_NAME = `test-vs-save-${uniqueId}-idx`;

test.use({ featureFlags: { vectorSearchV2: true } });

/**
 * Vector Search > Save Query
 *
 * Tests for saving queries from the query editor
 * and cancelling the save modal.
 */
test.describe('Vector Search > Save Query', { tag: '@serial' }, () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneConfigFactory.build());

    const hashKey = IndexHashKeyFactory.build({ keyName: `${TEST_INDEX_PREFIX}key1` });
    await apiHelper.createHashKey(database.id, hashKey.keyName, hashKey.fields);
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteAllIndexes(database.id, (name) => name.includes(uniqueId));
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_INDEX_PREFIX}*`);
    await apiHelper.deleteDatabase(database.id);
  });

  test.beforeEach(async ({ vectorSearchPage, apiHelper, page }) => {
    // Seed index
    const indexConfig = IndexConfigFactory.build({ indexName: TEST_INDEX_NAME, prefix: TEST_INDEX_PREFIX });
    await apiHelper.createIndex(database.id, indexConfig.indexName, indexConfig.prefix, indexConfig.schema);

    // Navigate to query page
    await vectorSearchPage.goto(database.id);
    await expect(vectorSearchPage.listWrapper).toBeVisible();

    // Skip onboarding
    await page.evaluate(() => {
      localStorage.setItem('vectorSearchQueryOnboarding', 'true');
    });

    await vectorSearchPage.indexList.openQuery(TEST_INDEX_NAME);
    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();
  });

  test('should save query and verify it appears in query library', async ({ vectorSearchPage }) => {
    const queryName = `test-saved-${faker.string.alphanumeric(6)}`;

    await vectorSearchPage.queryEditor.typeQuery('* => [KNN 10 @vec $BLOB]');
    await expect(vectorSearchPage.queryEditor.saveButton).toBeEnabled();
    await vectorSearchPage.queryEditor.saveButton.click();

    await expect(vectorSearchPage.saveQueryModal.body).toBeVisible();
    // Save the query via modal
    await vectorSearchPage.saveQueryModal.nameInput.fill(queryName);
    await vectorSearchPage.saveQueryModal.saveButton.click();

    await expect(vectorSearchPage.saveQueryModal.successToast).toBeVisible();
    await expect(vectorSearchPage.saveQueryModal.body).not.toBeVisible();

    // Verify saved query appears in library
    await vectorSearchPage.selectQueryLibraryTab();
    await expect(vectorSearchPage.queryLibrary.getItemByName(queryName)).toBeVisible();
  });

  test('should navigate to query library via success toast action', async ({ vectorSearchPage }) => {
    const queryName = `test-saved-${faker.string.alphanumeric(6)}`;

    await vectorSearchPage.queryEditor.typeQuery('* => [KNN 3 @vec $BLOB]');
    await expect(vectorSearchPage.queryEditor.saveButton).toBeEnabled();
    await vectorSearchPage.queryEditor.saveButton.click();

    await vectorSearchPage.saveQueryModal.nameInput.fill(queryName);
    await vectorSearchPage.saveQueryModal.saveButton.click();

    await expect(vectorSearchPage.saveQueryModal.successToast).toBeVisible();

    // Navigate to library via toast action
    await vectorSearchPage.saveQueryModal.successToastGoToLibrary.click();

    await expect(vectorSearchPage.queryLibrary.container).toBeVisible();
    await expect(vectorSearchPage.queryLibrary.getItemByName(queryName)).toBeVisible();
  });

  test('should cancel save query modal', async ({ vectorSearchPage }) => {
    const queryName = `test-cancelled-${faker.string.alphanumeric(6)}`;

    await vectorSearchPage.queryEditor.typeQuery('* => [KNN 5 @vec $BLOB]');
    await expect(vectorSearchPage.queryEditor.saveButton).toBeEnabled();
    await vectorSearchPage.queryEditor.saveButton.click();

    await expect(vectorSearchPage.saveQueryModal.body).toBeVisible();

    // Cancel without saving
    await vectorSearchPage.saveQueryModal.nameInput.fill(queryName);
    await vectorSearchPage.saveQueryModal.cancelButton.click();

    await expect(vectorSearchPage.saveQueryModal.body).not.toBeVisible();

    // Verify query was not saved to library
    await vectorSearchPage.selectQueryLibraryTab();
    await expect(vectorSearchPage.queryLibrary.getItemByName(queryName)).not.toBeVisible();
  });
});
