import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { CreateIndexOnboarding } from 'e2eSrc/pages/vector-search/components/CreateIndexOnboarding';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { IndexConfigFactory, IndexHashKeyFactory } from 'e2eSrc/test-data/vector-search';
import { DatabaseInstance } from 'e2eSrc/types';

const uniqueId = faker.string.alphanumeric(6);
const TEST_INDEX_PREFIX = `a-vs-onboard-${uniqueId}`;
const TEST_KEY_NAME = `${TEST_INDEX_PREFIX}:key1`;
const seedIndex = IndexConfigFactory.build();

/**
 * Vector Search > Select Key Onboarding
 *
 * The "Select a key to get started" popover appears when the browser panel
 * opens for the first time. It is dismissed via "Got it" or automatically
 * when a key is selected.
 */
test.describe('Vector Search > Select Key Onboarding', { tag: '@serial' }, () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneConfigFactory.build());
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_INDEX_PREFIX}:*`);
    const hashKey = IndexHashKeyFactory.build({ keyName: TEST_KEY_NAME });
    await apiHelper.createHashKey(database.id, hashKey.keyName, hashKey.fields);
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteAllIndexes(database.id, (name) => name.includes(uniqueId) || name === seedIndex.indexName);
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_INDEX_PREFIX}:*`);
    await apiHelper.deleteDatabase(database.id);
  });

  test.beforeEach(async ({ apiHelper, vectorSearchPage, page }) => {
    await apiHelper.createIndex(database.id, seedIndex.indexName, seedIndex.prefix, seedIndex.schema);

    // Navigate to the app so localStorage operations target the correct origin
    await vectorSearchPage.goto(database.id);

    // Reset onboarding state so the popover appears
    await page.evaluate(() => {
      localStorage.removeItem('vectorSearchSelectKeyOnboarding');
      localStorage.removeItem('vectorSearchCreateIndexOnboarding');
    });
  });

  test('should show select key onboarding and dismiss on "Got it"', async ({ vectorSearchPage }) => {
    await vectorSearchPage.goto(database.id);
    await vectorSearchPage.navigateToCreateIndex();

    await expect(vectorSearchPage.createIndexForm.selectKeyOnboarding).toBeVisible();
    await vectorSearchPage.createIndexForm.selectKeyOnboardingDismiss.click();

    await expect(vectorSearchPage.createIndexForm.selectKeyOnboarding).not.toBeVisible();
  });

  test('should not show select key onboarding on subsequent visit', async ({ vectorSearchPage, page }) => {
    await page.evaluate(() => {
      localStorage.setItem('vectorSearchSelectKeyOnboarding', 'true');
    });

    await vectorSearchPage.goto(database.id);
    await vectorSearchPage.navigateToCreateIndex();

    await expect(vectorSearchPage.createIndexForm.browserPanel).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.selectKeyOnboarding).not.toBeVisible();
  });
});

/**
 * Vector Search > Create Index - Onboarding
 *
 * Tests for the create index onboarding flow.
 * The onboarding starts after the user selects a key from the browser panel,
 * which triggers field inference and shows guided popovers through the form steps:
 * DefineIndex → IndexPrefix → FieldName → SampleValue → IndexingType → CommandView
 */
test.describe('Vector Search > Create Index - Onboarding', { tag: '@serial' }, () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneConfigFactory.build());
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_INDEX_PREFIX}:*`);
    const hashKey = IndexHashKeyFactory.build({ keyName: TEST_KEY_NAME });
    await apiHelper.createHashKey(database.id, hashKey.keyName, hashKey.fields);
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteAllIndexes(database.id, (name) => name.includes(uniqueId) || name === seedIndex.indexName);
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_INDEX_PREFIX}:*`);
    await apiHelper.deleteDatabase(database.id);
  });

  test.beforeEach(async ({ page, apiHelper, vectorSearchPage }) => {
    // Seed index
    await apiHelper.createIndex(database.id, seedIndex.indexName, seedIndex.prefix, seedIndex.schema);

    // Navigate to the app so localStorage operations target the correct origin
    await vectorSearchPage.goto(database.id);

    // Reset create-index onboarding, skip select-key onboarding
    await page.evaluate(() => {
      localStorage.removeItem('vectorSearchCreateIndexOnboarding');
      localStorage.setItem('vectorSearchSelectKeyOnboarding', 'true');
    });
  });

  test('should complete onboarding flow through all steps', async ({ vectorSearchPage }) => {
    await vectorSearchPage.goto(database.id);
    await vectorSearchPage.navigateToCreateIndex();
    await vectorSearchPage.createIndexForm.selectKey(TEST_KEY_NAME);

    const { createIndexOnboarding } = vectorSearchPage;
    await expect(createIndexOnboarding.stepPopover('defineIndex')).toBeVisible();

    // Walk through all onboarding steps (DefineIndex → IndexPrefix → FieldName → SampleValue → IndexingType → CommandView)
    for (const step of CreateIndexOnboarding.STEPS) {
      await expect(createIndexOnboarding.stepAction(step)).toBeVisible();
      await createIndexOnboarding.stepAction(step).click();
    }

    await expect(createIndexOnboarding.popover).not.toBeVisible();
  });

  test('should skip onboarding', async ({ vectorSearchPage }) => {
    await vectorSearchPage.goto(database.id);
    await vectorSearchPage.navigateToCreateIndex();
    await vectorSearchPage.createIndexForm.selectKey(TEST_KEY_NAME);

    const { createIndexOnboarding } = vectorSearchPage;
    await expect(createIndexOnboarding.stepPopover('defineIndex')).toBeVisible();
    await createIndexOnboarding.skipButton.click();

    await expect(createIndexOnboarding.popover).not.toBeVisible();
  });

  test('should not show onboarding after completion', async ({ vectorSearchPage, page }) => {
    await page.evaluate(() => {
      localStorage.setItem('vectorSearchCreateIndexOnboarding', 'true');
    });

    await vectorSearchPage.goto(database.id);
    await vectorSearchPage.navigateToCreateIndex();
    await vectorSearchPage.createIndexForm.selectKey(TEST_KEY_NAME);

    await expect(vectorSearchPage.createIndexForm.container).toBeVisible();
    await expect(vectorSearchPage.createIndexOnboarding.popover).not.toBeVisible();
  });
});
