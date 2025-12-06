import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { BrowserPage } from '../../../pages';

test.describe('Browser > Tree View', () => {
  let databaseId: string;
  let browserPage: BrowserPage;

  test.beforeAll(async ({ apiHelper }) => {
    // Get or create a database for testing
    const databases = await apiHelper.getDatabases();
    if (databases.length === 0) {
      const db = await apiHelper.createDatabase({
        name: 'test-tree-view',
        host: '127.0.0.1',
        port: 6379,
      });
      databaseId = db.id;
    } else {
      databaseId = databases[0].id;
    }
  });

  test.beforeEach(async ({ page, createBrowserPage }) => {
    browserPage = createBrowserPage(databaseId);
    await browserPage.goto();
    await browserPage.keyList.waitForKeysLoaded();
  });

  test.describe('View Switching', () => {
    test(`should switch to tree view ${Tags.SMOKE}`, async ({ page }) => {
      await browserPage.keyList.switchToTreeView();

      // Tree view should show tree items (folders or keys)
      await expect(page.getByRole('treeitem').first()).toBeVisible();
    });

    test(`should switch back to list view ${Tags.REGRESSION}`, async ({ page }) => {
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
    test.beforeEach(async ({ page }) => {
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
  });

  test.describe('Tree View Settings', () => {
    test.beforeEach(async ({ page }) => {
      await browserPage.keyList.switchToTreeView();
      // Wait for tree items to load
      await expect(page.getByRole('treeitem').first()).toBeVisible();
    });

    test(`should open tree view settings ${Tags.SMOKE}`, async ({ page }) => {
      await browserPage.keyList.openTreeViewSettings();

      // Dialog should be visible
      await expect(page.getByRole('dialog')).toBeVisible();
    });

    test(`should show delimiter setting ${Tags.REGRESSION}`, async ({ page }) => {
      await browserPage.keyList.openTreeViewSettings();

      // Delimiter input should be visible (it's a textbox with label "Delimiter")
      await expect(page.getByRole('textbox', { name: 'Delimiter' })).toBeVisible();
    });

    test(`should show sort by dropdown ${Tags.REGRESSION}`, async ({ page }) => {
      await browserPage.keyList.openTreeViewSettings();

      // Sort by dropdown should be visible
      await expect(page.getByRole('combobox', { name: 'Sort by' })).toBeVisible();
    });

    test(`should close settings with Cancel ${Tags.REGRESSION}`, async ({ page }) => {
      await browserPage.keyList.openTreeViewSettings();

      // Click Cancel
      await page.getByRole('button', { name: 'Cancel' }).click();

      // Dialog should be hidden
      await expect(page.getByRole('dialog')).toBeHidden();
    });
  });
});

