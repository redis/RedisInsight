import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory, StandaloneV7ConfigFactory } from 'e2eSrc/test-data/databases';
import { IndexConfigFactory, IndexHashKeyFactory, IndexSchemaFieldFactory } from 'e2eSrc/test-data/vector-search';
import { DatabaseInstance } from 'e2eSrc/types';

const uniqueId = faker.string.alphanumeric(6);
const TEST_KEY_PATTERN = `test-vs-*-${uniqueId}*`;
const TEST_INDEX_PREFIX = `test-vs-browser-${uniqueId}:`;
const TEST_INDEX_NAME = `test-vs-browser-${uniqueId}-idx`;
const TEST_INDEX_NAME_2 = `test-vs-browser-${uniqueId}-idx2`;

/**
 * Vector Search > Browser Page Integration
 *
 * Tests for viewing index data from the Browser page,
 * navigating to create index, and browsing index data.
 *
 * Note: Some tests depend on RI-7944 (Make keys searchable from Browser page).
 */
test.describe('Vector Search > Browser Page Integration', { tag: '@serial' }, () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneConfigFactory.build());
  });

  // Skip create-index onboarding for all tests
  test.beforeEach(async ({ browserPage, page }) => {
    await browserPage.goto(database.id);
    await page.evaluate(() => localStorage.setItem('vectorSearchCreateIndexOnboarding', 'true'));
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteAllIndexes(database.id, (name) => name.includes(uniqueId));
    await apiHelper.deleteKeysByPattern(database.id, TEST_KEY_PATTERN);
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteDatabase(database.id);
  });

  test('should show "View index" button for key indexed by a single index', async ({ browserPage, apiHelper }) => {
    // Seed one index and a key matching its prefix
    const singlePrefix = `test-vs-single-${uniqueId}:`;
    const singleIndexName = `test-vs-single-${uniqueId}-idx`;
    const singleKey = IndexHashKeyFactory.build({ keyName: `${singlePrefix}key1` });

    const singleIndex = IndexConfigFactory.build({
      indexName: singleIndexName,
      prefix: singlePrefix,
      schema: [IndexSchemaFieldFactory.build({ name: 'name', type: 'text' })],
    });
    await apiHelper.createIndex(database.id, singleIndex.indexName, singleIndex.prefix, singleIndex.schema);
    await apiHelper.createHashKey(database.id, singleKey.keyName, singleKey.fields);

    // Select the key and click "View index" to navigate to the Search tab
    await browserPage.keyList.searchKeys(`${singlePrefix}key1`);
    await browserPage.keyList.selectKeyInTree(`${singlePrefix}key1`);
    await expect(browserPage.keyDetailsPanel).toBeVisible();

    await expect(browserPage.viewIndexButton).toBeVisible();
    await browserPage.viewIndexButton.click();

    await expect(browserPage.navigationTabs.searchTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should show "View index" dropdown for key indexed by multiple indexes', async ({ browserPage, apiHelper }) => {
    // Create two indexes sharing the same prefix so one key is indexed by both
    const indexConfig = IndexConfigFactory.build({ indexName: TEST_INDEX_NAME, prefix: TEST_INDEX_PREFIX });
    await apiHelper.createIndex(database.id, indexConfig.indexName, indexConfig.prefix, indexConfig.schema);
    const indexConfig2 = IndexConfigFactory.build({
      indexName: TEST_INDEX_NAME_2,
      prefix: TEST_INDEX_PREFIX,
      schema: [IndexSchemaFieldFactory.build({ name: 'name', type: 'text' })],
    });
    await apiHelper.createIndex(database.id, indexConfig2.indexName, indexConfig2.prefix, indexConfig2.schema);

    const hashKey = IndexHashKeyFactory.build({ keyName: `${TEST_INDEX_PREFIX}key1` });
    await apiHelper.createHashKey(database.id, hashKey.keyName, hashKey.fields);

    // Select the key → dropdown trigger shows with badge count "2"
    await browserPage.keyList.searchKeys(`${TEST_INDEX_PREFIX}key1`);
    await browserPage.keyList.selectKeyInTree(`${TEST_INDEX_PREFIX}key1`);
    await expect(browserPage.keyDetailsPanel).toBeVisible();

    await expect(browserPage.viewIndexMenuTrigger).toBeVisible();
    await expect(browserPage.viewIndexCountBadge).toHaveText('2');

    // Open the View index dropdown and pick one index to navigate
    await browserPage.viewIndexMenuTrigger.click();

    await expect(browserPage.getViewIndexMenuItem(TEST_INDEX_NAME)).toBeVisible();
    await expect(browserPage.getViewIndexMenuItem(TEST_INDEX_NAME_2)).toBeVisible();

    await browserPage.getViewIndexMenuItem(TEST_INDEX_NAME).click();
    await expect(browserPage.navigationTabs.searchTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should show "Make searchable" button for non-indexed key and create index', async ({
    browserPage,
    vectorSearchPage,
    apiHelper,
  }) => {
    // Create a key with no matching index
    const nonIndexedPrefix = `test-vs-nonindexed-${uniqueId}:`;
    const nonIndexedKeyName = `${nonIndexedPrefix}key1`;
    const hashKey = IndexHashKeyFactory.build({
      keyName: nonIndexedKeyName,
      fields: [{ field: 'title', value: faker.commerce.productName() }],
    });
    await apiHelper.createHashKey(database.id, hashKey.keyName, hashKey.fields);

    // Select key → "Make searchable" button should appear (key has no index)
    await browserPage.keyList.searchKeys(nonIndexedKeyName);
    await browserPage.keyList.selectKeyInTree(nonIndexedKeyName);
    await expect(browserPage.keyDetailsPanel).toBeVisible();

    await expect(browserPage.makeSearchableButton).toBeVisible();
    await browserPage.makeSearchableButton.click();

    // Walk through Make searchable modal → create index form → create index
    await expect(browserPage.makeSearchableModal.heading).toBeVisible();
    await browserPage.makeSearchableModal.continueButton.click();

    await expect(vectorSearchPage.createIndexForm.container).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.content).toBeVisible();

    await vectorSearchPage.createIndexForm.createIndexButton.click();
    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();
    await expect(vectorSearchPage.indexCreatedToast).toBeVisible();
  });

  test('should show "Index" button on folder node and create index', async ({
    browserPage,
    vectorSearchPage,
    apiHelper,
  }) => {
    // Create a key with no matching index
    const indexablePrefix = `test-vs-indexable-${uniqueId}:`;
    const indexableKeyName = `${indexablePrefix}key1`;
    const hashKey = IndexHashKeyFactory.build({ keyName: indexableKeyName });
    await apiHelper.createHashKey(database.id, hashKey.keyName, hashKey.fields);

    await browserPage.keyList.searchKeys(indexableKeyName);

    // Hover folder node to reveal Index button, open modal, then create index
    const folderName = indexablePrefix.slice(0, -1);
    await browserPage.keyList.hoverFolderNode(folderName);

    const indexButton = browserPage.getIndexFolderButton(folderName);
    await expect(indexButton).toBeVisible();
    await indexButton.click();

    await expect(browserPage.makeSearchableModal.heading).toBeVisible();
    await browserPage.makeSearchableModal.continueButton.click();

    await expect(vectorSearchPage.createIndexForm.container).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.content).toBeVisible();

    await vectorSearchPage.createIndexForm.createIndexButton.click();
    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();
    await expect(vectorSearchPage.indexCreatedToast).toBeVisible();
  });
});

test.describe('Vector Search > Browser Page Integration > RQE Not Available', { tag: '@serial' }, () => {
  let databaseNoModules: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    databaseNoModules = await apiHelper.createDatabase(StandaloneV7ConfigFactory.build());
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteDatabase(databaseNoModules.id);
  });

  test('should show RQE not available when navigating to Search tab on Redis without search module', async ({
    vectorSearchPage,
  }) => {
    await vectorSearchPage.goto(databaseNoModules.id);

    await expect(vectorSearchPage.rqeNotAvailableWrapper).toBeVisible();
    await expect(vectorSearchPage.rqeNotAvailable.container).toBeVisible();
  });
});
