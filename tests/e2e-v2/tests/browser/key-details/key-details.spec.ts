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

  test.beforeEach(async ({ createBrowserPage }) => {
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

      // Wait for field to be added (use polling to avoid race condition)
      await expect(async () => {
        const fieldExists = await browserPage.keyDetails.hashFieldExists(newFieldName);
        expect(fieldExists).toBe(true);
      }).toPass({ timeout: 10000 });
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

      // Verify value was updated (use polling to avoid race condition)
      await expect(async () => {
        const value = await browserPage.keyDetails.getHashFieldValue('editableField');
        expect(value).toContain(newValue);
      }).toPass({ timeout: 10000 });
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

    test(`should search hash fields ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getHashKeyData({
        fields: [
          { field: 'uniqueSearchField', value: 'value1' },
          { field: 'anotherField', value: 'value2' },
          { field: 'thirdField', value: 'value3' },
        ],
      });

      await apiHelper.createHashKey(databaseId, keyData.keyName, keyData.fields);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify all fields are initially visible
      await expect(async () => {
        const allFieldsExist = await browserPage.keyDetails.hashFieldExists('uniqueSearchField') &&
          await browserPage.keyDetails.hashFieldExists('anotherField') &&
          await browserPage.keyDetails.hashFieldExists('thirdField');
        expect(allFieldsExist).toBe(true);
      }).toPass({ timeout: 10000 });

      // Search for a specific field
      await browserPage.keyDetails.searchHashFields('uniqueSearchField');

      // Verify only matching field is shown (use polling to handle async search)
      await expect(async () => {
        const searchableExists = await browserPage.keyDetails.hashFieldExists('uniqueSearchField');
        const otherFieldHidden = !(await browserPage.keyDetails.hashFieldExists('anotherField'));
        expect(searchableExists).toBe(true);
        expect(otherFieldHidden).toBe(true);
      }).toPass({ timeout: 10000 });
    });

    test(`should show no results message when search has no matches ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getHashKeyData({ fields: [{ field: 'existingField', value: 'value' }] });

      await apiHelper.createHashKey(databaseId, keyData.keyName, keyData.fields);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Search for non-existent field
      await browserPage.keyDetails.searchHashFields('nonexistent');

      // Verify no results message is shown (use polling to handle async search)
      await expect(async () => {
        const noResults = await browserPage.keyDetails.isNoResultsMessageVisible();
        expect(noResults).toBe(true);
      }).toPass({ timeout: 10000 });
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

      // Verify element was added (use polling to avoid race condition)
      await expect(async () => {
        const elements = await browserPage.keyDetails.getListElements();
        expect(elements).toContain('new-element');
      }).toPass({ timeout: 10000 });
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

    test(`should search list by index ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getListKeyData({
        elements: ['element-at-0', 'element-at-1', 'element-at-2', 'element-at-3'],
      });

      await apiHelper.createListKey(databaseId, keyData.keyName, keyData.elements);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify all elements are initially visible
      await expect(async () => {
        const elementCount = await browserPage.keyDetails.getListElementCount();
        expect(elementCount).toBe(4);
      }).toPass({ timeout: 10000 });

      // Search for a specific index
      await browserPage.keyDetails.searchListByIndex('2');

      // Verify only the element at index 2 is shown
      await expect(async () => {
        const elementExists = await browserPage.keyDetails.listElementExists('element-at-2');
        const otherElementHidden = !(await browserPage.keyDetails.listElementExists('element-at-0'));
        expect(elementExists).toBe(true);
        expect(otherElementHidden).toBe(true);
      }).toPass({ timeout: 10000 });
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

    test(`should search set members ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getSetKeyData({
        members: ['uniqueSearchMember', 'anotherMember', 'thirdMember'],
      });

      await apiHelper.createSetKey(databaseId, keyData.keyName, keyData.members);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify all members are initially visible
      await expect(async () => {
        const allMembersExist = await browserPage.keyDetails.setMemberExists('uniqueSearchMember') &&
          await browserPage.keyDetails.setMemberExists('anotherMember') &&
          await browserPage.keyDetails.setMemberExists('thirdMember');
        expect(allMembersExist).toBe(true);
      }).toPass({ timeout: 10000 });

      // Search for a specific member
      await browserPage.keyDetails.searchSetMembers('uniqueSearchMember');

      // Verify only matching member is shown
      await expect(async () => {
        const searchableExists = await browserPage.keyDetails.setMemberExists('uniqueSearchMember');
        const otherMemberHidden = !(await browserPage.keyDetails.setMemberExists('anotherMember'));
        expect(searchableExists).toBe(true);
        expect(otherMemberHidden).toBe(true);
      }).toPass({ timeout: 10000 });
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

      // Wait for member count to increase (use polling to avoid race condition)
      await expect(async () => {
        const memberCount = await browserPage.keyDetails.getZSetMemberCount();
        expect(memberCount).toBe(2);
      }).toPass({ timeout: 10000 });
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

    test(`should edit sorted set member score ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getZSetKeyData({
        members: [
          { member: 'member-a', score: '10' },
          { member: 'member-b', score: '20' },
        ],
      });
      const newScore = '99.5';

      await apiHelper.createZSetKey(databaseId, keyData.keyName, keyData.members);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Edit the score of the first member (index 0)
      await browserPage.keyDetails.editZSetMemberScore(0, newScore);

      // Verify the score was updated (use polling to avoid race condition)
      await expect(async () => {
        const score = await browserPage.keyDetails.getZSetMemberScore(0);
        expect(score).toContain(newScore);
      }).toPass({ timeout: 10000 });
    });

    test(`should search sorted set members ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getZSetKeyData({
        members: [
          { member: 'uniqueSearchZMember', score: '10' },
          { member: 'anotherZMember', score: '20' },
          { member: 'thirdZMember', score: '30' },
        ],
      });

      await apiHelper.createZSetKey(databaseId, keyData.keyName, keyData.members);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify all members are initially visible
      await expect(async () => {
        const allMembersExist = await browserPage.keyDetails.zsetMemberExists('uniqueSearchZMember') &&
          await browserPage.keyDetails.zsetMemberExists('anotherZMember') &&
          await browserPage.keyDetails.zsetMemberExists('thirdZMember');
        expect(allMembersExist).toBe(true);
      }).toPass({ timeout: 10000 });

      // Search for a specific member
      await browserPage.keyDetails.searchZSetMembers('uniqueSearchZMember');

      // Verify only matching member is shown
      await expect(async () => {
        const searchableExists = await browserPage.keyDetails.zsetMemberExists('uniqueSearchZMember');
        const otherMemberHidden = !(await browserPage.keyDetails.zsetMemberExists('anotherZMember'));
        expect(searchableExists).toBe(true);
        expect(otherMemberHidden).toBe(true);
      }).toPass({ timeout: 10000 });
    });

    test(`should sort sorted set by score ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getZSetKeyData({
        members: [
          { member: 'member-a', score: '10' },
          { member: 'member-b', score: '5' },
          { member: 'member-c', score: '20' },
        ],
      });

      await apiHelper.createZSetKey(databaseId, keyData.keyName, keyData.members);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify initial sort order is ascending
      await expect(async () => {
        const sortOrder = await browserPage.keyDetails.getZSetSortOrder();
        expect(sortOrder).toBe('asc');
      }).toPass({ timeout: 10000 });

      // Get initial scores (should be ascending: 5, 10, 20)
      const initialScores = await browserPage.keyDetails.getZSetScores();
      expect(initialScores).toEqual(['5', '10', '20']);

      // Toggle sort order to descending
      await browserPage.keyDetails.toggleZSetSortOrder();

      // Verify sort order changed to descending
      await expect(async () => {
        const sortOrder = await browserPage.keyDetails.getZSetSortOrder();
        expect(sortOrder).toBe('desc');
      }).toPass({ timeout: 10000 });

      // Verify scores are now in descending order (20, 10, 5)
      await expect(async () => {
        const scores = await browserPage.keyDetails.getZSetScores();
        expect(scores).toEqual(['20', '10', '5']);
      }).toPass({ timeout: 10000 });
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

      // Wait for initial entries to load (stream is created with 1 entry)
      let initialCount = 0;
      await expect(async () => {
        const initialIds = await browserPage.keyDetails.getStreamEntryIds();
        initialCount = initialIds.length;
        expect(initialCount).toBeGreaterThan(0);
      }).toPass({ timeout: 10000 });

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

    test(`should add consumer group ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getStreamKeyData();
      const groupName = `test-group-${Date.now()}`;

      await apiHelper.createStreamKey(databaseId, keyData.keyName, keyData.fields);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Add consumer group
      await browserPage.keyDetails.addConsumerGroup(groupName);

      // Verify consumer group is visible
      const isVisible = await browserPage.keyDetails.isConsumerGroupVisible(groupName);
      expect(isVisible).toBe(true);
    });

    test(`should show no consumer groups message ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getStreamKeyData();

      await apiHelper.createStreamKey(databaseId, keyData.keyName, keyData.fields);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Switch to consumer groups tab
      await browserPage.keyDetails.clickConsumerGroupsTab();

      // Verify no consumer groups message is visible
      const isMessageVisible = await browserPage.keyDetails.isNoConsumerGroupsMessageVisible();
      expect(isMessageVisible).toBe(true);
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

      // Wait for field count to increase (use polling to avoid race condition)
      await expect(async () => {
        const newCount = await browserPage.keyDetails.getJsonFieldCount();
        expect(newCount).toBe(initialCount + 1);
      }).toPass({ timeout: 10000 });
    });

    test(`should edit JSON value ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const keyData = getJsonKeyData({
        value: JSON.stringify({ field1: 'originalValue', field2: 'anotherValue' }),
      });
      const newValue = '"updatedValue"';

      await apiHelper.createJsonKey(databaseId, keyData.keyName, keyData.value);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Edit the first JSON value (index 0)
      await browserPage.keyDetails.editJsonValue(0, newValue);

      // Verify the value was updated (use polling to avoid race condition)
      await expect(async () => {
        const value = await browserPage.keyDetails.getJsonValue(0);
        expect(value).toContain('updatedValue');
      }).toPass({ timeout: 10000 });
    });

    test(`should remove JSON field ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getJsonKeyData({
        value: JSON.stringify({ field1: 'value1', field2: 'value2', field3: 'value3' }),
      });

      await apiHelper.createJsonKey(databaseId, keyData.keyName, keyData.value);

      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Get initial field count
      const initialCount = await browserPage.keyDetails.getJsonFieldCount();
      expect(initialCount).toBe(3);

      // Remove a field
      await browserPage.keyDetails.removeJsonField();

      // Verify field count decreased (use polling to avoid race condition)
      await expect(async () => {
        const newCount = await browserPage.keyDetails.getJsonFieldCount();
        expect(newCount).toBe(initialCount - 1);
      }).toPass({ timeout: 10000 });
    });
  });

  test.describe('TTL Management', () => {
    test(`should view TTL value ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getStringKeyData();

      // Create key via API
      await apiHelper.createStringKey(databaseId, keyData.keyName, keyData.value);

      // Refresh key list and click on the key
      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify TTL is displayed as "No limit" for keys without TTL
      const ttlText = await browserPage.keyDetails.getTtlValue();
      expect(ttlText).toContain('No limit');
    });

    test(`should edit TTL value ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getStringKeyData();
      const newTtl = '120';

      // Create key via API
      await apiHelper.createStringKey(databaseId, keyData.keyName, keyData.value);

      // Refresh key list and click on the key
      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Edit TTL
      await browserPage.keyDetails.editTtl(newTtl);

      // Verify TTL was updated (use polling to avoid race condition)
      await expect(async () => {
        const ttlText = await browserPage.keyDetails.getTtlValue();
        // TTL should now show a number (may be slightly less than 120 due to time passing)
        expect(ttlText).not.toContain('No limit');
      }).toPass({ timeout: 10000 });
    });
  });

  test.describe('Value Format', () => {
    test(`should change value format ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getStringKeyData();

      // Create key via API
      await apiHelper.createStringKey(databaseId, keyData.keyName, keyData.value);

      // Refresh key list and click on the key
      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify default format is Unicode
      const initialFormat = await browserPage.keyDetails.getValueFormat();
      expect(initialFormat).toContain('Unicode');

      // Change format to HEX
      await browserPage.keyDetails.changeValueFormat('HEX');

      // Verify format changed
      await expect(async () => {
        const newFormat = await browserPage.keyDetails.getValueFormat();
        expect(newFormat).toContain('HEX');
      }).toPass({ timeout: 5000 });
    });
  });

  test.describe('Copy Key Name', () => {
    test(`should show copy key name button on hover ${Tags.REGRESSION}`, async ({ apiHelper }) => {
      const keyData = getStringKeyData();

      // Create key via API
      await apiHelper.createStringKey(databaseId, keyData.keyName, keyData.value);

      // Refresh key list and click on the key
      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(keyData.keyName);
      await browserPage.keyList.clickKey(keyData.keyName);
      await browserPage.keyDetails.waitForKeyDetails();

      // Verify copy button appears on hover
      const isVisible = await browserPage.keyDetails.isCopyKeyNameButtonVisible();
      expect(isVisible).toBe(true);
    });
  });
});

