import { test, expect } from '../../fixtures/base';
import { Tags } from '../../config';
import { CommandHelperPanel } from '../../pages/workbench';

test.describe('Workbench > Command Helper', () => {
  let databaseId: string;
  let commandHelper: CommandHelperPanel;

  test.beforeAll(async ({ apiHelper }) => {
    // Get or create a database for testing
    const databases = await apiHelper.getDatabases();
    if (databases.length === 0) {
      const db = await apiHelper.createDatabase({
        name: 'test-command-helper',
        host: '127.0.0.1',
        port: 6379,
      });
      databaseId = db.id;
    } else {
      databaseId = databases[0].id;
    }
  });

  test.beforeEach(async ({ page }) => {
    commandHelper = new CommandHelperPanel(page);
    // Navigate to workbench
    await page.goto(`/${databaseId}/workbench`);
    await page.waitForLoadState('networkidle');
  });

  test(`should open Command Helper panel ${Tags.SMOKE}`, async () => {
    await commandHelper.open();

    const isOpen = await commandHelper.isOpen();
    expect(isOpen).toBe(true);
  });

  test(`should show search input ${Tags.REGRESSION}`, async () => {
    await commandHelper.open();

    await expect(commandHelper.searchInput).toBeVisible();
  });

  test(`should show filter dropdown ${Tags.REGRESSION}`, async () => {
    await commandHelper.open();

    await expect(commandHelper.filterDropdown).toBeVisible();
  });

  test(`should hide Command Helper panel ${Tags.REGRESSION}`, async () => {
    await commandHelper.open();

    // Verify it's open
    expect(await commandHelper.isOpen()).toBe(true);

    // Hide it
    await commandHelper.hide();

    // Verify it's hidden
    expect(await commandHelper.isOpen()).toBe(false);
  });

  test(`should close Command Helper panel ${Tags.REGRESSION}`, async () => {
    await commandHelper.open();

    // Verify it's open
    expect(await commandHelper.isOpen()).toBe(true);

    // Close it
    await commandHelper.close();

    // Verify it's closed
    expect(await commandHelper.isOpen()).toBe(false);
  });

  test(`should search for a command ${Tags.REGRESSION}`, async () => {
    await commandHelper.open();

    await commandHelper.searchCommand('GET');

    // Search input should have the value
    await expect(commandHelper.searchInput).toHaveValue('GET');
  });

  test(`should view command details ${Tags.REGRESSION}`, async ({ page }) => {
    await commandHelper.open();

    // Search for GET command
    await commandHelper.searchCommand('GET');

    // Click on the GET command link
    await page.getByRole('link', { name: 'GET', exact: true }).click();

    // Verify command details are shown
    await expect(page.getByTestId('cli-helper-title-args')).toBeVisible();
    await expect(page.getByTestId('cli-helper-title-args')).toHaveText('GET key');

    // Verify summary is shown
    await expect(page.getByTestId('cli-helper-summary')).toBeVisible();
    await expect(page.getByTestId('cli-helper-summary')).toContainText('Returns the string value');

    // Verify arguments section is shown
    await expect(page.getByTestId('cli-helper-arguments')).toBeVisible();

    // Verify since version is shown
    await expect(page.getByTestId('cli-helper-since')).toBeVisible();
  });

  test(`should go back to command list from details ${Tags.REGRESSION}`, async ({ page }) => {
    await commandHelper.open();

    // Search for GET command
    await commandHelper.searchCommand('GET');

    // Click on the GET command link
    await page.getByRole('link', { name: 'GET', exact: true }).click();

    // Verify we're in details view
    await expect(page.getByTestId('cli-helper-title-args')).toBeVisible();

    // Click back button
    await page.getByTestId('cli-helper-back-to-list-btn').click();

    // Verify we're back to the list (details should not be visible)
    await expect(page.getByTestId('cli-helper-title-args')).not.toBeVisible();

    // Search input should still have the value
    await expect(commandHelper.searchInput).toHaveValue('GET');
  });
});

