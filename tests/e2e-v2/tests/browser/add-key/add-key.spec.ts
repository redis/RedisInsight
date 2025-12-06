import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig } from '../../../test-data/databases';
import {
  getStringKeyData,
  getHashKeyData,
  getListKeyData,
  getSetKeyData,
  getZSetKeyData,
  getStreamKeyData,
  getJsonKeyData,
  TEST_KEY_PREFIX,
} from '../../../test-data/browser';
import { BrowserPage } from '../../../pages';

/**
 * Browser > Add Key Tests
 *
 * Tests for adding different key types via the Add Key dialog
 */
test.describe('Browser > Add Key', () => {
  let databaseId: string;
  let browserPage: BrowserPage;

  test.beforeAll(async ({ apiHelper }) => {
    // Create a test database for all tests in this file
    const config = getStandaloneConfig({ name: 'test-add-key-db' });
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

  test(`should add a String key ${Tags.SMOKE} ${Tags.CRITICAL}`, async () => {
    const keyData = getStringKeyData();

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

  test(`should add a Hash key ${Tags.SMOKE} ${Tags.CRITICAL}`, async () => {
    const keyData = getHashKeyData();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('Hash');
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.fillHashField(keyData.fields[0].field, keyData.fields[0].value);
    await browserPage.addKeyDialog.clickAddKey();

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyInList(keyData.keyName);
  });

  test(`should add a List key ${Tags.SMOKE}`, async () => {
    const keyData = getListKeyData();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('List');
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.fillListElement(keyData.elements[0]);
    await browserPage.addKeyDialog.clickAddKey();

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyInList(keyData.keyName);
  });

  test(`should add a Set key ${Tags.SMOKE}`, async () => {
    const keyData = getSetKeyData();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('Set');
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.fillSetMember(keyData.members[0]);
    await browserPage.addKeyDialog.clickAddKey();

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyInList(keyData.keyName);
  });

  test(`should add a Sorted Set key ${Tags.SMOKE}`, async () => {
    const keyData = getZSetKeyData();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('Sorted Set');
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.fillZSetMember(keyData.members[0].member, keyData.members[0].score);
    await browserPage.addKeyDialog.clickAddKey();

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyInList(keyData.keyName);
  });

  test(`should add a Stream key ${Tags.SMOKE}`, async () => {
    const keyData = getStreamKeyData();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('Stream');
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.fillStreamField(keyData.fields[0].field, keyData.fields[0].value);
    await browserPage.addKeyDialog.clickAddKey();

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyInList(keyData.keyName);
  });

  test(`should add a JSON key ${Tags.SMOKE}`, async () => {
    const keyData = getJsonKeyData();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('JSON');
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.fillJsonValue(keyData.value as string);
    await browserPage.addKeyDialog.clickAddKey();

    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.expectKeyInList(keyData.keyName);
  });

  test(`should show Add Key button disabled when key name is empty ${Tags.REGRESSION}`, async () => {
    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.selectKeyType('String');
    await browserPage.addKeyDialog.fillStringValue('some value');

    // Key name is empty, button should be disabled
    await browserPage.addKeyDialog.expectAddKeyDisabled();
  });

  test(`should cancel adding a key ${Tags.REGRESSION}`, async () => {
    const keyData = getStringKeyData();

    await browserPage.openAddKeyDialog();
    await browserPage.addKeyDialog.fillKeyName(keyData.keyName);
    await browserPage.addKeyDialog.clickCancel();

    // Dialog should be closed
    const isVisible = await browserPage.addKeyDialog.isVisible();
    expect(isVisible).toBe(false);
  });
});

