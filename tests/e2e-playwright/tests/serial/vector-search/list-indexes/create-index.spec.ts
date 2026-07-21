import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory, StandaloneEmptyConfigFactory } from 'e2eSrc/test-data/databases';
import { IndexConfigFactory, IndexHashKeyFactory } from 'e2eSrc/test-data/vector-search';
import { DatabaseInstance } from 'e2eSrc/types';

const uniqueId = faker.string.alphanumeric(6);
const TEST_INDEX_PREFIX = `a-vs-create-${uniqueId}:`;
const seedIndex = IndexConfigFactory.build();
const SAMPLE_INDEX_NAMES = ['idx:bikes_vss', 'idx:movies_vss'];
const SAMPLE_KEY_PREFIXES = ['bikes:*', 'movie:*'];

/**
 * Vector Search > Create Index from List Page
 *
 * Tests for creating indexes via the "+ Create search index" menu on the list
 * page: sample data, existing data, and the empty-database manual creation flow.
 */
test.describe('Vector Search > Create Index from List Page', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneConfigFactory.build());

    for (let i = 1; i <= 3; i++) {
      const hashKey = IndexHashKeyFactory.build({ keyName: `${TEST_INDEX_PREFIX}key${i}` });
      await apiHelper.createHashKey(database.id, hashKey.keyName, hashKey.fields);
    }
  });

  const indexFilter = (name: string) =>
    name.includes(uniqueId) || name === seedIndex.indexName || SAMPLE_INDEX_NAMES.includes(name);

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteAllIndexes(database.id, indexFilter);
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_INDEX_PREFIX}*`);
    for (const prefix of SAMPLE_KEY_PREFIXES) {
      await apiHelper.deleteKeysByPattern(database.id, prefix);
    }
    await apiHelper.deleteDatabase(database.id);
  });

  test.beforeEach(async ({ vectorSearchPage, apiHelper, page }) => {
    // Clean known indexes and sample-data keys, then seed one (so the list page appears)
    await apiHelper.deleteAllIndexes(database.id, indexFilter);
    for (const prefix of SAMPLE_KEY_PREFIXES) {
      await apiHelper.deleteKeysByPattern(database.id, prefix);
    }
    await apiHelper.createIndex(database.id, seedIndex.indexName, seedIndex.prefix, seedIndex.schema);

    await expect
      .poll(() => apiHelper.getIndexes(database.id).then((indexes) => indexes.includes(seedIndex.indexName)))
      .toBe(true);

    await vectorSearchPage.goto(database.id);
    await expect(vectorSearchPage.listWrapper).toBeVisible();

    // Skip onboarding (must be after navigation so localStorage targets the app origin)
    await page.evaluate(() => {
      localStorage.setItem('vectorSearchSelectKeyOnboarding', 'true');
      localStorage.setItem('vectorSearchQueryOnboarding', 'true');
      localStorage.setItem('vectorSearchCreateIndexOnboarding', 'true');
    });
  });

  test('should open sample data modal and complete "Start querying" flow', async ({ vectorSearchPage }) => {
    // Open create index menu → sample data → modal
    await vectorSearchPage.indexList.createIndexButton.click();

    const sampleDataItem = vectorSearchPage.indexList.getCreateIndexMenuItem('sample-data');
    await expect(sampleDataItem).toBeVisible();
    await sampleDataItem.click();

    await expect(vectorSearchPage.pickSampleDataModal.heading).toBeVisible();

    // Pick sample dataset and start querying → navigate to query page
    await vectorSearchPage.pickSampleDataModal.getSampleDataOption('e-commerce-discovery').click();
    await vectorSearchPage.pickSampleDataModal.startQueryingButton.click();

    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();
    await expect(vectorSearchPage.sampleDataToast).toBeVisible();
    await expect(vectorSearchPage.queryEditor.container).toBeVisible();
    await expect(vectorSearchPage.queryLibrary.allItems).toHaveCount(4);
  });

  test('should open sample data modal and navigate to "See index definition"', async ({ vectorSearchPage }) => {
    // Open create index menu → sample data → modal
    await vectorSearchPage.indexList.openCreateIndex('sample-data');
    await expect(vectorSearchPage.pickSampleDataModal.heading).toBeVisible();

    // Pick sample dataset and see index definition
    await vectorSearchPage.pickSampleDataModal.getSampleDataOption('content-recommendations').click();
    await vectorSearchPage.pickSampleDataModal.seeIndexDefinitionButton.click();

    // Verify create index form is visible
    await expect(vectorSearchPage.createIndexWrapper).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.container).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.content).toBeVisible();

    // Create index and navigate to query page, verify toast
    await vectorSearchPage.createIndexForm.createIndexButton.click();
    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();

    await expect(vectorSearchPage.sampleDataToast).toBeVisible();
  });

  test('should create index from existing data via list page menu', async ({ vectorSearchPage }) => {
    await vectorSearchPage.indexList.createIndexButton.click();

    const existingDataItem = vectorSearchPage.indexList.getCreateIndexMenuItem('existing-data');
    await expect(existingDataItem).toBeEnabled();
    await existingDataItem.click();

    await expect(vectorSearchPage.createIndexWrapper).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.browserPanel).toBeVisible();

    await vectorSearchPage.createIndexForm.selectKey(`${TEST_INDEX_PREFIX}key1`);
    await expect(vectorSearchPage.createIndexForm.content).toBeVisible();

    await vectorSearchPage.createIndexForm.createIndexButton.click();
    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();
    await expect(vectorSearchPage.indexCreatedToast).toBeVisible();
  });
});

test.describe('Vector Search > Create Index from List Page - No Hash/JSON Keys', () => {
  let database: DatabaseInstance;
  const emptyIndex = IndexConfigFactory.build();

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneEmptyConfigFactory.build());
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteIndex(database.id, emptyIndex.indexName);
    await apiHelper.deleteDatabase(database.id);
  });

  test('should open existing data flow into manual creation with the browser collapsed', async ({
    vectorSearchPage,
    apiHelper,
    page,
  }) => {
    // FLUSHDB leaves no hash/JSON keys; seed one index so the list page appears
    await apiHelper.sendCommand(database.id, 'FLUSHDB');
    await apiHelper.createIndex(database.id, emptyIndex.indexName, emptyIndex.prefix, emptyIndex.schema);

    await expect
      .poll(() => apiHelper.getIndexes(database.id).then((indexes) => indexes.includes(emptyIndex.indexName)))
      .toBe(true);

    await vectorSearchPage.goto(database.id);
    await expect(vectorSearchPage.listWrapper).toBeVisible();

    // Skip onboarding (after navigation so localStorage targets the app origin)
    await page.evaluate(() => {
      localStorage.setItem('vectorSearchSelectKeyOnboarding', 'true');
      localStorage.setItem('vectorSearchCreateIndexOnboarding', 'true');
    });

    await vectorSearchPage.indexList.createIndexButton.click();

    const existingDataItem = vectorSearchPage.indexList.getCreateIndexMenuItem('existing-data');
    await expect(existingDataItem).toBeVisible();
    await expect(existingDataItem).toBeEnabled();
    await existingDataItem.click();

    // With no data to browse, the key browser is collapsed and the manual empty state shows
    await expect(vectorSearchPage.createIndexWrapper).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.emptyState).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.browserPanel).toBeHidden();
  });
});
