import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';

test.describe('Command Helper > Command Helper Panel', () => {
  let database: DatabaseInstance;
  const uniqueSuffix = `cmd-helper-${Date.now().toString(36)}`;

  test.beforeAll(async ({ apiHelper }) => {
    const config = StandaloneConfigFactory.build({
      name: `test-command-helper-${uniqueSuffix}`,
    });
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ browserPage }) => {
    await browserPage.goto(database.id);
  });

  test.describe('Panel Lifecycle', () => {
    test('should open Command Helper panel', async ({ commandHelperPanel }) => {
      await commandHelperPanel.open();

      await expect(commandHelperPanel.container).toBeVisible();
      await expect(commandHelperPanel.searchInput).toBeVisible();
      await expect(commandHelperPanel.hideButton).toBeVisible();
      await expect(commandHelperPanel.closeButton).toBeVisible();
      await expect(commandHelperPanel.defaultText).toBeVisible();
    });

    test('should hide and restore Command Helper panel', async ({ commandHelperPanel }) => {
      await commandHelperPanel.open();
      await expect(commandHelperPanel.hideButton).toBeVisible();

      await commandHelperPanel.hide();
      await expect(commandHelperPanel.expandButton).toBeVisible();
      await expect(commandHelperPanel.hideButton).not.toBeVisible();

      await commandHelperPanel.open();
      await expect(commandHelperPanel.container).toBeVisible();
      await expect(commandHelperPanel.hideButton).toBeVisible();
    });

    test('should close Command Helper panel', async ({ commandHelperPanel }) => {
      await commandHelperPanel.open();
      await expect(commandHelperPanel.container).toBeVisible();

      await commandHelperPanel.close();

      await expect(commandHelperPanel.hideButton).not.toBeVisible();
      await expect(commandHelperPanel.closeButton).not.toBeVisible();
    });
  });

  test.describe('Search', () => {
    test('should search for a command', async ({ commandHelperPanel }) => {
      await commandHelperPanel.open();

      await commandHelperPanel.search('GET');

      // Wait for search results to appear
      await expect(commandHelperPanel.searchResultTitles.first()).toBeVisible();

      // Verify search results contain GET command
      const resultCount = await commandHelperPanel.getSearchResultCount();
      expect(resultCount).toBeGreaterThan(0);
    });

    test('should filter commands by category', async ({ commandHelperPanel }) => {
      await commandHelperPanel.open();

      // First search to get some results
      await commandHelperPanel.search('');

      // Filter by a category (e.g., "String")
      await commandHelperPanel.filterByCategory('String');

      // Verify filter is applied by checking results
      await expect(commandHelperPanel.searchResultTitles.first()).toBeVisible();
    });
  });

  test.describe('Command Details', () => {
    test('should view command details', async ({ commandHelperPanel }) => {
      await commandHelperPanel.open();

      // Search for a specific command
      await commandHelperPanel.search('SET');
      await expect(commandHelperPanel.searchResultTitles.first()).toBeVisible();

      // Click on SET command to view details
      await commandHelperPanel.selectCommand('SET');

      // Verify command details are displayed
      await expect(commandHelperPanel.commandTitle).toBeVisible();
      await expect(commandHelperPanel.commandSummary).toBeVisible();
      await expect(commandHelperPanel.readMoreLink).toBeVisible();
      await expect(commandHelperPanel.backToListButton).toBeVisible();

      // Verify the title contains SET
      const title = await commandHelperPanel.getCommandTitle();
      expect(title.toUpperCase()).toContain('SET');
    });

    test('should navigate back to search results from command details', async ({ commandHelperPanel }) => {
      await commandHelperPanel.open();

      // Search and select a command
      await commandHelperPanel.search('PING');
      await expect(commandHelperPanel.searchResultTitles.first()).toBeVisible();
      await commandHelperPanel.selectCommand('PING');

      // Verify we're in command details view
      await expect(commandHelperPanel.commandTitle).toBeVisible();

      // Go back to list
      await commandHelperPanel.backToList();

      // Verify we're back to search results
      await expect(commandHelperPanel.searchResultTitles.first()).toBeVisible();
      await expect(commandHelperPanel.commandTitle).not.toBeVisible();
    });
  });
});
