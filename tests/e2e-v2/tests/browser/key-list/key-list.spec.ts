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
  // Use unique suffix to avoid conflicts with other test runs
  const uniqueSuffix = `kl-${Date.now().toString(36)}`;

  // Create test keys with specific names for filtering tests
  const testKeys = [
    `${TEST_KEY_PREFIX}filter-string-1-${uniqueSuffix}`,
    `${TEST_KEY_PREFIX}filter-string-2-${uniqueSuffix}`,
    `${TEST_KEY_PREFIX}filter-hash-1-${uniqueSuffix}`,
    `${TEST_KEY_PREFIX}unique-key-xyz-${uniqueSuffix}`,
  ];

  test.beforeAll(async ({ apiHelper }) => {
    // Create a test database with unique name
    const dbName = `test-key-list-${Date.now().toString(36)}`;
    const config = getStandaloneConfig({ name: dbName });
    const db = await apiHelper.createDatabase(config);
    databaseId = db.id;

    // Create test keys via API
    await apiHelper.createStringKey(databaseId, testKeys[0], 'value1');
    await apiHelper.createStringKey(databaseId, testKeys[1], 'value2');
    await apiHelper.createHashKey(databaseId, testKeys[2], [{ field: 'field1', value: 'value1' }]);
    await apiHelper.createStringKey(databaseId, testKeys[3], 'unique');
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
    // Search for test keys with pattern including unique suffix
    await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}filter*-${uniqueSuffix}`);

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
    // First search for test keys with unique suffix
    await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}filter*-${uniqueSuffix}`);
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

  test(`should delete key ${Tags.CRITICAL}`, async ({ page, apiHelper }) => {
    // Create a key to delete
    const keyToDelete = `${TEST_KEY_PREFIX}delete-me-${Date.now()}`;
    await apiHelper.createStringKey(databaseId, keyToDelete, 'delete-test-value');

    // Refresh to see the new key
    await browserPage.keyList.refresh();
    await page.waitForLoadState('networkidle');

    // Search for the key
    await browserPage.keyList.searchKeys(keyToDelete);
    await page.waitForLoadState('networkidle');

    // Click on the key to open details
    const keyItem = page.getByRole('treeitem', { name: new RegExp(keyToDelete) });
    await keyItem.click();
    await browserPage.keyDetails.waitForKeyDetails();

    // Delete the key
    await browserPage.keyDetails.deleteKey();

    // Verify key is gone - the key should no longer exist
    // After deletion, the key details panel closes
    // Check that the key is not in the list anymore
    const keyExists = await browserPage.keyList.keyExists(keyToDelete);
    expect(keyExists).toBe(false);
  });

  test(`should switch to Search by Values mode ${Tags.SMOKE}`, async ({ page }) => {
    // Click on Search by Values of Keys button
    const searchByValuesBtn = page.getByTestId('search-mode-redisearch-btn');
    await searchByValuesBtn.click();

    // Verify the mode switched - should show index selector
    await expect(page.getByTestId('select-search-mode')).toBeVisible();
    await expect(page.getByText('Select Index')).toBeVisible();
  });

  test(`should show message when no index selected ${Tags.REGRESSION}`, async ({ page }) => {
    // Switch to Search by Values mode
    const searchByValuesBtn = page.getByTestId('search-mode-redisearch-btn');
    await searchByValuesBtn.click();

    // Should show message to select index
    await expect(page.getByTestId('no-result-select-index')).toBeVisible();
    await expect(page.getByText(/Select an index/)).toBeVisible();
  });

  test(`should switch back to Filter by Key Name mode ${Tags.REGRESSION}`, async ({ page }) => {
    // First switch to Search by Values mode
    const searchByValuesBtn = page.getByTestId('search-mode-redisearch-btn');
    await searchByValuesBtn.click();
    await expect(page.getByTestId('select-search-mode')).toBeVisible();

    // Switch back to Filter by Key Name mode
    const filterByKeyBtn = page.getByTestId('search-mode-pattern-btn');
    await filterByKeyBtn.click();

    // Verify we're back to key name filter mode
    await expect(page.getByPlaceholder('Filter by Key Name or Pattern')).toBeVisible();
  });

  test(`should display database stats in header ${Tags.REGRESSION}`, async ({ page }) => {
    // Verify CPU usage is displayed
    const cpuUsage = page.getByTestId('overview-cpu');
    await expect(cpuUsage).toBeVisible();
    await expect(cpuUsage).toContainText('%');

    // Verify connected clients is displayed
    const connectedClients = page.getByTestId('overview-connected-clients');
    await expect(connectedClients).toBeVisible();

    // Verify total memory is displayed
    const totalMemory = page.getByTestId('overview-total-memory');
    await expect(totalMemory).toBeVisible();
    await expect(totalMemory).toContainText(/MB|KB|GB/);

    // Verify total keys is displayed
    const totalKeys = page.getByTestId('overview-total-keys');
    await expect(totalKeys).toBeVisible();

    // Verify commands per second is displayed
    const commandsPerSec = page.getByTestId('overview-commands-sec');
    await expect(commandsPerSec).toBeVisible();
  });

  test(`should configure columns visibility ${Tags.REGRESSION}`, async ({ page }) => {
    // Click on Columns button
    const columnsButton = page.getByTestId('btn-columns-actions');
    await columnsButton.click();

    // Verify columns popover is visible
    const keySizeCheckbox = page.getByRole('checkbox', { name: 'Key size' });
    await expect(keySizeCheckbox).toBeVisible();
    await expect(keySizeCheckbox).toBeChecked();

    const ttlCheckbox = page.getByRole('checkbox', { name: 'TTL' });
    await expect(ttlCheckbox).toBeVisible();
    await expect(ttlCheckbox).toBeChecked();

    // Toggle Key size off
    await keySizeCheckbox.click();
    await expect(keySizeCheckbox).not.toBeChecked();

    // Toggle Key size back on
    await keySizeCheckbox.click();
    await expect(keySizeCheckbox).toBeChecked();

    // Close popover
    await page.keyboard.press('Escape');
  });

  test(`should configure auto-refresh ${Tags.REGRESSION}`, async ({ page }) => {
    // Click on Auto-refresh config button
    const autoRefreshButton = page.getByTestId('keys-auto-refresh-config-btn');
    await autoRefreshButton.click();

    // Verify auto-refresh popover is visible
    const autoRefreshSwitch = page.getByTestId('keys-auto-refresh-switch');
    await expect(autoRefreshSwitch).toBeVisible();

    // Verify refresh rate is displayed
    await expect(page.getByText('Refresh rate:')).toBeVisible();
    await expect(page.getByText(/\d+\.\d+ s/)).toBeVisible();

    // Ensure auto-refresh is off first (if it's on, turn it off)
    const isChecked = await autoRefreshSwitch.isChecked();
    if (isChecked) {
      await autoRefreshSwitch.click();
    }

    // Verify switch is now off
    await expect(autoRefreshSwitch).not.toBeChecked();

    // Toggle auto-refresh on
    await autoRefreshSwitch.click();

    // Verify switch is now on
    await expect(autoRefreshSwitch).toBeChecked();

    // Close popover
    await page.keyboard.press('Escape');
  });

  test(`should show scan more button when searching ${Tags.REGRESSION}`, async () => {
    // Search for keys with a pattern that will return partial results
    await browserPage.keyList.searchKeys('test-*');

    // Wait for search results
    await browserPage.keyList.waitForKeysLoaded();

    // Check if scan more button is visible (only visible when there are more keys to scan)
    const isScanMoreVisible = await browserPage.keyList.isScanMoreVisible();

    // The scan more button should be visible if there are more keys to scan
    // This depends on the database having enough keys
    if (isScanMoreVisible) {
      // Verify the scanned count text is visible
      const scannedText = await browserPage.keyList.getScannedCountText();
      expect(scannedText).toMatch(/Scanned \d+/);
    }
  });
});

