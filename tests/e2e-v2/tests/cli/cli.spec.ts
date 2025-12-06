import { test, expect } from '../../fixtures/base';
import { Tags } from '../../config';
import { getStandaloneConfig } from '../../test-data/databases';

test.describe.serial('CLI > Panel', () => {
  let databaseId: string;

  test.beforeAll(async ({ apiHelper }) => {
    // Create a database for testing
    const config = getStandaloneConfig();
    const database = await apiHelper.createDatabase(config);
    databaseId = database.id;
  });

  test.afterAll(async ({ apiHelper }) => {
    // Clean up database
    if (databaseId) {
      await apiHelper.deleteDatabase(databaseId);
    }
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to the database browser page
    await page.goto(`/${databaseId}/browser`);
    await page.waitForLoadState('domcontentloaded');
    // Wait for the page to fully load (key list or no keys message)
    await Promise.race([
      page.getByText(/Total:/i).waitFor({ timeout: 30000 }),
      page.getByText(/Results:/i).waitFor({ timeout: 30000 }),
      page.getByText(/no keys/i).waitFor({ timeout: 30000 }),
    ]).catch(() => {});
  });

  test(`should open CLI panel ${Tags.CRITICAL} ${Tags.SMOKE}`, async ({ cliPanel }) => {
    // Open CLI panel
    await cliPanel.open();

    // Verify CLI panel is open
    const isOpen = await cliPanel.isOpen();
    expect(isOpen).toBe(true);

    // Verify hide button is visible
    await expect(cliPanel.hideButton).toBeVisible();
  });

  test(`should execute command ${Tags.CRITICAL}`, async ({ cliPanel }) => {
    // Open CLI panel
    await cliPanel.open();

    // Execute PING command
    await cliPanel.executeCommand('PING');

    // Verify output contains PONG
    const containsPong = await cliPanel.outputContains('PONG');
    expect(containsPong).toBe(true);
  });

  test(`should view command output ${Tags.CRITICAL}`, async ({ cliPanel }) => {
    // Open CLI panel
    await cliPanel.open();

    // Execute INFO command
    await cliPanel.executeCommand('INFO server');

    // Verify output contains server info
    const containsRedisVersion = await cliPanel.outputContains('redis_version');
    expect(containsRedisVersion).toBe(true);
  });

  test(`should close CLI panel ${Tags.REGRESSION}`, async ({ cliPanel }) => {
    // Open CLI panel first
    await cliPanel.open();
    expect(await cliPanel.isOpen()).toBe(true);

    // Close CLI panel
    await cliPanel.close();

    // Verify CLI panel is closed (hide button should not be visible)
    await expect(cliPanel.hideButton).not.toBeVisible();
  });

  test(`should hide CLI panel ${Tags.REGRESSION}`, async ({ cliPanel }) => {
    // Open CLI panel first
    await cliPanel.open();
    expect(await cliPanel.isOpen()).toBe(true);

    // Hide CLI panel
    await cliPanel.hide();

    // Verify CLI panel is hidden (hide button should not be visible)
    await expect(cliPanel.hideButton).not.toBeVisible();

    // But expand button should still be visible
    await expect(cliPanel.expandButton).toBeVisible();
  });
});

