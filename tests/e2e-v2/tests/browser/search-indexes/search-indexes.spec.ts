import { expect, test } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig } from '../../../test-data/databases';
import { faker } from '@faker-js/faker';
import { DatabaseInstance } from '../../../types';

test.describe('Browser > Search Indexes', () => {
  let database: DatabaseInstance;
  const testIndexName = `idx_test_${faker.string.alphanumeric(6)}`;
  const testPrefix = `test-search-${faker.string.alphanumeric(6)}`;

  test.beforeAll(async ({ apiHelper }) => {
    const config = getStandaloneConfig({ name: 'test-search-indexes-db' });
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteDatabase(database.id);
  });

  test(`should open create index form from search mode ${Tags.SMOKE}`, async ({
    page,
    browserPage,
  }) => {
    await browserPage.goto(database.id);
    await browserPage.keyList.waitForKeysLoaded();

    // Click on Search by Values button to switch to RediSearch mode
    const searchModeBtn = page.getByTestId('search-mode-redisearch-btn');
    await searchModeBtn.click();

    // Verify we're in search mode (Select Index dropdown should appear)
    const selectIndexDropdown = page.getByTestId('select-search-mode');
    await expect(selectIndexDropdown).toBeVisible();

    // Click on dropdown to open options
    await selectIndexDropdown.click();

    // Verify Create Index option is available
    const createIndexOption = page.getByRole('option', {
      name: /Create Index/i,
    });
    await expect(createIndexOption).toBeVisible();

    // Click to open create index form
    await createIndexOption.click();

    // Verify create index form is displayed
    const indexNameInput = page.getByRole('textbox', { name: 'Index Name' });
    await expect(indexNameInput).toBeVisible();

    // Verify form elements
    await expect(page.getByText('New Index')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Index' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test(`should display create index form fields ${Tags.SMOKE}`, async ({
    page,
    browserPage,
  }) => {
    await browserPage.goto(database.id);
    await browserPage.keyList.waitForKeysLoaded();

    // Switch to search mode
    await page.getByTestId('search-mode-redisearch-btn').click();

    // Open index selector and click Create Index
    await page.getByTestId('select-search-mode').click();
    await page.getByRole('option', { name: /Create Index/i }).click();

    // Verify the create index form is displayed with all fields
    const indexNameInput = page.getByRole('textbox', { name: 'Index Name' });
    await expect(indexNameInput).toBeVisible();

    // Verify Key Type dropdown is visible (default Hash)
    await expect(page.getByRole('combobox', { name: 'Key Type*' })).toBeVisible();

    // Verify Key Prefixes field is visible
    const prefixInput = page.getByRole('textbox', { name: 'Key Prefixes' });
    await expect(prefixInput).toBeVisible();

    // Verify identifier field is visible
    await expect(page.getByPlaceholder('Enter Identifier')).toBeVisible();

    // Verify Create Index button exists
    await expect(page.getByRole('button', { name: 'Create Index' })).toBeVisible();

    // Cancel to go back
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test(`should select existing index and display results ${Tags.SMOKE}`, async ({
    page,
    browserPage,
    workbenchPage,
  }) => {
    await browserPage.goto(database.id);
    await browserPage.keyList.waitForKeysLoaded();

    // First create test data and index via Workbench
    await page.getByRole('tab', { name: 'Workbench' }).click();
    await workbenchPage.waitForLoad();

    // Create test data
    await workbenchPage.executeCommand(`HSET ${testPrefix}:item1 name "Test Item 1" price 100`);
    await workbenchPage.executeCommand(`HSET ${testPrefix}:item2 name "Test Item 2" price 200`);
    await workbenchPage.executeCommand(
      `FT.CREATE ${testIndexName} ON HASH PREFIX 1 ${testPrefix}: SCHEMA name TEXT price NUMERIC`,
    );

    // Go back to browser
    await page.getByRole('tab', { name: 'Browse' }).click();
    await browserPage.keyList.waitForKeysLoaded();

    // Switch to search mode
    await page.getByTestId('search-mode-redisearch-btn').click();

    // Select the index from dropdown
    await page.getByTestId('select-search-mode').click();
    await page.getByRole('option', { name: testIndexName }).click();

    // Verify the index is selected and results are displayed
    // When an index is selected, it automatically shows all indexed keys
    // In tree view, keys are shown without prefix (just "item1", "item2")
    // In list view, keys are shown with full name
    // Check for "Results: 2" to confirm search worked
    await expect(page.getByText(/Results:\s*2/)).toBeVisible({ timeout: 15000 });
    // Verify the keys are displayed (tree view shows just the key name without prefix)
    await expect(page.getByRole('treeitem', { name: /item1/ })).toBeVisible();
    await expect(page.getByRole('treeitem', { name: /item2/ })).toBeVisible();

    // Clean up via workbench
    await page.getByRole('tab', { name: 'Workbench' }).click();
    await workbenchPage.waitForLoad();
    await workbenchPage.executeCommand(`FT.DROPINDEX ${testIndexName}`);
    await workbenchPage.executeCommand(`DEL ${testPrefix}:item1 ${testPrefix}:item2`);
  });

  test(`should delete search index with FT.DROPINDEX ${Tags.REGRESSION}`, async ({
    page,
    browserPage,
    workbenchPage,
  }) => {
    const dropIndexName = `idx_drop_${faker.string.alphanumeric(6)}`;
    const dropPrefix = `test-drop-${faker.string.alphanumeric(6)}`;

    await browserPage.goto(database.id);
    await browserPage.keyList.waitForKeysLoaded();

    // Create test data and index via Workbench
    await page.getByRole('tab', { name: 'Workbench' }).click();
    await workbenchPage.waitForLoad();
    await workbenchPage.executeCommand(`HSET ${dropPrefix}:item1 name "Test Item" price 100`);
    await workbenchPage.executeCommand(
      `FT.CREATE ${dropIndexName} ON HASH PREFIX 1 ${dropPrefix}: SCHEMA name TEXT price NUMERIC`,
    );

    // Go back to browser
    await page.getByRole('tab', { name: 'Browse' }).click();
    await browserPage.keyList.waitForKeysLoaded();

    // Switch to search mode and verify index exists
    await page.getByTestId('search-mode-redisearch-btn').click();
    await page.getByTestId('select-search-mode').click();
    await expect(page.getByRole('option', { name: dropIndexName })).toBeVisible();
    await page.keyboard.press('Escape'); // Close dropdown

    // Delete the index via Workbench
    await page.getByRole('tab', { name: 'Workbench' }).click();
    await workbenchPage.waitForLoad();
    await workbenchPage.executeCommand(`FT.DROPINDEX ${dropIndexName}`);

    // Verify the command succeeded
    await expect(page.getByText('OK')).toBeVisible();

    // Go back to browser - don't wait for keys, we're in search mode
    await page.getByRole('tab', { name: 'Browse' }).click();

    // Wait for the search mode UI to be visible
    await expect(page.getByTestId('select-search-mode')).toBeVisible();

    // Open the index dropdown
    await page.getByTestId('select-search-mode').click();

    // Verify the index is no longer in the dropdown
    await expect(page.getByRole('option', { name: dropIndexName })).not.toBeVisible();

    // Close the dropdown before navigating away
    await page.keyboard.press('Escape');

    // Clean up test data
    await page.getByRole('tab', { name: 'Workbench' }).click();
    await workbenchPage.waitForLoad();
    await workbenchPage.executeCommand(`DEL ${dropPrefix}:item1`);
  });
});

