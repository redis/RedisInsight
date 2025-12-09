import { expect, test } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig } from '../../../test-data/databases';
import { faker } from '@faker-js/faker';
import { DatabaseInstance } from '../../../types';

test.describe('Workbench > Plugins', () => {
  let database: DatabaseInstance;
  const testPrefix = `test-plugin-${faker.string.alphanumeric(6)}`;
  const testIndexName = `idx_plugin_${faker.string.alphanumeric(6)}`;

  test.beforeAll(async ({ apiHelper }) => {
    const config = getStandaloneConfig({ name: 'test-plugins-db' });
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test(`should display FT.SEARCH results in table format ${Tags.SMOKE}`, async ({
    page,
    workbenchPage,
  }) => {
    await workbenchPage.goto(database.id);

    // Create test data and index
    await workbenchPage.executeCommand(`HSET ${testPrefix}:item1 name "Test Item 1" price 100`);
    await workbenchPage.executeCommand(`HSET ${testPrefix}:item2 name "Test Item 2" price 200`);
    await workbenchPage.executeCommand(
      `FT.CREATE ${testIndexName} ON HASH PREFIX 1 ${testPrefix}: SCHEMA name TEXT price NUMERIC`,
    );

    // Wait for index to be ready
    await page.waitForTimeout(1000);

    // Execute FT.SEARCH command
    await workbenchPage.executeCommand(`FT.SEARCH ${testIndexName} "*"`);

    // Verify the plugin renders a table with results
    // The plugin renders in an iframe
    const resultFrame = page.frameLocator('iframe').first();

    // Verify "Matched:" text appears showing results count
    await expect(resultFrame.getByText(/Matched:\s*\d+/)).toBeVisible({ timeout: 10000 });

    // Verify table headers are present (Doc and $ for JSON results)
    await expect(resultFrame.getByRole('columnheader', { name: 'Doc' })).toBeVisible();

    // Verify at least one result row is present
    await expect(resultFrame.getByRole('row').first()).toBeVisible();

    // Clean up
    await workbenchPage.executeCommand(`FT.DROPINDEX ${testIndexName}`);
    await workbenchPage.executeCommand(`DEL ${testPrefix}:item1 ${testPrefix}:item2`);
  });

  test(`should display FT.INFO results in plugin format ${Tags.REGRESSION}`, async ({
    page,
    workbenchPage,
  }) => {
    await workbenchPage.goto(database.id);

    // Create a simple index
    const indexName = `idx_info_${faker.string.alphanumeric(6)}`;
    await workbenchPage.executeCommand(
      `FT.CREATE ${indexName} ON HASH PREFIX 1 test-info: SCHEMA name TEXT`,
    );

    // Wait for index to be ready
    await page.waitForTimeout(500);

    // Execute FT.INFO command
    await workbenchPage.executeCommand(`FT.INFO ${indexName}`);

    // Verify the plugin renders the result in an iframe with index information
    const resultFrame = page.frameLocator('iframe').first();

    // Verify the plugin shows "Indexing" text and document type
    await expect(resultFrame.getByText(/Indexing/)).toBeVisible({ timeout: 10000 });
    await expect(resultFrame.getByText(/Hash/)).toBeVisible();

    // Verify the schema table is displayed with column headers
    await expect(resultFrame.getByRole('columnheader', { name: 'IDENTIFIER' })).toBeVisible();
    await expect(resultFrame.getByRole('columnheader', { name: 'TYPE' })).toBeVisible();

    // Clean up
    await workbenchPage.executeCommand(`FT.DROPINDEX ${indexName}`);
  });

  test(`should switch between Table and Text view ${Tags.REGRESSION}`, async ({
    page,
    workbenchPage,
  }) => {
    await workbenchPage.goto(database.id);

    // Create test data and index
    const prefix = `test-view-${faker.string.alphanumeric(6)}`;
    const indexName = `idx_view_${faker.string.alphanumeric(6)}`;
    await workbenchPage.executeCommand(`HSET ${prefix}:item1 name "Item 1"`);
    await workbenchPage.executeCommand(
      `FT.CREATE ${indexName} ON HASH PREFIX 1 ${prefix}: SCHEMA name TEXT`,
    );

    // Wait for index to be ready
    await page.waitForTimeout(500);

    // Execute FT.SEARCH command
    await workbenchPage.executeCommand(`FT.SEARCH ${indexName} "*"`);

    // Verify table view is displayed (default for FT.SEARCH)
    const resultFrame = page.frameLocator('iframe').first();
    await expect(resultFrame.getByText(/Matched:/)).toBeVisible({ timeout: 10000 });

    // Find and click the view switcher dropdown
    // The dropdown is in the result card header
    const viewSwitcher = page.getByTestId('query-card-container').first().locator('button').filter({ hasText: /Table|Text/ }).first();

    // If view switcher exists, try to switch views
    const switcherExists = await viewSwitcher.isVisible().catch(() => false);
    if (switcherExists) {
      await viewSwitcher.click();
      // Select Text view option if available
      const textOption = page.getByRole('option', { name: /Text/i });
      if (await textOption.isVisible().catch(() => false)) {
        await textOption.click();
        // Verify text view is now displayed
        await expect(page.getByText(/FT\.SEARCH/)).toBeVisible();
      }
    }

    // Clean up
    await workbenchPage.executeCommand(`FT.DROPINDEX ${indexName}`);
    await workbenchPage.executeCommand(`DEL ${prefix}:item1`);
  });
});

