import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { IndexConfigFactory, IndexHashKeyFactory } from 'e2eSrc/test-data/vector-search';
import { DatabaseInstance } from 'e2eSrc/types';

const uniqueId = faker.string.alphanumeric(6);
const TEST_INDEX_PREFIX = `test-vs-qonboard-${uniqueId}:`;
const TEST_INDEX_NAME = `test-vs-qonboard-${uniqueId}-idx`;

/**
 * Vector Search > Query Page Onboarding
 *
 * The "Index created successfully" popover appears the first time the
 * query page is visited. It introduces the Query editor and Query library
 * tabs. Dismissed via the "Got it" button, it does not appear on subsequent visits.
 */
test.describe('Vector Search > Query Page Onboarding', { tag: '@serial' }, () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneConfigFactory.build());

    const hashKey = IndexHashKeyFactory.build({
      keyName: `${TEST_INDEX_PREFIX}key1`,
      fields: [{ field: 'name', value: faker.commerce.productName() }],
    });
    await apiHelper.createHashKey(database.id, hashKey.keyName, hashKey.fields);
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteAllIndexes(database.id, (name) => name.includes(uniqueId));
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_INDEX_PREFIX}*`);
    await apiHelper.deleteDatabase(database.id);
  });

  test.beforeEach(async ({ apiHelper, page }) => {
    // Seed index
    const indexConfig = IndexConfigFactory.build({ indexName: TEST_INDEX_NAME, prefix: TEST_INDEX_PREFIX });
    await apiHelper.createIndex(database.id, indexConfig.indexName, indexConfig.prefix, indexConfig.schema);

    // Reset query onboarding state so the popover appears
    await page.evaluate(() => {
      localStorage.removeItem('vectorSearchQueryOnboarding');
    });
  });

  test('should show query onboarding and dismiss on "Got it"', async ({ vectorSearchPage }) => {
    await vectorSearchPage.goto(database.id);
    await expect(vectorSearchPage.listWrapper).toBeVisible();

    await vectorSearchPage.indexList.openQuery(TEST_INDEX_NAME);

    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();
    await expect(vectorSearchPage.queryEditor.queryOnboarding).toBeVisible();

    await vectorSearchPage.queryEditor.queryOnboardingDismiss.click();

    await expect(vectorSearchPage.queryEditor.queryOnboarding).not.toBeVisible();
  });

  test('should not show query onboarding on subsequent visit', async ({ vectorSearchPage, page }) => {
    await page.evaluate(() => {
      localStorage.setItem('vectorSearchQueryOnboarding', 'true');
    });

    await vectorSearchPage.goto(database.id);
    await vectorSearchPage.indexList.openQuery(TEST_INDEX_NAME);

    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();
    await expect(vectorSearchPage.queryEditor.queryOnboarding).not.toBeVisible();
  });
});
