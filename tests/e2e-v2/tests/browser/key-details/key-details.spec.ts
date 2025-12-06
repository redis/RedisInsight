import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig } from '../../../test-data/databases';
import {
  getStringKeyData,
  getHashKeyData,
  TEST_KEY_PREFIX,
} from '../../../test-data/browser';
import { BrowserPage } from '../../../pages';

/**
 * Browser > Key Details Tests
 *
 * Tests for viewing and interacting with key details panel
 */
test.describe('Browser > Key Details', () => {
  let databaseId: string;
  let browserPage: BrowserPage;

  test.beforeAll(async ({ apiHelper }) => {
    // Create a test database for all tests in this file
    const config = getStandaloneConfig({ name: 'test-key-details-db' });
    const db = await apiHelper.createDatabase(config);
    databaseId = db.id;
  });

  test.afterAll(async ({ apiHelper }) => {
    // Clean up the test database
    if (databaseId) {
      await apiHelper.deleteDatabase(databaseId);
    }
  });

  test.beforeEach(async ({ page, createBrowserPage }) => {
    browserPage = createBrowserPage(databaseId);
    await browserPage.goto();
  });

  test.afterEach(async ({ apiHelper }) => {
    // Clean up test keys created during the test
    await apiHelper.deleteKeysByPattern(databaseId, `${TEST_KEY_PREFIX}*`);
  });

  test.describe('String Key Details', () => {
    test(`should display String key details ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getStringKeyData();

      // Create key via API for faster test setup
      await apiHelper.createStringKey(databaseId, keyData.keyName, keyData.value);

      // Refresh key list and click on the key
      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);

      // Wait for key details to load
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify key details are displayed
      await expect(browserPage.keyDetails.keyName).toContainText(keyData.keyName);
      await expect(browserPage.keyDetails.stringValue).toBeVisible();
    });

    test(`should show String key value ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getStringKeyData({ value: 'test-value-12345' });

      await apiHelper.createStringKey(databaseId, keyData.keyName, keyData.value);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify the value is displayed
      const value = await browserPage.keyDetails.getStringValue();
      expect(value).toContain('test-value-12345');
    });

    test(`should show Edit Value button for String ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getStringKeyData();

      await apiHelper.createStringKey(databaseId, keyData.keyName, keyData.value);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      await expect(browserPage.keyDetails.editValueButton).toBeVisible();
    });
  });

  test.describe('Hash Key Details', () => {
    test(`should display Hash key details ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getHashKeyData();

      // Create hash key via API
      await apiHelper.createHashKey(databaseId, keyData.keyName, keyData.fields);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify key details are displayed
      await expect(browserPage.keyDetails.keyName).toContainText(keyData.keyName);
      await expect(browserPage.keyDetails.hashFieldsGrid).toBeVisible();
    });

    test(`should show Add Fields button for Hash ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getHashKeyData();

      await apiHelper.createHashKey(databaseId, keyData.keyName, keyData.fields);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      await expect(browserPage.keyDetails.addFieldsButton).toBeVisible();
    });
  });

  // Note: Close key details panel test is skipped due to complex UI state management
  // The close button behavior varies depending on the panel state (collapsed vs expanded key list)
  // TODO: Investigate and implement proper close functionality test
});

