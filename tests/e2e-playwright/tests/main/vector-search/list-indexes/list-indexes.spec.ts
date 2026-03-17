import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { IndexConfigFactory, IndexHashKeyFactory } from 'e2eSrc/test-data/vector-search';
import { DatabaseInstance } from 'e2eSrc/types';

const uniqueId = faker.string.alphanumeric(6);
const TEST_INDEX_PREFIX = `test-vs-list-${uniqueId}:`;
const TEST_INDEX_NAME = `test-vs-list-${uniqueId}-idx`;

/**
 * Vector Search > List Indexes
 *
 * Tests for viewing, querying, browsing, inspecting, and deleting
 * indexes from the index list page.
 */
test.describe('Vector Search > List Indexes', { tag: '@serial' }, () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneConfigFactory.build());

    for (let i = 1; i <= 3; i++) {
      const hashKey = IndexHashKeyFactory.build({ keyName: `${TEST_INDEX_PREFIX}key${i}` });
      await apiHelper.createHashKey(database.id, hashKey.keyName, hashKey.fields);
    }
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteAllIndexes(database.id, (name) => name.includes(uniqueId));
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_INDEX_PREFIX}*`);
    await apiHelper.deleteDatabase(database.id);
  });

  test.beforeEach(async ({ vectorSearchPage, apiHelper }) => {
    // Seed index and poll until available
    const indexConfig = IndexConfigFactory.build({
      indexName: TEST_INDEX_NAME,
      prefix: TEST_INDEX_PREFIX,
    });
    await apiHelper.createIndex(database.id, indexConfig.indexName, indexConfig.prefix, indexConfig.schema);

    await expect
      .poll(() => apiHelper.getIndexes(database.id).then((indexes) => indexes.includes(TEST_INDEX_NAME)))
      .toBe(true);

    // Navigate to list page
    await vectorSearchPage.goto(database.id);
    await expect(vectorSearchPage.listWrapper).toBeVisible();
  });

  test('should display indexes table with index name and create index button', async ({ vectorSearchPage }) => {
    await expect(vectorSearchPage.indexList.table).toBeVisible();
    await expect(vectorSearchPage.indexList.createIndexButton).toBeVisible();

    const indexName = vectorSearchPage.indexList.getIndexName(TEST_INDEX_NAME);
    await expect(indexName).toBeVisible();
    await expect(indexName).toHaveText(TEST_INDEX_NAME);
  });

  test('should navigate to query page when Query button is clicked', async ({ vectorSearchPage }) => {
    await vectorSearchPage.indexList.openQuery(TEST_INDEX_NAME);

    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();
    await expect(vectorSearchPage.queryEditor.container).toBeVisible();
  });

  test('should navigate to browser page when Browse dataset action is clicked', async ({
    vectorSearchPage,
    browserPage,
  }) => {
    // Open actions menu and select Browse dataset
    const actionsMenuTrigger = vectorSearchPage.indexList.getActionsMenuTrigger(TEST_INDEX_NAME);
    await actionsMenuTrigger.click();

    const browseItem = vectorSearchPage.indexList.getActionMenuItem('Browse dataset');
    await expect(browseItem).toBeVisible();
    await browseItem.click();

    // Verify browser tab is active and shows index keys
    await expect(vectorSearchPage.navigationTabs.browseTab).toHaveAttribute('aria-selected', 'true');
    await expect(browserPage.keyList.indexSelector).toContainText(TEST_INDEX_NAME);
    await expect(browserPage.keyList.resultsCount).toContainText('Results: 3');
  });

  test('should open index details side panel via View index action', async ({ vectorSearchPage }) => {
    // Open actions menu and select View index
    const actionsMenuTrigger = vectorSearchPage.indexList.getActionsMenuTrigger(TEST_INDEX_NAME);
    await actionsMenuTrigger.click();

    const viewItem = vectorSearchPage.indexList.getActionMenuItem('View index');
    await expect(viewItem).toBeVisible();
    await viewItem.click();

    await expect(vectorSearchPage.indexInfoPanel.container).toBeVisible();
    await expect(vectorSearchPage.indexInfoPanel.title).toBeVisible();

    // Close panel and verify it hides
    await vectorSearchPage.indexInfoPanel.closeButton.click();
    await expect(vectorSearchPage.indexInfoPanel.container).not.toBeVisible();
  });

  test('should delete index with confirmation', async ({ vectorSearchPage }) => {
    // Open actions menu and select Delete
    const actionsMenuTrigger = vectorSearchPage.indexList.getActionsMenuTrigger(TEST_INDEX_NAME);
    await actionsMenuTrigger.click();

    const deleteItem = vectorSearchPage.indexList.getActionMenuItem('Delete');
    await expect(deleteItem).toBeVisible();
    await deleteItem.click();

    // Confirm deletion and verify toast
    await expect(vectorSearchPage.deleteIndexModal.dialog).toBeVisible();
    await expect(vectorSearchPage.deleteIndexModal.confirmButton).toBeVisible();
    await vectorSearchPage.deleteIndexModal.confirmButton.click();

    await expect(vectorSearchPage.deleteIndexModal.dialog).not.toBeVisible();
    await expect(vectorSearchPage.indexDeletedToast).toBeVisible();

    await expect(vectorSearchPage.indexList.getIndexName(TEST_INDEX_NAME)).not.toBeVisible();
  });
});
