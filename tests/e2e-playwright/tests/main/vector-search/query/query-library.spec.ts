import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { IndexConfigFactory, IndexHashKeyFactory } from 'e2eSrc/test-data/vector-search';
import { DatabaseInstance } from 'e2eSrc/types';

const uniqueId = faker.string.alphanumeric(6);
const TEST_INDEX_PREFIX = `test-vs-lib-${uniqueId}:`;
const TEST_INDEX_NAME = `test-vs-lib-${uniqueId}-idx`;
const TEST_QUERY = '* => [KNN 10 @vec $BLOB]';

test.use({ featureFlags: { vectorSearchV2: true } });

test.describe('Vector Search > Query Library', { tag: '@serial' }, () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneConfigFactory.build());

    const hashKey = IndexHashKeyFactory.build({ keyName: `${TEST_INDEX_PREFIX}key1` });
    await apiHelper.createHashKey(database.id, hashKey.keyName, hashKey.fields);
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteAllIndexes(database.id, (name) => name.includes(uniqueId));
    await apiHelper.deleteAllSavedQueries(database.id, TEST_INDEX_NAME);
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_INDEX_PREFIX}*`);
    await apiHelper.deleteDatabase(database.id);
  });

  test.beforeEach(async ({ vectorSearchPage, apiHelper, page }) => {
    // Seed index and clear saved queries
    const indexConfig = IndexConfigFactory.build({ indexName: TEST_INDEX_NAME, prefix: TEST_INDEX_PREFIX });
    await apiHelper.createIndex(database.id, indexConfig.indexName, indexConfig.prefix, indexConfig.schema);
    await apiHelper.deleteAllSavedQueries(database.id, TEST_INDEX_NAME);

    await vectorSearchPage.goto(database.id);
    await expect(vectorSearchPage.listWrapper).toBeVisible();

    // Skip onboarding
    await page.evaluate(() => {
      localStorage.setItem('vectorSearchQueryOnboarding', 'true');
    });

    await vectorSearchPage.indexList.openQuery(TEST_INDEX_NAME);
    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();
  });

  test('should search and filter saved queries in the library', async ({ vectorSearchPage, apiHelper }) => {
    // Seed 3 queries via API so the library has data to filter
    const targetName = `unique-target-${faker.string.alphanumeric(6)}`;
    await apiHelper.createSavedQuery(database.id, TEST_INDEX_NAME, targetName, TEST_QUERY);
    await apiHelper.createSavedQuery(
      database.id,
      TEST_INDEX_NAME,
      `other-${faker.string.alphanumeric(6)}`,
      '@name:hello',
    );
    await apiHelper.createSavedQuery(
      database.id,
      TEST_INDEX_NAME,
      `another-${faker.string.alphanumeric(6)}`,
      '@description:world',
    );

    await vectorSearchPage.selectQueryLibraryTab();

    await expect(vectorSearchPage.queryLibrary.allItems).toHaveCount(3);

    // Filter by name → only the matching query remains
    await vectorSearchPage.queryLibrary.searchInput.fill(targetName);

    await expect(vectorSearchPage.queryLibrary.allItems).toHaveCount(1);
    await expect(vectorSearchPage.queryLibrary.getItemByName(targetName)).toBeVisible();
  });

  test('should expand and collapse a query library item', async ({ vectorSearchPage, apiHelper }) => {
    // Seed query via API so the library has data to expand/collapse
    const queryName = `test-expand-${faker.string.alphanumeric(6)}`;
    const savedQuery = await apiHelper.createSavedQuery(database.id, TEST_INDEX_NAME, queryName, TEST_QUERY);

    // Select query library tab and verify query is visible
    await vectorSearchPage.selectQueryLibraryTab();

    const header = vectorSearchPage.queryLibrary.getItemHeader(savedQuery.id);
    const body = vectorSearchPage.queryLibrary.getItemBody(savedQuery.id);

    await expect(header).toBeVisible();
    await expect(body).not.toBeVisible();

    // Expand: click header to show query body
    await header.click();
    await expect(body).toBeVisible();
    await expect(body).toContainText(TEST_QUERY);

    // Collapse: click header again to hide body
    await header.click();
    await expect(body).not.toBeVisible();
  });

  test('should run query from library', async ({ vectorSearchPage, apiHelper }) => {
    // Seed query via API so the library has data to run
    const queryName = `test-run-${faker.string.alphanumeric(6)}`;
    const savedQuery = await apiHelper.createSavedQuery(database.id, TEST_INDEX_NAME, queryName, TEST_QUERY);

    // Select query library tab and verify query is visible
    await vectorSearchPage.selectQueryLibraryTab();

    // Click run button and verify result card is visible
    const runButton = vectorSearchPage.queryLibrary.getItemRunButton(savedQuery.id);
    await expect(runButton).toBeVisible();
    await runButton.click();

    await expect(vectorSearchPage.queryResults.firstCardCommand).toBeVisible();
    await expect(vectorSearchPage.queryResults.firstCardCommand).toContainText(TEST_QUERY);
  });

  test('should load query into editor from library', async ({ vectorSearchPage, apiHelper }) => {
    // Seed query via API so the library has data to load
    const queryName = `test-load-${faker.string.alphanumeric(6)}`;
    const savedQuery = await apiHelper.createSavedQuery(database.id, TEST_INDEX_NAME, queryName, TEST_QUERY);

    // Select query library tab and verify query is visible
    await vectorSearchPage.selectQueryLibraryTab();

    // Click load button and verify editor is visible and query is loaded
    const loadButton = vectorSearchPage.queryLibrary.getItemLoadButton(savedQuery.id);
    await expect(loadButton).toBeVisible();
    await loadButton.click();

    await expect(vectorSearchPage.queryEditor.container).toBeVisible();
    await expect(vectorSearchPage.queryEditor.textbox).toHaveValue(TEST_QUERY);
  });

  test('should delete query from library and show notification', async ({ vectorSearchPage, apiHelper }) => {
    // Seed query via API so the library has data to delete
    const queryName = `test-delete-${faker.string.alphanumeric(6)}`;
    const savedQuery = await apiHelper.createSavedQuery(database.id, TEST_INDEX_NAME, queryName, TEST_QUERY);

    // Select query library tab and verify query is visible
    await vectorSearchPage.selectQueryLibraryTab();

    const deleteButton = vectorSearchPage.queryLibrary.getItemDeleteButton(savedQuery.id);
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Confirm deletion in modal and verify success toast
    await expect(vectorSearchPage.deleteQueryModal.confirmButton).toBeVisible();
    await vectorSearchPage.deleteQueryModal.confirmButton.click();

    await expect(vectorSearchPage.queryLibrary.deleteSuccessToast).toBeVisible();
    await expect(vectorSearchPage.queryLibrary.getItem(savedQuery.id)).not.toBeVisible();
  });
});
