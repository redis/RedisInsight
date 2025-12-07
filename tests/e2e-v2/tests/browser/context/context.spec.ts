import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig } from '../../../test-data/databases';
import { TEST_KEY_PREFIX } from '../../../test-data/browser';
import { BrowserPage } from '../../../pages';

/**
 * Browser Context Tests
 *
 * Tests that browser context (filters, selected keys, etc.) is preserved
 * when navigating between tabs within the browser.
 */
test.describe.serial('Browser > Context Preservation', () => {
  let databaseId: string;
  let browserPage: BrowserPage;
  const uniqueSuffix = `ctx-${Date.now().toString(36)}`;

  // Test key for context tests
  const testKey = `${TEST_KEY_PREFIX}context-key-${uniqueSuffix}`;

  test.beforeAll(async ({ apiHelper }) => {
    // Create a test database with unique name
    const dbName = `test-context-${Date.now().toString(36)}`;
    const config = getStandaloneConfig({ name: dbName });
    const db = await apiHelper.createDatabase(config);
    databaseId = db.id;

    // Create a test key
    await apiHelper.createStringKey(databaseId, testKey, 'test-value');
  });

  test.afterAll(async ({ apiHelper }) => {
    // Clean up
    if (databaseId) {
      await apiHelper.deleteKeysByPattern(databaseId, `${TEST_KEY_PREFIX}*`);
      await apiHelper.deleteDatabase(databaseId);
    }
  });

  test.beforeEach(async ({ createBrowserPage }) => {
    browserPage = createBrowserPage(databaseId);
    await browserPage.goto();
  });

  test(`should preserve browser context when switching tabs ${Tags.SMOKE}`, async ({ page }) => {
    // Apply a search filter
    await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}context*`);
    await page.waitForTimeout(500);

    // Verify the filter is applied
    await expect(browserPage.keyList.searchInput).toHaveValue(`${TEST_KEY_PREFIX}context*`);

    // Navigate to Workbench tab
    await page.getByRole('tab', { name: 'Workbench' }).click();
    await page.waitForTimeout(500);

    // Navigate back to Browser tab
    await page.getByRole('tab', { name: 'Browse' }).click();
    await page.waitForTimeout(500);

    // Verify the filter is still applied
    await expect(browserPage.keyList.searchInput).toHaveValue(`${TEST_KEY_PREFIX}context*`);
  });

  test(`should preserve selected key when switching tabs ${Tags.REGRESSION}`, async ({ page }) => {
    // Search for the test key
    await browserPage.keyList.searchKeys(testKey);
    await page.waitForTimeout(500);

    // Click on the key to select it
    await browserPage.keyList.clickKey(testKey);
    await page.waitForTimeout(500);

    // Verify key details are shown
    await expect(browserPage.keyDetails.keyName).toHaveText(testKey);

    // Navigate to Workbench tab
    await page.getByRole('tab', { name: 'Workbench' }).click();
    await page.waitForTimeout(500);

    // Navigate back to Browser tab
    await page.getByRole('tab', { name: 'Browse' }).click();
    await page.waitForTimeout(500);

    // Verify the key is still selected and details are shown
    await expect(browserPage.keyDetails.keyName).toHaveText(testKey);
  });

  test(`should clear context when page is reloaded ${Tags.REGRESSION}`, async ({ page }) => {
    // Apply a search filter
    await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}context*`);
    await page.waitForTimeout(500);

    // Verify the filter is applied
    await expect(browserPage.keyList.searchInput).toHaveValue(`${TEST_KEY_PREFIX}context*`);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify the filter is cleared (default is empty or *)
    const searchValue = await browserPage.keyList.searchInput.inputValue();
    expect(searchValue === '' || searchValue === '*').toBe(true);
  });
});

