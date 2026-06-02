import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import {
  StringKeyFactory,
  HashKeyFactory,
  ListKeyFactory,
  SetKeyFactory,
  ZSetKeyFactory,
  StreamKeyFactory,
  JsonKeyFactory,
  TEST_KEY_PREFIX,
} from 'e2eSrc/test-data/browser';
import { DatabaseInstance } from 'e2eSrc/types';

/**
 * Browser > Add Key Tests
 *
 * Tests for adding different key types via the Add Key dialog
 */
test.describe('Browser > Add Key', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    // Create a test database for all tests in this file
    const config = StandaloneConfigFactory.build({ name: 'test-add-key-db' });
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

  test(`should add a String key`, async ({ browserPage }) => {
    const keyData = StringKeyFactory.build();

    // Open Add Key dialog
    await browserPage.openAddKeyDialog();

    // Select String type
    await browserPage.addKeyDialog.selectKeyType('String');

    // Fill key name and value
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.fillStringValue(keyData.value);

    // Add the key
    await browserPage.addKeyDialog.clickAddKey();

    // Verify key appears in the list
    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyInList(keyData.keyName);
  });

  test(`should add a Hash key`, async ({ browserPage }) => {
    const keyData = HashKeyFactory.build();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('Hash');
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.fillHashField(keyData.fields[0].field, keyData.fields[0].value);
    await browserPage.addKeyDialog.clickAddKey();

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyInList(keyData.keyName);
  });

  test(`should add a List key`, async ({ browserPage }) => {
    const keyData = ListKeyFactory.build();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('List');
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.fillListElement(keyData.elements[0]);
    await browserPage.addKeyDialog.clickAddKey();

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyInList(keyData.keyName);
  });

  test(`should add a Set key`, async ({ browserPage }) => {
    const keyData = SetKeyFactory.build();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('Set');
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.fillSetMember(keyData.members[0]);
    await browserPage.addKeyDialog.clickAddKey();

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyInList(keyData.keyName);
  });

  test(`should add a Sorted Set key`, async ({ browserPage }) => {
    const keyData = ZSetKeyFactory.build();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('Sorted Set');
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.fillZSetMember(keyData.members[0].member, keyData.members[0].score);
    await browserPage.addKeyDialog.clickAddKey();

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyInList(keyData.keyName);
  });

  test(`should add a Stream key`, async ({ browserPage }) => {
    const keyData = StreamKeyFactory.build();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('Stream');
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.fillStreamField(keyData.fields[0].field, keyData.fields[0].value);
    await browserPage.addKeyDialog.clickAddKey();

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyInList(keyData.keyName);
  });

  test(`should add a JSON key`, async ({ browserPage }) => {
    const keyData = JsonKeyFactory.build();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('JSON');
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.fillJsonValue(keyData.value as string);
    await browserPage.addKeyDialog.clickAddKey();

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyInList(keyData.keyName);
  });

  test(`should show Add Key button disabled when key name is empty`, async ({ browserPage }) => {
    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('String');
    await browserPage.addKeyDialog.fillStringValue('some value');

    // Key name is empty, button should be disabled
    await browserPage.addKeyDialog.expectAddKeyDisabled();
  });

  test(`should cancel adding a key`, async ({ browserPage }) => {
    const keyData = StringKeyFactory.build();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.clickCancel();

    // Dialog should be closed
    const isVisible = await browserPage.addKeyDialog.isVisible();
    expect(isVisible).toBe(false);
  });

  test(`should add a key with TTL`, async ({ browserPage }) => {
    const keyData = StringKeyFactory.build();
    const ttlSeconds = '60';

    // Open Add Key dialog
    await browserPage.openAddKeyDialog();

    // Select String type
    await browserPage.addKeyDialog.selectKeyType('String');

    // Fill key name, value, and TTL
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.fillStringValue(keyData.value);
    await browserPage.addKeyDialog.fillTtl(ttlSeconds);

    // Add the key
    await browserPage.addKeyDialog.clickAddKey();

    // Verify key appears in the list
    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyInList(keyData.keyName);

    // Click on the key to view details and verify TTL is set
    await browserPage.keyList.clickKey(keyData.keyName);
    await expect(browserPage.keyDetails.ttlValue).toBeVisible();
    // TTL should be less than or equal to 60 seconds (it may have decreased)
    const ttlText = await browserPage.keyDetails.ttlValue.textContent();
    expect(ttlText).not.toBe('No limit');
  });
});
