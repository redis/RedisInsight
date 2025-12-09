import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { DatabaseInstance } from '../../../types';

test.describe('Browser > Tree View', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    // Get or create a database for testing
    const databases = await apiHelper.getDatabases();
    if (databases.length === 0) {
      database = await apiHelper.createDatabase({
        name: 'test-tree-view',
        host: '127.0.0.1',
        port: 6379,
      });
    } else {
      database = databases[0];
    }
  });

  test.beforeEach(async ({ browserPage }) => {
    await browserPage.goto(database.id);
    await browserPage.keyList.waitForKeysLoaded();
  });

  test.describe('View Switching', () => {
    test(`should switch to tree view ${Tags.SMOKE}`, async ({ page, browserPage }) => {
      await browserPage.keyList.switchToTreeView();

      // Tree view should show tree items (folders or keys)
      await expect(page.getByRole('treeitem').first()).toBeVisible();
    });

    test(`should switch back to list view ${Tags.REGRESSION}`, async ({ page, browserPage }) => {
      // First switch to tree view
      await browserPage.keyList.switchToTreeView();
      await expect(page.getByRole('treeitem').first()).toBeVisible();

      // Then switch back to list view
      await browserPage.keyList.switchToListView();

      // List view should show grid rows
      await expect(page.getByRole('row').first()).toBeVisible();
    });
  });

  test.describe('Tree Structure', () => {
    test.beforeEach(async ({ page, browserPage }) => {
      await browserPage.keyList.switchToTreeView();
      // Wait for tree items to load
      await expect(page.getByRole('treeitem').first()).toBeVisible();
    });

    test(`should show folders in tree view ${Tags.SMOKE}`, async ({ page }) => {
      // Look for folder icons in tree view
      const folders = page.getByRole('treeitem').filter({ has: page.getByRole('img', { name: 'Folder' }) });
      const folderCount = await folders.count();

      expect(folderCount).toBeGreaterThan(0);
    });

    test(`should show folder percentage and count ${Tags.REGRESSION}`, async ({ page }) => {
      // Find a folder and check it has percentage and count
      const folder = page.getByRole('treeitem').filter({ has: page.getByRole('img', { name: 'Folder' }) }).first();

      // Folder should have percentage (e.g., "9%" or "<1%")
      await expect(folder.getByText(/\d+%|<1%/)).toBeVisible();
    });

    test(`should expand folder on click ${Tags.CRITICAL}`, async ({ page }) => {
      // Find a folder with Chevron Right (collapsed)
      const collapsedFolder = page.getByRole('treeitem').filter({ has: page.getByRole('img', { name: 'Chevron Right' }) }).first();

      // Click to expand
      await collapsedFolder.click();

      // Should now show Chevron Down (expanded)
      await expect(page.getByRole('treeitem').filter({ has: page.getByRole('img', { name: 'Chevron Down' }) }).first()).toBeVisible();
    });

    test(`should collapse folder on click ${Tags.REGRESSION}`, async ({ page }) => {
      // First expand a folder
      const collapsedFolder = page.getByRole('treeitem').filter({ has: page.getByRole('img', { name: 'Chevron Right' }) }).first();
      await collapsedFolder.click();

      // Wait for expansion
      await expect(page.getByRole('treeitem').filter({ has: page.getByRole('img', { name: 'Chevron Down' }) }).first()).toBeVisible();

      // Click to collapse
      const expandedFolder = page.getByRole('treeitem').filter({ has: page.getByRole('img', { name: 'Chevron Down' }) }).first();
      await expandedFolder.click();

      // Should show Chevron Right again (collapsed)
      await expect(page.getByRole('treeitem').filter({ has: page.getByRole('img', { name: 'Chevron Right' }) }).first()).toBeVisible();
    });

    test(`should show namespace tooltip with key pattern and delimiter ${Tags.REGRESSION}`, async ({ page }) => {
      // Find a folder in tree view
      const folder = page.getByRole('treeitem').filter({ has: page.getByRole('img', { name: 'Folder' }) }).first();

      // Hover over the folder to trigger tooltip
      await folder.hover();

      // Wait for tooltip to appear
      const tooltip = page.getByRole('tooltip');
      await expect(tooltip).toBeVisible();

      // Tooltip should contain the key pattern with delimiter (e.g., "bicycle:*")
      // The pattern format is: namespace + delimiter + "*"
      await expect(tooltip).toContainText(/\w+:\*/);

      // Tooltip should also show key count (e.g., "10 key(s)")
      await expect(tooltip).toContainText(/\d+ key\(s\)/);
    });
  });

  test.describe.serial('Tree View Settings', () => {
    test.beforeEach(async ({ page, browserPage }) => {
      await browserPage.keyList.switchToTreeView();
      // Wait for tree items to load
      await expect(page.getByRole('treeitem').first()).toBeVisible();
    });

    test(`should open tree view settings ${Tags.SMOKE}`, async ({ page, browserPage }) => {
      await browserPage.keyList.openTreeViewSettings();

      // Dialog should be visible
      await expect(page.getByRole('dialog')).toBeVisible();
    });

    test(`should show delimiter setting ${Tags.REGRESSION}`, async ({ page, browserPage }) => {
      await browserPage.keyList.openTreeViewSettings();

      // Delimiter input should be visible (it's a textbox with label "Delimiter")
      await expect(page.getByRole('textbox', { name: 'Delimiter' })).toBeVisible();
    });

    test(`should show sort by dropdown ${Tags.REGRESSION}`, async ({ page, browserPage }) => {
      await browserPage.keyList.openTreeViewSettings();

      // Sort by dropdown should be visible
      await expect(page.getByRole('combobox', { name: 'Sort by' })).toBeVisible();
    });

    test(`should close settings with Cancel ${Tags.REGRESSION}`, async ({ page, browserPage }) => {
      await browserPage.keyList.openTreeViewSettings();

      // Click Cancel
      await page.getByRole('button', { name: 'Cancel' }).click();

      // Dialog should be hidden
      await expect(page.getByRole('dialog')).toBeHidden();
    });

    test(`should change sort by option ${Tags.REGRESSION}`, async ({ page, browserPage }) => {
      await browserPage.keyList.openTreeViewSettings();

      // Change sort by to Key name DESC
      const sortByDropdown = page.getByRole('combobox', { name: 'Sort by' });
      await sortByDropdown.click();
      await page.getByRole('option', { name: 'Key name DESC' }).click();

      // Verify the dropdown shows the new value
      await expect(sortByDropdown).toContainText('Key name DESC');

      // Cancel to not affect other tests
      await page.getByRole('button', { name: 'Cancel' }).click();
    });

    test(`should configure multiple delimiters ${Tags.REGRESSION}`, async ({ page, browserPage }) => {
      await browserPage.keyList.openTreeViewSettings();

      const dialog = page.getByRole('dialog');
      const removeButtons = dialog.getByRole('button', { name: 'Remove' });

      // Initially should have 1 delimiter (":") with 1 Remove button
      await expect(removeButtons).toHaveCount(1);

      // Add a second delimiter "-"
      const delimiterInput = page.getByRole('textbox', { name: 'Delimiter' });
      await delimiterInput.fill('-');
      await delimiterInput.press('Enter');

      // Now should have 2 delimiters with 2 Remove buttons
      await expect(removeButtons).toHaveCount(2);

      // Cancel to not affect other tests
      await browserPage.keyList.cancelTreeViewSettings();
    });

    test(`should cancel delimiter change and revert to previous value ${Tags.REGRESSION}`, async ({ page, browserPage }) => {
      await browserPage.keyList.openTreeViewSettings();

      const dialog = page.getByRole('dialog');
      const removeButtons = dialog.getByRole('button', { name: 'Remove' });

      // Initially should have 1 delimiter
      await expect(removeButtons).toHaveCount(1);

      // Add a new delimiter
      const delimiterInput = page.getByRole('textbox', { name: 'Delimiter' });
      await delimiterInput.fill('/');
      await delimiterInput.press('Enter');

      // Now should have 2 delimiters
      await expect(removeButtons).toHaveCount(2);

      // Cancel the changes
      await browserPage.keyList.cancelTreeViewSettings();

      // Re-open settings and verify the delimiter was reverted
      await browserPage.keyList.openTreeViewSettings();

      // Should only have the original delimiter (1 Remove button)
      await expect(removeButtons).toHaveCount(1);

      // Close the dialog
      await browserPage.keyList.cancelTreeViewSettings();
    });
  });

  test.describe('View State Persistence', () => {
    test(`should persist tree view mode after page refresh ${Tags.REGRESSION}`, async ({ page, browserPage }) => {
      // Switch to tree view
      await browserPage.keyList.switchToTreeView();
      await expect(page.getByRole('treeitem').first()).toBeVisible();

      // Refresh the page
      await page.reload();
      await browserPage.keyList.waitForKeysLoaded();

      // Tree view should still be active (tree items visible)
      await expect(page.getByRole('treeitem').first()).toBeVisible();
    });

    test(`should persist list view mode after page refresh ${Tags.REGRESSION}`, async ({ page, browserPage }) => {
      // Ensure we're in list view
      await browserPage.keyList.switchToListView();
      await expect(page.getByRole('grid')).toBeVisible();

      // Refresh the page
      await page.reload();
      await browserPage.keyList.waitForKeysLoaded();

      // List view should still be active (grid visible)
      await expect(page.getByRole('grid')).toBeVisible();
    });

    test(`should preserve filter state when switching between Browser and Tree view ${Tags.REGRESSION}`, async ({
      page,
      browserPage,
      apiHelper,
    }) => {
      // Create test keys with a specific pattern
      const testPrefix = `test-filter-${Date.now()}`;
      await apiHelper.createStringKey(database.id, `${testPrefix}:key1`, 'value1');
      await apiHelper.createStringKey(database.id, `${testPrefix}:key2`, 'value2');

      try {
        // Ensure we're in list view
        await browserPage.keyList.switchToListView();
        await expect(page.getByRole('grid')).toBeVisible();

        // Apply a filter pattern
        await browserPage.keyList.searchKeys(`${testPrefix}*`);
        await browserPage.keyList.waitForKeysLoaded();

        // Verify filter is applied (should show filtered results)
        const searchInput = browserPage.keyList.searchInput;
        await expect(searchInput).toHaveValue(`${testPrefix}*`);

        // Switch to tree view
        await browserPage.keyList.switchToTreeView();
        await expect(page.getByRole('treeitem').first()).toBeVisible();

        // Verify filter is still applied in tree view
        await expect(searchInput).toHaveValue(`${testPrefix}*`);

        // Switch back to list view
        await browserPage.keyList.switchToListView();
        await expect(page.getByRole('grid')).toBeVisible();

        // Verify filter is still applied
        await expect(searchInput).toHaveValue(`${testPrefix}*`);
      } finally {
        // Clean up test keys
        await apiHelper.deleteKeysByPattern(database.id, `${testPrefix}*`);
      }
    });

    test(`should preserve key type filter when switching views ${Tags.REGRESSION}`, async ({
      page,
      browserPage,
      apiHelper,
    }) => {
      // Create test keys of different types
      const testPrefix = `test-type-${Date.now()}`;
      await apiHelper.createStringKey(database.id, `${testPrefix}:string`, 'value');
      await apiHelper.createHashKey(database.id, `${testPrefix}:hash`, [{ field: 'field', value: 'value' }]);

      try {
        // Ensure we're in list view
        await browserPage.keyList.switchToListView();
        await expect(page.getByRole('grid')).toBeVisible();

        // Apply key type filter for String
        await browserPage.keyList.filterByType('String');
        await browserPage.keyList.waitForKeysLoaded();

        // Verify filter is applied (dropdown shows String)
        const keyTypeFilter = browserPage.keyList.keyTypeFilter;
        await expect(keyTypeFilter).toContainText('String');

        // Switch to tree view
        await browserPage.keyList.switchToTreeView();
        await expect(page.getByRole('treeitem').first()).toBeVisible();

        // Verify key type filter is still applied
        await expect(keyTypeFilter).toContainText('String');

        // Switch back to list view
        await browserPage.keyList.switchToListView();
        await expect(page.getByRole('grid')).toBeVisible();

        // Verify key type filter is still applied
        await expect(keyTypeFilter).toContainText('String');
      } finally {
        // Clean up test keys
        await apiHelper.deleteKeysByPattern(database.id, `${testPrefix}*`);
      }
    });
  });
});

