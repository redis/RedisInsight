import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';
import { faker } from '@faker-js/faker';

/**
 * Database Tags Tests (TEST_PLAN.md: 1.6 Database Tags)
 *
 * Tests for managing database tags - key-value pairs that help categorize databases.
 * Tags are managed via the "Manage Instance Tags" dialog accessible from the database list.
 */
test.describe('Database Tags', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    // Create a test database for all tests in this file
    const config = StandaloneConfigFactory.build({ name: 'test-tags-db' });
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    // Clean up the test database
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ databasesPage }) => {
    await databasesPage.goto();
  });

  test('should open tags dialog for a database', async ({ databasesPage }) => {
    const { tagsDialog, databaseList } = databasesPage;

    // Open tags manager for the test database
    await databaseList.openTagsManager(database.name);

    // Verify dialog is visible
    await tagsDialog.expectVisible();

    // Close the dialog
    await tagsDialog.close();
    await tagsDialog.expectHidden();
  });

  test('should add descriptive tags to a database', async ({ databasesPage }) => {
    const { tagsDialog, databaseList } = databasesPage;
    const tagKey = `env-${faker.string.alphanumeric(4)}`;
    const tagValue = 'production';

    // Open tags manager
    await databaseList.openTagsManager(database.name);

    // Add a tag
    await tagsDialog.addTag(tagKey, tagValue);

    // Verify Save button is enabled
    await expect(tagsDialog.saveButton).toBeEnabled();

    // Save the tags
    await tagsDialog.save();

    // Dialog should close after save
    await expect(tagsDialog.dialog).not.toBeVisible();

    // Re-open dialog to verify tag was saved
    await databaseList.openTagsManager(database.name);

    // Verify tag count is at least 1
    const tagCount = await tagsDialog.getTagCount();
    expect(tagCount).toBeGreaterThanOrEqual(1);

    // Clean up - delete the tag we added
    await tagsDialog.deleteTag(0);
    await tagsDialog.save();
  });

  test('should remove tags from a database', async ({ databasesPage }) => {
    const { tagsDialog, databaseList } = databasesPage;
    const tagKey = `temp-${faker.string.alphanumeric(4)}`;
    const tagValue = 'to-delete';

    // First, add a tag to delete
    await databaseList.openTagsManager(database.name);
    await tagsDialog.addTag(tagKey, tagValue);
    await tagsDialog.save();
    await expect(tagsDialog.dialog).not.toBeVisible();

    // Re-open and verify the tag exists
    await databaseList.openTagsManager(database.name);
    const initialCount = await tagsDialog.getTagCount();
    expect(initialCount).toBeGreaterThanOrEqual(1);

    // Delete the first tag
    await tagsDialog.deleteTag(0);

    // Save the changes
    await tagsDialog.save();
    await expect(tagsDialog.dialog).not.toBeVisible();

    // Re-open and verify tag count decreased
    await databaseList.openTagsManager(database.name);
    const finalCount = await tagsDialog.getTagCount();
    expect(finalCount).toBeLessThan(initialCount);

    await tagsDialog.close();
  });

  test('should cancel adding a tag without saving', async ({ databasesPage }) => {
    const { tagsDialog, databaseList } = databasesPage;
    const tagKey = `cancel-${faker.string.alphanumeric(4)}`;
    const tagValue = 'should-not-save';

    // Open tags manager and get initial count
    await databaseList.openTagsManager(database.name);
    const initialCount = await tagsDialog.getTagCount();

    // Add a tag but don't save
    await tagsDialog.addTag(tagKey, tagValue);

    // Cancel instead of saving
    await tagsDialog.cancel();
    await expect(tagsDialog.dialog).not.toBeVisible();

    // Re-open and verify tag was not saved
    await databaseList.openTagsManager(database.name);
    const finalCount = await tagsDialog.getTagCount();
    expect(finalCount).toBe(initialCount);

    await tagsDialog.close();
  });

  test('should persist tags after saving and reopening', async ({ databasesPage }) => {
    const { tagsDialog, databaseList } = databasesPage;
    const tagKey = `persist-${faker.string.alphanumeric(4)}`;
    const tagValue = `value-${faker.string.alphanumeric(4)}`;

    // Add and save a tag
    await databaseList.openTagsManager(database.name);
    await tagsDialog.addTag(tagKey, tagValue);
    await tagsDialog.save();
    await expect(tagsDialog.dialog).not.toBeVisible();

    // Navigate away and back (refresh the page)
    await databasesPage.goto();

    // Re-open tags dialog and verify tag persisted
    await databaseList.openTagsManager(database.name);
    const tagCount = await tagsDialog.getTagCount();
    expect(tagCount).toBeGreaterThanOrEqual(1);

    // Clean up - delete the tag
    await tagsDialog.deleteTag(0);
    await tagsDialog.save();
  });
});
