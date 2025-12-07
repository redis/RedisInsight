import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig } from '../../../test-data/databases';

/**
 * Database Tags Tests
 *
 * Tests for adding, editing, and removing descriptive tags on databases.
 * Tags are key-value pairs that help categorize databases.
 */
test.describe('Database Tags', () => {
  test(`should open tags dialog for a database ${Tags.SMOKE}`, async ({
    databasesPage,
    apiHelper,
  }) => {
    // Create a test database
    const config = getStandaloneConfig({ name: 'test-tags-open' });
    const db = await apiHelper.createDatabase(config);

    try {
      // Navigate to databases page
      await databasesPage.goto();

      // Search for the database to find it
      await databasesPage.databaseList.search(db.name);
      await databasesPage.databaseList.expectDatabaseVisible(db.name);

      // Open tags manager
      await databasesPage.databaseList.openTagsManager(db.name);

      // Verify tags dialog is visible
      await databasesPage.tagsDialog.expectVisible();

      // Verify dialog elements
      await expect(databasesPage.tagsDialog.addTagButton).toBeVisible();
      await expect(databasesPage.tagsDialog.cancelButton).toBeVisible();
      await expect(databasesPage.tagsDialog.saveButton).toBeVisible();
    } finally {
      await apiHelper.deleteDatabase(db.id);
    }
  });

  test(`should add a tag to a database ${Tags.SMOKE}`, async ({
    databasesPage,
    apiHelper,
  }) => {
    // Create a test database
    const config = getStandaloneConfig({ name: 'test-tags-add' });
    const db = await apiHelper.createDatabase(config);

    try {
      // Navigate to databases page
      await databasesPage.goto();

      // Search for the database
      await databasesPage.databaseList.search(db.name);
      await databasesPage.databaseList.expectDatabaseVisible(db.name);

      // Open tags manager
      await databasesPage.databaseList.openTagsManager(db.name);
      await databasesPage.tagsDialog.waitForVisible();

      // Add a tag
      await databasesPage.tagsDialog.addTag('environment', 'development');

      // Verify save button is enabled
      expect(await databasesPage.tagsDialog.isSaveEnabled()).toBe(true);

      // Save the tag
      await databasesPage.tagsDialog.save();

      // Re-search to refresh the view
      await databasesPage.databaseList.clearSearch();
      await databasesPage.databaseList.search(db.name);
      await databasesPage.databaseList.expectDatabaseVisible(db.name);

      // Verify the tag is displayed in the database list
      // The Tags column should now show the tag
      const row = databasesPage.databaseList.getRow(db.name);
      await expect(row).toContainText('environment');
    } finally {
      await apiHelper.deleteDatabase(db.id);
    }
  });

  test(`should cancel adding a tag ${Tags.REGRESSION}`, async ({
    databasesPage,
    apiHelper,
  }) => {
    // Create a test database
    const config = getStandaloneConfig({ name: 'test-tags-cancel' });
    const db = await apiHelper.createDatabase(config);

    try {
      // Navigate to databases page
      await databasesPage.goto();

      // Search for the database
      await databasesPage.databaseList.search(db.name);
      await databasesPage.databaseList.expectDatabaseVisible(db.name);

      // Open tags manager
      await databasesPage.databaseList.openTagsManager(db.name);
      await databasesPage.tagsDialog.waitForVisible();

      // Add a tag but cancel
      await databasesPage.tagsDialog.addTag('should-not-save', 'value');

      // Cancel the dialog
      await databasesPage.tagsDialog.cancel();

      // Verify dialog is closed
      await databasesPage.tagsDialog.expectHidden();

      // Verify the tag was not saved - reopen and check no tags exist
      await databasesPage.databaseList.openTagsManager(db.name);
      await databasesPage.tagsDialog.waitForVisible();

      // Should have no tags
      const tagCount = await databasesPage.tagsDialog.getTagCount();
      expect(tagCount).toBe(0);
    } finally {
      await apiHelper.deleteDatabase(db.id);
    }
  });

  test(`should remove a tag from a database ${Tags.REGRESSION}`, async ({
    databasesPage,
    apiHelper,
  }) => {
    // Create a test database
    const config = getStandaloneConfig({ name: 'test-tags-remove' });
    const db = await apiHelper.createDatabase(config);

    try {
      // Navigate to databases page
      await databasesPage.goto();

      // Search for the database
      await databasesPage.databaseList.search(db.name);
      await databasesPage.databaseList.expectDatabaseVisible(db.name);

      // Open tags manager and add a tag first
      await databasesPage.databaseList.openTagsManager(db.name);
      await databasesPage.tagsDialog.waitForVisible();
      await databasesPage.tagsDialog.addTag('temp-tag', 'to-remove');
      await databasesPage.tagsDialog.save();

      // Refresh view and re-search after save
      await databasesPage.databaseList.clearSearch();
      await databasesPage.databaseList.search(db.name);
      await databasesPage.databaseList.expectDatabaseVisible(db.name);

      // Reopen tags manager
      await databasesPage.databaseList.openTagsManager(db.name);
      await databasesPage.tagsDialog.waitForVisible();

      // Delete the tag
      await databasesPage.tagsDialog.deleteTag(0);

      // Save
      await databasesPage.tagsDialog.save();

      // Refresh view and re-search after save
      await databasesPage.databaseList.clearSearch();
      await databasesPage.databaseList.search(db.name);
      await databasesPage.databaseList.expectDatabaseVisible(db.name);

      // Verify tag was removed
      await databasesPage.databaseList.openTagsManager(db.name);
      await databasesPage.tagsDialog.waitForVisible();
      const tagCount = await databasesPage.tagsDialog.getTagCount();
      expect(tagCount).toBe(0);
    } finally {
      await apiHelper.deleteDatabase(db.id);
    }
  });
});

