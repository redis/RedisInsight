import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import {
  StandaloneConfigFactory,
  StandaloneEmptyConfigFactory,
  StandaloneV7ConfigFactory,
} from 'e2eSrc/test-data/databases';
import { IndexConfigFactory } from 'e2eSrc/test-data/vector-search';
import { DatabaseInstance } from 'e2eSrc/types';

const uniqueId = faker.string.alphanumeric(6);
const TEST_INDEX_PREFIX = `test-vs-nav-${uniqueId}:`;
const TEST_INDEX_NAME = `test-vs-nav-${uniqueId}-idx`;

/**
 * Vector Search > Navigation and RQE Availability
 *
 * Tests for navigating to Vector Search and verifying the
 * correct screen is shown based on Redis capabilities.
 *
 * Each test creates its own database to avoid interfering
 * with parallel tests' FT indexes.
 */
test.describe('Vector Search > Navigation and RQE Availability', { tag: '@serial' }, () => {
  let database: DatabaseInstance;

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteAllIndexes(database.id, (name) => name.includes(uniqueId));
    await apiHelper.deleteDatabase(database.id);
  });

  test('should show welcome screen when no indexes exist', async ({ vectorSearchPage, apiHelper }) => {
    // Guarantee a completely empty Redis: no keys, no indexes
    database = await apiHelper.createDatabase(StandaloneEmptyConfigFactory.build());
    await apiHelper.sendCommand(database.id, 'FLUSHDB');
    await apiHelper.deleteAllIndexes(database.id);

    // Navigate to search page and verify welcome screen is visible
    await vectorSearchPage.goto(database.id);

    await expect(vectorSearchPage.navigationTabs.searchTab).toBeVisible();
    await expect(vectorSearchPage.navigationTabs.searchTab).toHaveAttribute('aria-selected', 'true');
    await expect(vectorSearchPage.welcomeWrapper).toBeVisible();
  });

  test('should show list screen when indexes exist', async ({ vectorSearchPage, apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneConfigFactory.build());

    // Seed index
    const indexConfig = IndexConfigFactory.build({ indexName: TEST_INDEX_NAME, prefix: TEST_INDEX_PREFIX });
    await apiHelper.createIndex(database.id, indexConfig.indexName, indexConfig.prefix, indexConfig.schema);

    // Navigate to list page and verify welcome screen is not visible
    await vectorSearchPage.goto(database.id);

    await expect(vectorSearchPage.navigationTabs.searchTab).toBeVisible();
    await expect(vectorSearchPage.navigationTabs.searchTab).toHaveAttribute('aria-selected', 'true');
    await expect(vectorSearchPage.listWrapper).toBeVisible();
  });
});

test.describe('Vector Search > RQE Not Available', { tag: '@serial' }, () => {
  let databaseNoModules: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    databaseNoModules = await apiHelper.createDatabase(StandaloneV7ConfigFactory.build());
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteDatabase(databaseNoModules.id);
  });

  test('should show RQE not available screen for Redis without search module', async ({ vectorSearchPage }) => {
    await vectorSearchPage.goto(databaseNoModules.id);

    await expect(vectorSearchPage.rqeNotAvailableWrapper).toBeVisible();
    await expect(vectorSearchPage.rqeNotAvailable.container).toBeVisible();
    await expect(vectorSearchPage.rqeNotAvailable.title).toBeVisible();
  });
});
