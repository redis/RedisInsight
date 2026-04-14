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

test.use({ featureFlags: { vectorSearchV2: true } });

/**
 * Vector Search > Create Index from List Page
 *
 * Tests for creating indexes via the "+ Create search index" menu
 * on the list page, including sample data flow, existing data flow,
 * and disabled state when no hash/JSON keys exist.
 */
test.describe('Vector Search > Create Index from List Page', { tag: '@serial' }, () => {
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
    // Open create index menu → Use existing data
    await vectorSearchPage.indexList.createIndexButton.click();

    const existingDataItem = vectorSearchPage.indexList.getCreateIndexMenuItem('existing-data');
    await expect(existingDataItem).toBeEnabled();
    await existingDataItem.click();

    await expect(vectorSearchPage.createIndexWrapper).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.browserPanel).toBeVisible();

    // Select key in browser panel and create index
    await vectorSearchPage.createIndexForm.selectKey(`${TEST_INDEX_PREFIX}key1`);
    await expect(vectorSearchPage.createIndexForm.content).toBeVisible();

    // Create index and navigate to query page, verify toast
    await vectorSearchPage.createIndexForm.createIndexButton.click();
    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();
    await expect(vectorSearchPage.indexCreatedToast).toBeVisible();
  });
});

test.describe('Vector Search > Create Index from List Page - No Hash/JSON Keys', { tag: '@serial' }, () => {
  let database: DatabaseInstance;
  const emptyIndex = IndexConfigFactory.build();

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneEmptyConfigFactory.build());
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteIndex(database.id, emptyIndex.indexName);
    await apiHelper.deleteDatabase(database.id);
  });

  test('should disable "Use existing data" when no hash or JSON keys exist', async ({
    vectorSearchPage,
    apiHelper,
  }) => {
    // FLUSHDB leaves no hash/JSON keys → "Use existing data" should be disabled
    await apiHelper.sendCommand(database.id, 'FLUSHDB');
    await apiHelper.createIndex(database.id, emptyIndex.indexName, emptyIndex.prefix, emptyIndex.schema);

    await expect
      .poll(() => apiHelper.getIndexes(database.id).then((indexes) => indexes.includes(emptyIndex.indexName)))
      .toBe(true);

    // Navigate to list page
    await vectorSearchPage.goto(database.id);
    await expect(vectorSearchPage.listWrapper).toBeVisible();

    // Open create index menu → "Use existing data" should be disabled
    await vectorSearchPage.indexList.createIndexButton.click();

    const existingDataItem = vectorSearchPage.indexList.getCreateIndexMenuItem('existing-data');
    await expect(existingDataItem).toBeVisible();
    await expect(existingDataItem).toHaveAttribute('data-disabled', '');
  });
});
