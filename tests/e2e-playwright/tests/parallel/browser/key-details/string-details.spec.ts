import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { StringKeyFactory, TEST_KEY_PREFIX } from 'e2eSrc/test-data/browser';
import { DatabaseInstance } from 'e2eSrc/types';

const parseTtl = (ttlText: string): number => {
  const match = ttlText.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

/**
 * Browser > Key Details - String Tests
 *
 * Tests for viewing and editing String keys via the Key Details panel:
 * value view/edit, rename, copy-on-hover, TTL view/edit/countdown,
 * and value format switching (Unicode/HEX/Binary).
 */
test.describe('Browser > Key Details - String', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    // Create a test database for all tests in this file
    const config = StandaloneConfigFactory.build({ name: 'test-key-details-string-db' });
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

  test('should view, edit, rename a String key and show copy-on-hover', async ({ apiHelper, browserPage }) => {
    // Seed: create the String key via API
    const keyData = StringKeyFactory.build();
    const newValue = `${keyData.value}-edited`;
    const newKeyName = `${TEST_KEY_PREFIX}string-renamed-${Date.now()}`;

    await apiHelper.createStringKey(database.id, keyData.keyName, keyData.value);

    // Open the key in the details panel
    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.keyDetails.waitForKeyDetails();

    // Verify the seeded value is displayed
    expect(await browserPage.keyDetails.getStringValue()).toBe(keyData.value);

    // Verify copy-key-name button appears on hover
    expect(await browserPage.keyDetails.isCopyKeyNameButtonVisible()).toBe(true);

    // Edit the value and verify it persists in both UI and Redis
    await browserPage.keyDetails.editStringValue(newValue);
    expect(await browserPage.keyDetails.getStringValue()).toBe(newValue);
    const persistedValue = await apiHelper.sendCommand(database.id, `GET ${keyData.keyName}`);
    expect(persistedValue).toBe(newValue);

    // Rename the key and verify the new name propagates to the Key List
    await browserPage.keyDetails.renameKey(newKeyName);
    await browserPage.keyList.searchKeys(newKeyName);
    await browserPage.expectKeyInList(newKeyName);
    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyNotInList(keyData.keyName);
  });

  test('should view, edit TTL and have the key expire after countdown', async ({ apiHelper, browserPage }) => {
    const keyData = StringKeyFactory.build();

    // Seed: create the key with no TTL
    await apiHelper.createStringKey(database.id, keyData.keyName, keyData.value);

    // Open the key in the details panel
    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.keyDetails.waitForKeyDetails();

    // Verify the initial TTL shows "No limit"
    expect(await browserPage.keyDetails.getTtlValue()).toMatch(/No limit/i);

    // Edit TTL to a short value and verify it is reflected in the panel
    await browserPage.keyDetails.editTtl('5');
    const editedTtl = parseTtl(await browserPage.keyDetails.getTtlValue());
    expect(editedTtl).toBeGreaterThan(0);
    expect(editedTtl).toBeLessThanOrEqual(5);

    // Verify the key counts down and disappears from the Key List once it expires
    await expect
      .poll(
        async () => {
          await browserPage.keyList.searchKeys(keyData.keyName);
          return browserPage.keyList.keyExists(keyData.keyName, 1000);
        },
        {
          timeout: 15000,
          intervals: [2000, 2000, 2000, 2000],
          message: 'Key should expire and disappear from the Key List after TTL',
        },
      )
      .toBe(false);
  });

  test('should change value format between Unicode, HEX and Binary', async ({ apiHelper, browserPage }) => {
    // Seed with deterministic ASCII so HEX bytes are predictable (h=0x68, i=0x69)
    const keyData = StringKeyFactory.build({ value: 'hi' });
    await apiHelper.createStringKey(database.id, keyData.keyName, keyData.value);

    // Open the key in the details panel
    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.keyDetails.waitForKeyDetails();

    // Verify default Unicode rendering shows the original text
    expect(await browserPage.keyDetails.getStringValue()).toBe('hi');

    // Switch to HEX and verify the value is rendered as hex bytes
    await browserPage.keyDetails.changeValueFormat('HEX');
    expect(await browserPage.keyDetails.getValueFormat()).toBe('HEX');
    const hexValue = (await browserPage.keyDetails.getStringValue()).toLowerCase();
    expect(hexValue).toContain('68');
    expect(hexValue).toContain('69');

    // Switch to Binary and verify the rendering differs from both Unicode and HEX
    await browserPage.keyDetails.changeValueFormat('Binary');
    expect(await browserPage.keyDetails.getValueFormat()).toBe('Binary');
    const binaryValue = await browserPage.keyDetails.getStringValue();
    expect(binaryValue).not.toBe('hi');
    expect(binaryValue.toLowerCase()).not.toBe(hexValue);

    // Round-trip back to Unicode and verify the original text is restored
    await browserPage.keyDetails.changeValueFormat('Unicode');
    expect(await browserPage.keyDetails.getValueFormat()).toBe('Unicode');
    expect(await browserPage.keyDetails.getStringValue()).toBe('hi');
  });
});
