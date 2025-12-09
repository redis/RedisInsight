import { test, expect } from '../../fixtures/base';
import { Tags } from '../../config';
import { getStandaloneConfig } from '../../test-data/databases';
import { DatabaseInstance } from '../../types';

test.describe.serial('CLI > Panel', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    // Create a database for testing
    const config = getStandaloneConfig();
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    // Clean up database
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ browserPage }) => {
    await browserPage.goto(database.id);
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

  test(`should handle command errors ${Tags.REGRESSION}`, async ({ cliPanel }) => {
    await cliPanel.open();

    // Execute an invalid command
    await cliPanel.executeCommand('INVALIDCOMMAND');

    // Verify output shows error
    const hasError = await cliPanel.outputContains('ERR');
    expect(hasError).toBe(true);
  });

  test(`should execute multiple commands in sequence ${Tags.REGRESSION}`, async ({ cliPanel }) => {
    await cliPanel.open();

    // Execute SET
    await cliPanel.executeCommand('SET cli_test_key test_value');
    const hasOk = await cliPanel.outputContains('OK');
    expect(hasOk).toBe(true);

    // Execute GET
    await cliPanel.executeCommand('GET cli_test_key');
    const hasValue = await cliPanel.outputContains('test_value');
    expect(hasValue).toBe(true);

    // Cleanup
    await cliPanel.executeCommand('DEL cli_test_key');
  });

  test(`should navigate command history with up/down arrows ${Tags.REGRESSION}`, async ({
    page,
    cliPanel,
  }) => {
    await cliPanel.open();

    // Execute first command
    await cliPanel.executeCommand('PING');
    const hasPong = await cliPanel.outputContains('PONG');
    expect(hasPong).toBe(true);

    // Execute second command
    await cliPanel.executeCommand('INFO server');
    const hasInfo = await cliPanel.outputContains('redis_version');
    expect(hasInfo).toBe(true);

    // Focus on command input
    await cliPanel.commandInput.focus();

    // Press up arrow to get previous command
    await page.keyboard.press('ArrowUp');

    // Verify the command input shows the previous command
    const cliText = await cliPanel.container.innerText();
    expect(cliText).toContain('INFO server');

    // Press up arrow again to get the first command
    await page.keyboard.press('ArrowUp');
    const cliText2 = await cliPanel.container.innerText();
    expect(cliText2).toContain('PING');

    // Press down arrow to go back to second command
    await page.keyboard.press('ArrowDown');
    const cliText3 = await cliPanel.container.innerText();
    expect(cliText3).toContain('INFO server');
  });

  test(`should autocomplete commands with Tab key ${Tags.REGRESSION}`, async ({
    page,
    cliPanel,
  }) => {
    await cliPanel.open();

    // Focus on command input
    await cliPanel.commandInput.focus();

    // Type partial command
    await page.keyboard.type('PI');

    // Press Tab to autocomplete
    await page.keyboard.press('Tab');

    // Verify the command was autocompleted to PING
    const cliText = await cliPanel.container.innerText();
    expect(cliText).toContain('PING');
  });
});

