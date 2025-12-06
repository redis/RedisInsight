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
});

