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

    test(`should edit String value ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getStringKeyData({ value: 'original-value' });
      const newValue = 'updated-value-after-edit';

      // Create key with original value
      await apiHelper.createStringKey(databaseId, keyData.keyName, keyData.value);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Edit the value
      await browserPage.keyDetails.editStringValue(newValue);

      // Verify the value was updated
      const updatedValue = await browserPage.keyDetails.getStringValue();
      expect(updatedValue).toContain(newValue);
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

    test(`should add hash field ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getHashKeyData({ fields: [{ field: 'existingField', value: 'existingValue' }] });
      const newFieldName = 'newField';
      const newFieldValue = 'newValue';

      await apiHelper.createHashKey(databaseId, keyData.keyName, keyData.fields);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Add new field
      await browserPage.keyDetails.addHashField(newFieldName, newFieldValue);

      // Verify field was added
      const fieldExists = await browserPage.keyDetails.hashFieldExists(newFieldName);
      expect(fieldExists).toBe(true);
    });

    test(`should edit hash field ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getHashKeyData({ fields: [{ field: 'editableField', value: 'originalValue' }] });
      const newValue = 'updatedValue';

      await apiHelper.createHashKey(databaseId, keyData.keyName, keyData.fields);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Edit the field
      await browserPage.keyDetails.editHashField('editableField', newValue);

      // Verify value was updated
      const value = await browserPage.keyDetails.getHashFieldValue('editableField');
      expect(value).toContain(newValue);
    });

    test(`should delete hash field ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getHashKeyData({ fields: [{ field: 'fieldToDelete', value: 'value' }, { field: 'keepField', value: 'keepValue' }] });

      await apiHelper.createHashKey(databaseId, keyData.keyName, keyData.fields);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Delete the field
      await browserPage.keyDetails.deleteHashField('fieldToDelete');

      // Verify field was deleted
      const fieldExists = await browserPage.keyDetails.hashFieldExists('fieldToDelete');
      expect(fieldExists).toBe(false);
    });
  });

  test.describe('List Key Details', () => {
    test(`should display List key details ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getListKeyData();

      // Create list key via API
      await apiHelper.createListKey(databaseId, keyData.keyName, keyData.elements);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify key details are displayed
      await expect(browserPage.keyDetails.keyName).toContainText(keyData.keyName);
      const keyType = await browserPage.keyDetails.getKeyType();
      expect(keyType.toLowerCase()).toBe('list');
    });

    test(`should show list elements ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getListKeyData({ elements: ['element-1', 'element-2', 'element-3'] });

      await apiHelper.createListKey(databaseId, keyData.keyName, keyData.elements);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify elements are displayed
      const elementCount = await browserPage.keyDetails.getListElementCount();
      expect(elementCount).toBe(3);
    });

    test(`should show Add Elements button for List ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getListKeyData();

      await apiHelper.createListKey(databaseId, keyData.keyName, keyData.elements);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      await expect(browserPage.keyDetails.addElementButton).toBeVisible();
    });

    test(`should add list element ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getListKeyData({ elements: ['existing-element'] });

      await apiHelper.createListKey(databaseId, keyData.keyName, keyData.elements);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Add new element to tail
      await browserPage.keyDetails.addListElement('new-element');

      // Verify element was added
      const elements = await browserPage.keyDetails.getListElements();
      expect(elements).toContain('new-element');
    });

    test(`should edit list element ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getListKeyData({ elements: ['original-value'] });

      await apiHelper.createListKey(databaseId, keyData.keyName, keyData.elements);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Edit element at index 0
      await browserPage.keyDetails.editListElement(0, 'edited-value');

      // Verify element was edited (use polling to avoid race condition)
      await expect(async () => {
        const elementValue = await browserPage.keyDetails.getListElementByIndex(0);
        expect(elementValue).toBe('edited-value');
      }).toPass({ timeout: 10000 });
    });

    test(`should remove list element ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getListKeyData({ elements: ['element-1', 'element-2', 'element-3'] });

      await apiHelper.createListKey(databaseId, keyData.keyName, keyData.elements);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Remove 1 element from tail
      await browserPage.keyDetails.removeListElements(1);

      // Verify element count decreased
      const elementCount = await browserPage.keyDetails.getListElementCount();
      expect(elementCount).toBe(2);
    });
  });

  test.describe('Set Key Details', () => {
    test(`should display Set key details ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getSetKeyData();

      // Create set key via API
      await apiHelper.createSetKey(databaseId, keyData.keyName, keyData.members);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify key details are displayed
      await expect(browserPage.keyDetails.keyName).toContainText(keyData.keyName);
      const keyType = await browserPage.keyDetails.getKeyType();
      expect(keyType.toLowerCase()).toBe('set');
    });

    test(`should show set members ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getSetKeyData({ members: ['member-1', 'member-2', 'member-3'] });

      await apiHelper.createSetKey(databaseId, keyData.keyName, keyData.members);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify members are displayed
      const memberCount = await browserPage.keyDetails.getSetMemberCount();
      expect(memberCount).toBe(3);
    });

    test(`should show Add Members button for Set ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getSetKeyData();

      await apiHelper.createSetKey(databaseId, keyData.keyName, keyData.members);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      await expect(browserPage.keyDetails.addMembersButton).toBeVisible();
    });

    test(`should add set member ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getSetKeyData({ members: ['existing-member'] });
      const newMember = 'new-member-' + Date.now();

      await apiHelper.createSetKey(databaseId, keyData.keyName, keyData.members);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Add new member
      await browserPage.keyDetails.addSetMember(newMember);

      // Verify member count increased
      const memberCount = await browserPage.keyDetails.getSetMemberCount();
      expect(memberCount).toBe(2);
    });

    test(`should remove set member ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const memberToRemove = 'member-to-remove';
      const keyData = getSetKeyData({ members: [memberToRemove, 'member-to-keep'] });

      await apiHelper.createSetKey(databaseId, keyData.keyName, keyData.members);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Remove member
      await browserPage.keyDetails.removeSetMember(memberToRemove);

      // Verify member count decreased
      const memberCount = await browserPage.keyDetails.getSetMemberCount();
      expect(memberCount).toBe(1);
    });
  });

  test.describe('Sorted Set (ZSet) Key Details', () => {
    test(`should display Sorted Set key details ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getZSetKeyData();

      // Create zset key via API
      await apiHelper.createZSetKey(databaseId, keyData.keyName, keyData.members);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify key details are displayed
      await expect(browserPage.keyDetails.keyName).toContainText(keyData.keyName);
      const keyType = await browserPage.keyDetails.getKeyType();
      expect(keyType.toLowerCase()).toBe('sorted set');
    });

    test(`should show sorted set members with scores ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getZSetKeyData({
        members: [
          { member: 'member-a', score: '10' },
          { member: 'member-b', score: '20' },
          { member: 'member-c', score: '30' },
        ],
      });

      await apiHelper.createZSetKey(databaseId, keyData.keyName, keyData.members);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify members are displayed
      const memberCount = await browserPage.keyDetails.getZSetMemberCount();
      expect(memberCount).toBe(3);
    });

    test(`should show Add Members button for Sorted Set ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getZSetKeyData();

      await apiHelper.createZSetKey(databaseId, keyData.keyName, keyData.members);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      await expect(browserPage.keyDetails.addMembersButton).toBeVisible();
    });

    test(`should add sorted set member with score ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getZSetKeyData({
        members: [{ member: 'existing-member', score: '10' }],
      });
      const newMember = 'new-member-' + Date.now();
      const newScore = '50';

      await apiHelper.createZSetKey(databaseId, keyData.keyName, keyData.members);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Add new member
      await browserPage.keyDetails.addZSetMember(newMember, newScore);

      // Verify member count increased
      const memberCount = await browserPage.keyDetails.getZSetMemberCount();
      expect(memberCount).toBe(2);
    });

    test(`should remove sorted set member ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const memberToRemove = 'member-to-remove';
      const keyData = getZSetKeyData({
        members: [
          { member: memberToRemove, score: '10' },
          { member: 'member-to-keep', score: '20' },
        ],
      });

      await apiHelper.createZSetKey(databaseId, keyData.keyName, keyData.members);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Remove member
      await browserPage.keyDetails.removeZSetMember(memberToRemove);

      // Verify member count decreased
      const memberCount = await browserPage.keyDetails.getZSetMemberCount();
      expect(memberCount).toBe(1);
    });
  });

  test.describe('Stream Key Details', () => {
    test(`should display Stream key details ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getStreamKeyData();

      // Create stream key via API
      await apiHelper.createStreamKey(databaseId, keyData.keyName, keyData.fields);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify key details are displayed
      await expect(browserPage.keyDetails.keyName).toContainText(keyData.keyName);
      const keyType = await browserPage.keyDetails.getKeyType();
      expect(keyType.toLowerCase()).toBe('stream');
    });

    test(`should show Stream Data tab ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getStreamKeyData();

      await apiHelper.createStreamKey(databaseId, keyData.keyName, keyData.fields);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify Stream Data tab is visible and selected
      await expect(browserPage.keyDetails.streamDataTab).toBeVisible();
      const isSelected = await browserPage.keyDetails.isStreamDataTabSelected();
      expect(isSelected).toBe(true);
    });

    test(`should show Consumer Groups tab ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getStreamKeyData();

      await apiHelper.createStreamKey(databaseId, keyData.keyName, keyData.fields);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify Consumer Groups tab is visible
      await expect(browserPage.keyDetails.consumerGroupsTab).toBeVisible();
    });

    test(`should show New Entry button for Stream ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getStreamKeyData();

      await apiHelper.createStreamKey(databaseId, keyData.keyName, keyData.fields);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      await expect(browserPage.keyDetails.newEntryButton).toBeVisible();
    });

    test(`should add stream entry ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getStreamKeyData();

      await apiHelper.createStreamKey(databaseId, keyData.keyName, keyData.fields);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Get initial entry count
      const initialIds = await browserPage.keyDetails.getStreamEntryIds();
      const initialCount = initialIds.length;

      // Add new entry
      await browserPage.keyDetails.addStreamEntry('new-field', 'new-value');

      // Wait for entry count to increase (use polling to avoid race condition)
      await expect(async () => {
        const newIds = await browserPage.keyDetails.getStreamEntryIds();
        expect(newIds.length).toBe(initialCount + 1);
      }).toPass({ timeout: 10000 });
    });

    test(`should remove stream entry ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getStreamKeyData();

      await apiHelper.createStreamKey(databaseId, keyData.keyName, keyData.fields);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Get entry IDs
      const entryIds = await browserPage.keyDetails.getStreamEntryIds();
      expect(entryIds.length).toBeGreaterThan(0);

      // Remove the first entry
      const entryToRemove = entryIds[0];
      await browserPage.keyDetails.removeStreamEntry(entryToRemove);

      // Verify entry count decreased
      const newIds = await browserPage.keyDetails.getStreamEntryIds();
      expect(newIds.length).toBe(entryIds.length - 1);
    });
  });

  test.describe('JSON Key Details', () => {
    test(`should display JSON key details ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getJsonKeyData();

      // Create JSON key via API
      await apiHelper.createJsonKey(databaseId, keyData.keyName, keyData.value);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify key details are displayed
      await expect(browserPage.keyDetails.keyName).toContainText(keyData.keyName);
      const keyType = await browserPage.keyDetails.getKeyType();
      expect(keyType.toLowerCase()).toBe('json');
    });

    test(`should show JSON content ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getJsonKeyData({
        value: JSON.stringify({ name: 'test', value: 123 }),
      });

      await apiHelper.createJsonKey(databaseId, keyData.keyName, keyData.value);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify JSON content is visible
      const isVisible = await browserPage.keyDetails.isJsonContentVisible();
      expect(isVisible).toBe(true);
    });

    test(`should show Add field button for JSON ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getJsonKeyData();

      await apiHelper.createJsonKey(databaseId, keyData.keyName, keyData.value);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      await expect(browserPage.keyDetails.addJsonFieldButton).toBeVisible();
    });

    test(`should add JSON field ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getJsonKeyData({
        value: JSON.stringify({ existing: 'value' }),
      });

      await apiHelper.createJsonKey(databaseId, keyData.keyName, keyData.value);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Get initial field count
      const initialCount = await browserPage.keyDetails.getJsonFieldCount();

      // Add new field - key must be wrapped in quotes, value must be valid JSON
      await browserPage.keyDetails.addJsonField('"newKey"', '"newValue"');

      // Verify field count increased
      const newCount = await browserPage.keyDetails.getJsonFieldCount();
      expect(newCount).toBe(initialCount + 1);
    });
  });
});

