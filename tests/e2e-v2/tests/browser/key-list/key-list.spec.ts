import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig } from '../../../test-data/databases';
import { TEST_KEY_PREFIX } from '../../../test-data/browser';
import { BrowserPage } from '../../../pages';

/**
 * Browser > Key List Tests
 *
 * Tests for key list view, search, filter, and delete operations
 */
test.describe.serial('Browser > Key List', () => {
  let databaseId: string;
  let browserPage: BrowserPage;

  // Create test keys with specific names for filtering tests
  const testKeys = [
    `${TEST_KEY_PREFIX}filter-string-1`,
    `${TEST_KEY_PREFIX}filter-string-2`,
    `${TEST_KEY_PREFIX}filter-hash-1`,
    `${TEST_KEY_PREFIX}unique-key-xyz`,
  ];

  test.beforeAll(async ({ apiHelper }) => {
    // Create a test database
    const config = getStandaloneConfig({ name: 'test-key-list-db' });
    const db = await apiHelper.createDatabase(config);
    databaseId = db.id;

    // Create test keys via Redis CLI
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    await execAsync(`redis-cli -h 127.0.0.1 -p 6379 SET "${testKeys[0]}" "value1"`);
    await execAsync(`redis-cli -h 127.0.0.1 -p 6379 SET "${testKeys[1]}" "value2"`);
    await execAsync(`redis-cli -h 127.0.0.1 -p 6379 HSET "${testKeys[2]}" field1 value1`);
    await execAsync(`redis-cli -h 127.0.0.1 -p 6379 SET "${testKeys[3]}" "unique"`);
  });

  test.afterAll(async ({ apiHelper }) => {
    // Clean up test keys
    await apiHelper.deleteKeysByPattern(databaseId, `${TEST_KEY_PREFIX}*`);
    // Clean up test database
    if (databaseId) {
      await apiHelper.deleteDatabase(databaseId);
    }
  });

  test.beforeEach(async ({ page, createBrowserPage }) => {
    browserPage = createBrowserPage(databaseId);
    await browserPage.goto();
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test(`should display key list ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ page }) => {
    // Verify the key list is visible (tree view or list view)
    // Tree view shows treeitems, list view shows grid
    const treeItem = page.getByRole('treeitem').first();
    const grid = page.getByRole('grid');
    const hasTreeItem = await treeItem.isVisible().catch(() => false);
    const hasGrid = await grid.isVisible().catch(() => false);
    expect(hasTreeItem || hasGrid).toBe(true);

    // Verify results count is displayed
    await expect(page.getByText(/Results:/)).toBeVisible();
  });

  test(`should search keys by pattern ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ page }) => {
    // Search for test keys with pattern
    await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}filter*`);

    // Wait for search to complete
    await page.waitForLoadState('networkidle');

    // Should find multiple keys matching pattern
    const keyExists = await browserPage.keyList.keyExists(testKeys[0]);
    expect(keyExists).toBe(true);
  });

  test(`should filter keys by exact name ${Tags.REGRESSION}`, async ({ page }) => {
    // Search for a specific unique key
    await browserPage.keyList.searchKeys(testKeys[3]);
    await page.waitForLoadState('networkidle');

    // Should find the exact key
    const keyExists = await browserPage.keyList.keyExists(testKeys[3]);
    expect(keyExists).toBe(true);
  });

  test(`should filter keys by type ${Tags.SMOKE}`, async ({ page }) => {
    // First search for test keys
    await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}filter*`);
    await page.waitForLoadState('networkidle');

    // Filter by Hash type
    await browserPage.keyList.filterByType('Hash');
    await page.waitForLoadState('networkidle');

    // Hash key should be visible
    const hashKeyExists = await browserPage.keyList.keyExists(testKeys[2]);
    expect(hashKeyExists).toBe(true);
  });

  test(`should clear search filter ${Tags.REGRESSION}`, async ({ page }) => {
    // First apply a filter
    await browserPage.keyList.searchKeys(testKeys[3]);
    await page.waitForLoadState('networkidle');

    // Clear the search
    await browserPage.keyList.clearSearch();
    await page.waitForLoadState('networkidle');

    // Results count should show more keys
    await expect(page.getByText(/Results:/)).toBeVisible();
  });

  test(`should click on key to view details ${Tags.SMOKE}`, async ({ page }) => {
    // Search for a specific key
    await browserPage.keyList.searchKeys(testKeys[0]);
    await page.waitForLoadState('networkidle');

    // Click on the key (use treeitem for tree view)
    const keyItem = page.getByRole('treeitem', { name: new RegExp(testKeys[0]) });
    await keyItem.click();
    await page.waitForLoadState('networkidle');

    // Key details panel should show the key value (String type shows value)
    // Look for the value "value1" that we set for this key
    await expect(page.getByText('value1')).toBeVisible({ timeout: 10000 });
  });

  test(`should refresh key list ${Tags.REGRESSION}`, async ({ page }) => {
    // Click refresh button
    await browserPage.keyList.refresh();
    await page.waitForLoadState('networkidle');

    // Key list should still be visible after refresh (tree view or list view)
    const treeItem = page.getByRole('treeitem').first();
    const grid = page.getByRole('grid');
    const hasTreeItem = await treeItem.isVisible().catch(() => false);
    const hasGrid = await grid.isVisible().catch(() => false);
    expect(hasTreeItem || hasGrid).toBe(true);
  });

  test(`should show no results message for non-matching pattern ${Tags.REGRESSION}`, async ({ page }) => {
    // Search for non-existent key pattern
    await browserPage.keyList.searchKeys('nonexistent-key-pattern-xyz-123');
    await page.waitForLoadState('networkidle');

    // Should show no keys message or empty state
    const noKeysVisible = await browserPage.keyList.isNoKeysMessageVisible();
    expect(noKeysVisible).toBe(true);
  });
});

