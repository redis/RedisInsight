import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { IndexConfigFactory, IndexHashKeyFactory } from 'e2eSrc/test-data/vector-search';
import { DatabaseInstance } from 'e2eSrc/types';

const uniqueId = faker.string.alphanumeric(6);
const TEST_INDEX_PREFIX = `test-vs-query-${uniqueId}:`;
const TEST_INDEX_NAME = `test-vs-query-${uniqueId}-idx`;

test.use({ featureFlags: { vectorSearchV2: true } });

/**
 * Vector Search > Query Page
 *
 * Tests for running queries, viewing results,
 * and result card actions (re-run, expand/collapse, delete, clear all).
 */
test.describe('Vector Search > Query Page', { tag: '@serial' }, () => {
  let database: DatabaseInstance;
  let testQuery: string;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneConfigFactory.build());

    for (let i = 1; i <= 5; i++) {
      const hashKey = IndexHashKeyFactory.build({ keyName: `${TEST_INDEX_PREFIX}key${i}` });
      await apiHelper.createHashKey(database.id, hashKey.keyName, hashKey.fields);
    }

    testQuery = `FT.SEARCH ${TEST_INDEX_NAME} *`;
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteAllIndexes(database.id, (name) => name.includes(uniqueId));
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_INDEX_PREFIX}*`);
    await apiHelper.deleteDatabase(database.id);
  });

  test.beforeEach(async ({ vectorSearchPage, apiHelper, page }) => {
    // Clear server-side command history to ensure clean results
    await apiHelper.deleteCommandExecutions(database.id);

    // Seed index (guard against parallel suites deleting it — FT indexes are server-global)
    const indexConfig = IndexConfigFactory.build({ indexName: TEST_INDEX_NAME, prefix: TEST_INDEX_PREFIX });
    await apiHelper.createIndex(database.id, indexConfig.indexName, indexConfig.prefix, indexConfig.schema);

    await vectorSearchPage.goto(database.id);
    await expect(vectorSearchPage.listWrapper).toBeVisible();

    // Skip onboarding
    await page.evaluate(() => {
      localStorage.setItem('vectorSearchQueryOnboarding', 'true');
    });

    // Navigate to query page and type the test query
    await vectorSearchPage.indexList.openQuery(TEST_INDEX_NAME);
    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();

    await vectorSearchPage.queryEditor.typeQuery(testQuery);
  });

  test('should run query and view results', async ({ vectorSearchPage }) => {
    // Empty results shown before running the query
    await expect(vectorSearchPage.queryEditor.container).toBeVisible();
    await expect(vectorSearchPage.queryResults.noResults).toBeVisible();

    await vectorSearchPage.queryEditor.runButton.click();

    // Result card appears, empty state disappears
    await expect(vectorSearchPage.queryResults.firstCardHeader).toBeVisible();
    await expect(vectorSearchPage.queryResults.noResults).not.toBeVisible();
  });

  test('should expand and collapse query result card', async ({ vectorSearchPage }) => {
    await vectorSearchPage.queryEditor.runButton.click();

    const toggleButton = vectorSearchPage.queryResults.firstCardToggleCollapseButton;
    const resultBody = vectorSearchPage.queryResults.firstCardResult;
    await expect(resultBody).toBeVisible();

    // Collapse the card
    await toggleButton.click();
    await expect(resultBody).not.toBeVisible();

    // Expand it back
    await toggleButton.click();
    await expect(resultBody).toBeVisible();
  });

  test('should re-run query from result card', async ({ vectorSearchPage }) => {
    await vectorSearchPage.queryEditor.runButton.click();
    await expect(vectorSearchPage.queryResults.firstCardHeader).toBeVisible();

    // Re-run the same query from the result card action
    const reRunButton = vectorSearchPage.queryResults.firstCardReRunButton;
    await expect(reRunButton).toBeVisible();
    await reRunButton.click();

    // Verify a new result card appeared with the same query
    await expect(vectorSearchPage.queryResults.firstCardHeader).toBeVisible();
    await expect(vectorSearchPage.queryResults.firstCardCommand).toContainText(testQuery);
  });

  test('should delete individual result card', async ({ vectorSearchPage }) => {
    // Run query twice to generate two result cards
    await vectorSearchPage.queryEditor.runButton.click();
    await expect(vectorSearchPage.queryResults.firstCardHeader).toBeVisible();
    await vectorSearchPage.queryEditor.runButton.click();

    const cards = vectorSearchPage.queryResults.container.getByTestId('query-card-open');
    await expect(cards).toHaveCount(2);

    // Delete the first card and verify count decreases
    await vectorSearchPage.queryResults.firstCardDeleteButton.click();
    await expect(cards).toHaveCount(1);
  });

  test('should clear all results', async ({ vectorSearchPage }) => {
    await vectorSearchPage.queryEditor.runButton.click();
    await expect(vectorSearchPage.queryResults.firstCardHeader).toBeVisible();

    await expect(vectorSearchPage.queryResults.clearResultsButton).toBeVisible();
    await vectorSearchPage.queryResults.clearResultsButton.click();

    const cards = vectorSearchPage.queryResults.container.getByTestId('query-card-open');
    await expect(cards).toHaveCount(0);
    await expect(vectorSearchPage.queryResults.noResults).toBeVisible();
  });

  test('should disable explain and profile buttons when editor is empty', async ({ vectorSearchPage }) => {
    await vectorSearchPage.queryEditor.clearQuery();

    await expect(vectorSearchPage.queryEditor.explainButton).toBeDisabled();
    await expect(vectorSearchPage.queryEditor.profileButton).toBeDisabled();

    // Verify tooltip explains why the button is disabled
    await vectorSearchPage.queryEditor.explainButton.hover();
    await expect(vectorSearchPage.queryEditor.explainTooltip).toContainText('Disabled: no query identified.');
  });

  test('should disable explain and profile buttons for non-FT query', async ({ vectorSearchPage }) => {
    // Non-FT commands (e.g. GET) can't be explained or profiled
    await vectorSearchPage.queryEditor.typeQuery('GET somekey');

    await expect(vectorSearchPage.queryEditor.explainButton).toBeDisabled();
    await expect(vectorSearchPage.queryEditor.profileButton).toBeDisabled();

    await vectorSearchPage.queryEditor.profileButton.hover();
    await expect(vectorSearchPage.queryEditor.profileTooltip).toContainText('Disabled: no query identified.');
  });

  test('should disable save button when editor is empty', async ({ vectorSearchPage }) => {
    await vectorSearchPage.queryEditor.clearQuery();

    await expect(vectorSearchPage.queryEditor.saveButton).toBeDisabled();
  });

  test('should execute explain query action', async ({ vectorSearchPage }) => {
    await expect(vectorSearchPage.queryEditor.container).toBeVisible();

    await vectorSearchPage.queryEditor.explainButton.click();

    await expect(vectorSearchPage.queryResults.firstCardHeader).toBeVisible();
  });

  test('should execute profile query action', async ({ vectorSearchPage }) => {
    await expect(vectorSearchPage.queryEditor.container).toBeVisible();

    await vectorSearchPage.queryEditor.profileButton.click();

    await expect(vectorSearchPage.queryResults.firstCardHeader).toBeVisible();
  });
});
