import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig } from '../../../test-data/databases';
import { getStringKeyData, TEST_KEY_PREFIX } from '../../../test-data/browser';
import { DatabaseInstance } from '../../../types';

/**
 * Value Formatters Tests
 *
 * Tests the ability to switch between different value display formats
 * in the Browser key details view.
 */
test.describe('Browser > Value Formatters', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    // Create a test database for all tests in this file
    const config = getStandaloneConfig({ name: 'test-formatters-db' });
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    // Clean up the test database
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ browserPage }) => {
    await browserPage.goto(database.id);
  });

  test.afterEach(async ({ apiHelper }) => {
    // Clean up test keys created during the test
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_KEY_PREFIX}*`);
  });

  test.describe('Format Selection', () => {
    test(`should display format dropdown ${Tags.SMOKE}`, async ({ browserPage, apiHelper }) => {
      const keyData = getStringKeyData({ value: '{"name":"test","value":123}' });

      // Create key via API
      await apiHelper.createStringKey(database.id, keyData.keyName, keyData.value);

      // Refresh and navigate to key
      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify format dropdown is visible
      await expect(browserPage.keyDetails.formatDropdown).toBeVisible();
    });

    test(`should switch to ASCII format ${Tags.SMOKE}`, async ({ browserPage, apiHelper }) => {
      const keyData = getStringKeyData({ value: 'Hello World' });

      await apiHelper.createStringKey(database.id, keyData.keyName, keyData.value);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Change format to ASCII
      await browserPage.keyDetails.changeValueFormat('ASCII');

      // Verify the format is changed
      const currentFormat = await browserPage.keyDetails.getValueFormat();
      expect(currentFormat).toBe('ASCII');
    });

    test(`should switch to HEX format ${Tags.SMOKE}`, async ({ browserPage, apiHelper }) => {
      const keyData = getStringKeyData({ value: 'test hex value' });

      await apiHelper.createStringKey(database.id, keyData.keyName, keyData.value);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Change format to HEX
      await browserPage.keyDetails.changeValueFormat('HEX');

      // Verify the format is changed
      const currentFormat = await browserPage.keyDetails.getValueFormat();
      expect(currentFormat).toBe('HEX');
    });

    test(`should switch to Binary format ${Tags.SMOKE}`, async ({ browserPage, apiHelper }) => {
      const keyData = getStringKeyData({ value: 'binary test' });

      await apiHelper.createStringKey(database.id, keyData.keyName, keyData.value);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Change format to Binary
      await browserPage.keyDetails.changeValueFormat('Binary');

      // Verify the format is changed
      const currentFormat = await browserPage.keyDetails.getValueFormat();
      expect(currentFormat).toBe('Binary');
    });

    test(`should switch to JSON format ${Tags.SMOKE}`, async ({ browserPage, apiHelper }) => {
      const keyData = getStringKeyData({ value: '{"valid":"json"}' });

      await apiHelper.createStringKey(database.id, keyData.keyName, keyData.value);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // First switch to ASCII to have a different format
      await browserPage.keyDetails.changeValueFormat('ASCII');

      // Then switch to JSON
      await browserPage.keyDetails.changeValueFormat('JSON');

      // Verify the format is changed
      const currentFormat = await browserPage.keyDetails.getValueFormat();
      expect(currentFormat).toBe('JSON');
    });
  });

  test.describe('Format Options', () => {
    test(`should show all format options in dropdown ${Tags.REGRESSION}`, async ({
      browserPage,
      apiHelper,
    }) => {
      const keyData = getStringKeyData();

      await apiHelper.createStringKey(database.id, keyData.keyName, keyData.value);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Click on format dropdown to open it
      await browserPage.keyDetails.formatDropdown.click();

      // Expected format options
      const expectedFormats = [
        'Unicode',
        'ASCII',
        'Binary',
        'HEX',
        'JSON',
        'Msgpack',
        'Pickle',
        'Protobuf',
        'PHP serialized',
        'Java serialized',
        'Vector 32-bit',
        'Vector 64-bit',
      ];

      // Verify each format option is visible
      for (const format of expectedFormats) {
        const option = browserPage.page.getByRole('option', { name: format });
        await expect(option).toBeVisible();
      }

      // Close dropdown
      await browserPage.page.keyboard.press('Escape');
    });
  });
});

