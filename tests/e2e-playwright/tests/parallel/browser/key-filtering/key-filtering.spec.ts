import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { TEST_KEY_PREFIX } from 'e2eSrc/test-data/browser';
import { DatabaseInstance } from 'e2eSrc/types';

/**
 * Key Filtering Patterns Tests
 *
 * Tests the ability to filter keys using various patterns including
 * wildcards, character classes, and escaping special characters.
 */
test.describe('Browser > Key Filtering Patterns', () => {
  let database: DatabaseInstance;
  // Use a unique suffix per test run to avoid conflicts
  const uniqueSuffix = `kfp-${Date.now().toString(36)}`;

  // Define test keys with specific naming for pattern testing
  const testKeys = {
    prefix1: `${TEST_KEY_PREFIX}filter-a-${uniqueSuffix}`,
    prefix2: `${TEST_KEY_PREFIX}filter-b-${uniqueSuffix}`,
    prefix3: `${TEST_KEY_PREFIX}filter-c-${uniqueSuffix}`,
    numbered1: `${TEST_KEY_PREFIX}item1-${uniqueSuffix}`,
    numbered2: `${TEST_KEY_PREFIX}item2-${uniqueSuffix}`,
    numbered3: `${TEST_KEY_PREFIX}item3-${uniqueSuffix}`,
  };

  test.beforeAll(async ({ apiHelper }) => {
    // Create a test database with unique name for this test run
    const dbName = `test-key-filtering-${Date.now().toString(36)}`;
    const config = StandaloneConfigFactory.build({ name: dbName });
    database = await apiHelper.createDatabase(config);

    // Create test keys via API
    for (const [, keyName] of Object.entries(testKeys)) {
      await apiHelper.createStringKey(database.id, keyName, 'test-value');
    }
  });

  test.afterAll(async ({ apiHelper }) => {
    // Clean up the test database
    if (database?.id) {
      await apiHelper.deleteKeysByPattern(database.id, `${TEST_KEY_PREFIX}*`);
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ browserPage }) => {
    await browserPage.goto(database.id);
  });

  test.describe('Wildcard Patterns', () => {
    test(`should filter keys with asterisk (*) wildcard`, async ({ browserPage }) => {
      // Search for keys matching the pattern with asterisk and unique suffix
      await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}filter-*-${uniqueSuffix}`);

      // Verify that filter keys matching the pattern are shown
      await expect(browserPage.keyList.getKeyRow(testKeys.prefix1)).toBeVisible();

      // Verify numbered keys are not shown (different pattern)
      await expect(browserPage.keyList.getKeyRow(testKeys.numbered1)).not.toBeVisible();
    });

    test(`should filter keys with question mark (?) single character wildcard`, async ({ browserPage }) => {
      // Search for keys matching the pattern with ? wildcard (matches single char)
      await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}item?-${uniqueSuffix}`);

      // Verify that keys with single character match are shown
      await expect(browserPage.keyList.getKeyRow(testKeys.numbered1)).toBeVisible();
      await expect(browserPage.keyList.getKeyRow(testKeys.numbered2)).toBeVisible();
      await expect(browserPage.keyList.getKeyRow(testKeys.numbered3)).toBeVisible();
    });

    test(`should filter keys with [xy] character class`, async ({ browserPage }) => {
      // Search for keys with character class [ab] (matches a or b)
      await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}filter-[ab]-${uniqueSuffix}`);

      // Verify that keys matching a or b are shown
      await expect(browserPage.keyList.getKeyRow(testKeys.prefix1)).toBeVisible();
      await expect(browserPage.keyList.getKeyRow(testKeys.prefix2)).toBeVisible();

      // Verify key with c is not shown
      await expect(browserPage.keyList.getKeyRow(testKeys.prefix3)).not.toBeVisible();
    });

    test(`should filter keys with [a-z] character range`, async ({ browserPage }) => {
      // Search for keys with character range [a-c]
      await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}filter-[a-c]-${uniqueSuffix}`);

      // Verify that all filter keys are shown (a, b, c are all in range)
      await expect(browserPage.keyList.getKeyRow(testKeys.prefix1)).toBeVisible();
      await expect(browserPage.keyList.getKeyRow(testKeys.prefix2)).toBeVisible();
      await expect(browserPage.keyList.getKeyRow(testKeys.prefix3)).toBeVisible();
    });

    test(`should filter keys with [^x] negated character class`, async ({ browserPage }) => {
      // Search for keys with negated character class [^a] (matches anything except 'a')
      await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}filter-[^a]-${uniqueSuffix}`);

      // Verify that keys NOT matching 'a' are shown (b and c)
      await expect(browserPage.keyList.getKeyRow(testKeys.prefix2)).toBeVisible();
      await expect(browserPage.keyList.getKeyRow(testKeys.prefix3)).toBeVisible();

      // Verify key with 'a' is NOT shown
      await expect(browserPage.keyList.getKeyRow(testKeys.prefix1)).not.toBeVisible();
    });
  });

  test.describe('Special Characters', () => {
    test(`should escape special characters in filter pattern`, async ({ browserPage, cliPanel }) => {
      // Create a key with special characters (asterisk in the name)
      const specialKeyName = `${TEST_KEY_PREFIX}special*key-${uniqueSuffix}`;
      await cliPanel.open();
      await cliPanel.executeCommand(`SET "${specialKeyName}" "test-value"`);
      await cliPanel.hide();

      // Refresh the key list
      await browserPage.keyList.refresh();

      // Search for the key with escaped asterisk (using backslash)
      // In Redis KEYS pattern, \* matches a literal asterisk
      await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}special\\*key-${uniqueSuffix}`);

      // Verify the key with literal asterisk is found
      await expect(browserPage.keyList.getKeyRow(specialKeyName)).toBeVisible();

      // Clean up the special key
      await cliPanel.open();
      await cliPanel.executeCommand(`DEL "${specialKeyName}"`);
    });
  });

  test.describe('Filter Controls', () => {
    test(`should clear filter and search again`, async ({ browserPage }) => {
      // First apply a filter for filter-* keys with unique suffix
      await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}filter-*-${uniqueSuffix}`);

      // Verify filter is applied - filter keys should be visible
      await expect(browserPage.keyList.getKeyRow(testKeys.prefix1)).toBeVisible();

      // Clear the search
      await browserPage.keyList.clearSearch();

      // Now search for item keys only
      await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}item*-${uniqueSuffix}`);

      // Verify numbered keys are visible after new search
      await expect(browserPage.keyList.getKeyRow(testKeys.numbered1)).toBeVisible();

      // Verify filter keys are NOT visible (different pattern)
      await expect(browserPage.keyList.getKeyRow(testKeys.prefix1)).not.toBeVisible();
    });
  });
});
