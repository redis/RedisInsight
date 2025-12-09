import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig } from '../../../test-data/databases';
import { TEST_KEY_PREFIX } from '../../../test-data/browser';
import { DatabaseInstance } from '../../../types';

/**
 * Browser Context Tests
 *
 * Tests that browser context (filters, selected keys, etc.) is preserved
 * when navigating between tabs within the browser.
 */
test.describe.serial('Browser > Context Preservation', () => {
  let database: DatabaseInstance;
  const uniqueSuffix = `ctx-${Date.now().toString(36)}`;

  // Test key for context tests
  const testKey = `${TEST_KEY_PREFIX}context-key-${uniqueSuffix}`;

  test.beforeAll(async ({ apiHelper }) => {
    // Create a test database with unique name
    const dbName = `test-context-${Date.now().toString(36)}`;
    const config = getStandaloneConfig({ name: dbName });
    database = await apiHelper.createDatabase(config);

    // Create a test key
    await apiHelper.createStringKey(database.id, testKey, 'test-value');
  });

  test.afterAll(async ({ apiHelper }) => {
    // Clean up
    if (database?.id) {
      await apiHelper.deleteKeysByPattern(database.id, `${TEST_KEY_PREFIX}*`);
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ browserPage }) => {
    await browserPage.goto(database.id);
  });

  test(`should preserve browser context when switching tabs ${Tags.SMOKE}`, async ({ page, browserPage }) => {
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

  test(`should preserve selected key when switching tabs ${Tags.REGRESSION}`, async ({ page, browserPage }) => {
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

  test(`should clear context when page is reloaded ${Tags.REGRESSION}`, async ({ page, browserPage }) => {
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

  test(`should preserve CLI command history when switching tabs ${Tags.REGRESSION}`, async ({
    page,
    cliPanel,
  }) => {
    // Open CLI panel
    await cliPanel.open();

    // Execute a command
    await cliPanel.executeCommand('PING');
    await page.waitForTimeout(500);

    // Verify PONG response
    await expect(page.getByText('PONG')).toBeVisible();

    // Navigate to Workbench tab
    await page.getByRole('tab', { name: 'Workbench' }).click();
    await page.waitForTimeout(500);

    // Navigate back to Browser tab
    await page.getByRole('tab', { name: 'Browse' }).click();
    await page.waitForTimeout(500);

    // CLI should still be open and show the previous output
    const isOpen = await cliPanel.isOpen();
    expect(isOpen).toBe(true);

    // The PONG response should still be visible
    await expect(page.getByText('PONG')).toBeVisible();
  });

  test(`should clear context when navigating to different database ${Tags.REGRESSION}`, async ({
    page,
    apiHelper,
    browserPage,
  }) => {
    // Apply a search filter
    await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}context*`);
    await page.waitForTimeout(500);

    // Verify the filter is applied
    await expect(browserPage.keyList.searchInput).toHaveValue(`${TEST_KEY_PREFIX}context*`);

    // Create another database to navigate to
    const otherDbName = `test-context-other-${Date.now().toString(36)}`;
    const otherConfig = getStandaloneConfig({ name: otherDbName });
    const otherDb = await apiHelper.createDatabase(otherConfig);

    try {
      // Navigate to the other database via UI
      await browserPage.goto(otherDb.id);

      // Verify the filter is cleared (default is empty or *)
      const searchValue = await browserPage.keyList.searchInput.inputValue();
      expect(searchValue === '' || searchValue === '*').toBe(true);
    } finally {
      // Clean up the other database
      await apiHelper.deleteDatabase(otherDb.id);
    }
  });
});

