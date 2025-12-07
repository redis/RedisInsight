import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { CliPanel } from '../../../pages/cli';
import { CommandHelperPanel } from '../../../pages/workbench';

test.describe('CLI > Command Helper Integration', () => {
  let databaseId: string;
  let cli: CliPanel;
  let commandHelper: CommandHelperPanel;

  test.beforeAll(async ({ apiHelper }) => {
    // Get or create a database for testing
    const databases = await apiHelper.getDatabases();
    if (databases.length === 0) {
      const db = await apiHelper.createDatabase({
        name: 'test-cli-helper',
        host: '127.0.0.1',
        port: 6379,
      });
      databaseId = db.id;
    } else {
      databaseId = databases[0].id;
    }
  });

  test.beforeEach(async ({ page }) => {
    cli = new CliPanel(page);
    commandHelper = new CommandHelperPanel(page);

    // Navigate to browser page (CLI is available there)
    await page.goto(`/${databaseId}/browser`);
    await page.waitForLoadState('networkidle');
  });

  test(`should update Command Helper when typing command in CLI ${Tags.SMOKE}`, async () => {
    // Open both CLI and Command Helper panels
    await cli.open();
    await commandHelper.open();

    // Verify Command Helper shows default message initially
    await expect(commandHelper.getHelperMessage()).toBeVisible();

    // Type a command in CLI (without executing)
    await cli.typeCommand('GET');

    // Wait for Command Helper to show command details
    await expect(commandHelper.getCommandTitle()).toBeVisible({ timeout: 5000 });

    // Verify the command details show GET command info
    await expect(commandHelper.getCommandTitle()).toContainText('GET');
  });

  test(`should show different command info when typing different commands ${Tags.REGRESSION}`, async () => {
    // Open both panels
    await cli.open();
    await commandHelper.open();

    // Type SET command
    await cli.typeCommand('SET');

    // Wait for and verify SET command info
    await expect(commandHelper.getCommandTitle()).toBeVisible({ timeout: 5000 });
    await expect(commandHelper.getCommandTitle()).toContainText('SET');
    await expect(commandHelper.getCommandSummary()).toContainText('Set');
  });

  test(`should filter helper results by command category ${Tags.REGRESSION}`, async ({ page }) => {
    // Open Command Helper
    await commandHelper.open();

    // Click on filter dropdown
    await commandHelper.filterDropdown.click();

    // Select a category (e.g., "String")
    await page.getByRole('option', { name: 'String' }).click();

    // Search for a command
    await commandHelper.searchCommand('GET');

    // Verify GET is shown (it's a string command)
    const getLink = page.getByRole('link', { name: 'GET', exact: true });
    await expect(getLink).toBeVisible();
  });

  test(`should show module-specific commands ${Tags.REGRESSION}`, async ({ page }) => {
    // Open Command Helper
    await commandHelper.open();

    // Search for JSON command
    await commandHelper.searchCommand('JSON.GET');

    // Click on the command
    await page.getByRole('link', { name: 'JSON.GET' }).first().click();

    // Verify JSON command details are shown
    await expect(commandHelper.getCommandTitle()).toBeVisible();
    await expect(commandHelper.getCommandTitle()).toContainText('JSON.GET');
  });

  test(`should show Read more link for command ${Tags.REGRESSION}`, async ({ page }) => {
    // Open Command Helper
    await commandHelper.open();

    // Search for GET command and click on it
    await commandHelper.searchCommand('GET');
    await page.getByRole('link', { name: 'GET', exact: true }).click();

    // Verify command details are shown
    await expect(commandHelper.getCommandTitle()).toBeVisible();

    // Verify Read more link is visible
    const readMoreLink = page.getByRole('link', { name: 'Read more' });
    await expect(readMoreLink).toBeVisible();

    // Verify it has the correct href to Redis.io documentation
    const href = await readMoreLink.getAttribute('href');
    expect(href).toContain('redis.io');
  });
});
