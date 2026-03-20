import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { IndexConfigFactory } from 'e2eSrc/test-data/vector-search';
import { DatabaseInstance } from 'e2eSrc/types';

const seedIndex = IndexConfigFactory.build();

const SAMPLE_DATASETS = [
  { id: 'e-commerce-discovery', label: 'E-Commerce Discovery (Bikes)', expectedQueryCount: 4 },
  { id: 'content-recommendations', label: 'Content Recommendations (Movies)', expectedQueryCount: 5 },
] as const;

test.use({ featureFlags: { vectorSearchV2: true } });

/**
 * Vector Search > Create Index - Sample Data
 *
 * Tests for creating an index from sample data,
 * including "Start querying" and "See index definition" flows.
 *
 * Each test cleans up indexes and creates a seed so the list page appears.
 */
test.describe('Vector Search > Create Index - Sample Data', { tag: '@serial' }, () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneConfigFactory.build());
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteDatabase(database.id);
  });

  test.beforeEach(async ({ apiHelper }) => {
    // Clean known indexes and seed one so the list page appears
    const KNOWN_INDEXES = [seedIndex.indexName, 'idx:bikes_vss', 'idx:movies_vss'];
    await apiHelper.deleteAllIndexes(database.id, (name) => KNOWN_INDEXES.includes(name));
    await apiHelper.createIndex(database.id, seedIndex.indexName, seedIndex.prefix, seedIndex.schema);
  });

  test('should close the sample data modal and return to list page', async ({ vectorSearchPage }) => {
    // Navigate to list page and open sample data modal
    await vectorSearchPage.goto(database.id);
    await vectorSearchPage.openSampleDataModal();

    // Close modal and verify list page is visible
    await vectorSearchPage.pickSampleDataModal.closeButton.click();
    await expect(vectorSearchPage.pickSampleDataModal.heading).not.toBeVisible();
    await expect(vectorSearchPage.listWrapper).toBeVisible();
  });

  test('should cancel index creation from "See index definition" and return to list page', async ({
    vectorSearchPage,
  }) => {
    // Navigate to list page and open sample data modal
    await vectorSearchPage.goto(database.id);
    await vectorSearchPage.openSampleDataModal();

    // Pick sample dataset and see index definition
    await vectorSearchPage.pickSampleDataModal.getSampleDataOption('e-commerce-discovery').click();
    await vectorSearchPage.pickSampleDataModal.seeIndexDefinitionButton.click();

    await expect(vectorSearchPage.createIndexWrapper).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.container).toBeVisible();

    // Cancel index creation and verify list page is visible
    await vectorSearchPage.createIndexForm.cancelButton.click();
    await expect(vectorSearchPage.createIndexWrapper).not.toBeVisible();
    await expect(vectorSearchPage.listWrapper).toBeVisible();
  });

  for (const { id: dataset, label, expectedQueryCount } of SAMPLE_DATASETS) {
    test.describe(label, () => {
      test('should create index via "Start querying" and verify query library is seeded', async ({
        vectorSearchPage,
      }) => {
        // Navigate to list page and open sample data modal
        await vectorSearchPage.goto(database.id);
        await vectorSearchPage.openSampleDataModal();

        // Pick sample dataset and start querying
        await vectorSearchPage.pickSampleDataModal.getSampleDataOption(dataset).click();
        await vectorSearchPage.pickSampleDataModal.startQueryingButton.click();
        await expect(vectorSearchPage.queryPageWrapper).toBeVisible();

        // Verify toast and query library is seeded
        await expect(vectorSearchPage.sampleDataToast).toBeVisible();
        await expect(vectorSearchPage.queryLibrary.container).toBeVisible();
        await expect(vectorSearchPage.queryLibrary.allItems).toHaveCount(expectedQueryCount);
      });

      test('should create index via "See index definition" and verify toast', async ({ vectorSearchPage }) => {
        // Navigate to list page and open sample data modal
        await vectorSearchPage.goto(database.id);
        await vectorSearchPage.openSampleDataModal();

        // Pick sample dataset and see index definition
        await vectorSearchPage.pickSampleDataModal.getSampleDataOption(dataset).click();
        await vectorSearchPage.pickSampleDataModal.seeIndexDefinitionButton.click();

        // Verify create index form is visible
        await expect(vectorSearchPage.createIndexWrapper).toBeVisible();
        await expect(vectorSearchPage.createIndexForm.container).toBeVisible();
        await expect(vectorSearchPage.createIndexForm.content).toBeVisible();

        // Create index and navigate to query page, verify toast
        await vectorSearchPage.createIndexForm.createIndexButton.click();
        await expect(vectorSearchPage.queryPageWrapper).toBeVisible();

        // Verify toast and query library is seeded
        await expect(vectorSearchPage.sampleDataToast).toBeVisible();
        await expect(vectorSearchPage.queryLibrary.container).toBeVisible();
        await expect(vectorSearchPage.queryLibrary.allItems).toHaveCount(expectedQueryCount);
      });
    });
  }
});
