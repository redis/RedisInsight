import { test, expect } from '../../fixtures/base';
import { WorkbenchPage } from '../../pages';
import { Tags } from '../../config';
import { COMMANDS, EXPECTED_RESULTS, getWorkbenchTestData, getInvalidCommand } from '../../test-data/workbench';
import { getStandaloneConfig } from '../../test-data/databases';

test.describe.serial('Workbench > Command Execution', () => {
  let databaseId: string;
  let workbenchPage: WorkbenchPage;

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

  test.beforeEach(async ({ page, createWorkbenchPage }) => {
    // Navigate to the database first
    await page.goto(`/${databaseId}/workbench`);
    workbenchPage = createWorkbenchPage(databaseId);
    await workbenchPage.waitForLoad();
  });

  test(`should execute single Redis command ${Tags.CRITICAL} ${Tags.SMOKE}`, async () => {
    // Execute PING command
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Verify result
    const result = await workbenchPage.resultsPanel.getLastResultText();
    expect(result).toBe(EXPECTED_RESULTS.PING);
  });

  test(`should view command result ${Tags.CRITICAL}`, async () => {
    // Execute a command
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Verify result is visible
    await expect(workbenchPage.resultsPanel.resultText).toBeVisible();

    // Verify execution time is displayed
    const executionTime = await workbenchPage.resultsPanel.getLastExecutionTime();
    expect(executionTime).toMatch(/\d+(\.\d+)?\s*msec/);
  });

  test(`should execute multiple commands ${Tags.CRITICAL}`, async () => {
    // Clear any existing results first
    await workbenchPage.clearResults();

    // Execute first command
    await workbenchPage.executeCommand(COMMANDS.PING);
    const firstResult = await workbenchPage.resultsPanel.getLastResultText();
    expect(firstResult).toBe(EXPECTED_RESULTS.PING);

    // Execute second command
    await workbenchPage.executeCommand(COMMANDS.DBSIZE);

    // Verify we have 2 results
    const resultCount = await workbenchPage.resultsPanel.getResultCount();
    expect(resultCount).toBe(2);
  });

  test(`should handle command error ${Tags.CRITICAL}`, async () => {
    // Execute invalid command
    const invalidCommand = getInvalidCommand();
    await workbenchPage.executeCommand(invalidCommand);

    // Verify error result is displayed
    const result = await workbenchPage.resultsPanel.getLastResultText();
    expect(result).toContain('ERR');
  });

  test(`should execute SET and GET commands ${Tags.SMOKE}`, async () => {
    const testData = getWorkbenchTestData();

    // Execute SET command
    await workbenchPage.executeCommand(testData.setCommand);
    let result = await workbenchPage.resultsPanel.getLastResultText();
    expect(result).toBe(EXPECTED_RESULTS.OK);

    // Execute GET command
    await workbenchPage.executeCommand(testData.getCommand);
    result = await workbenchPage.resultsPanel.getLastResultText();
    expect(result).toContain(testData.value);

    // Clean up - delete the key
    await workbenchPage.executeCommand(testData.delCommand);
  });
});

test.describe.serial('Workbench > Results View', () => {
  let databaseId: string;
  let workbenchPage: WorkbenchPage;

  test.beforeAll(async ({ apiHelper }) => {
    const config = getStandaloneConfig();
    const database = await apiHelper.createDatabase(config);
    databaseId = database.id;
  });

  test.afterAll(async ({ apiHelper }) => {
    if (databaseId) {
      await apiHelper.deleteDatabase(databaseId);
    }
  });

  test.beforeEach(async ({ page, createWorkbenchPage }) => {
    await page.goto(`/${databaseId}/workbench`);
    workbenchPage = createWorkbenchPage(databaseId);
    await workbenchPage.waitForLoad();
  });

  test(`should view text result ${Tags.CRITICAL} ${Tags.SMOKE}`, async () => {
    // Execute PING command
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Verify text result is displayed
    const result = await workbenchPage.resultsPanel.getLastResultText();
    expect(result).toBe(EXPECTED_RESULTS.PING);
  });

  test(`should clear results ${Tags.REGRESSION}`, async () => {
    // Execute a command first
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Verify result exists
    let resultCount = await workbenchPage.resultsPanel.getResultCount();
    expect(resultCount).toBeGreaterThan(0);

    // Clear results
    await workbenchPage.clearResults();

    // Verify no results
    const hasNoResults = await workbenchPage.hasNoResults();
    expect(hasNoResults).toBe(true);
  });

  test(`should toggle Raw mode ${Tags.REGRESSION}`, async ({ page }) => {
    // Execute a command
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Find and click Raw mode toggle
    const rawModeToggle = page.getByTestId('btn-change-mode');
    await expect(rawModeToggle).toBeVisible();
    await rawModeToggle.click();

    // Verify mode changed (button should still be visible)
    await expect(rawModeToggle).toBeVisible();
  });

  test(`should toggle Group results ${Tags.REGRESSION}`, async ({ page }) => {
    // Execute a command
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Find and click Group results toggle
    const groupToggle = page.getByTestId('btn-change-group-mode');
    await expect(groupToggle).toBeVisible();
    await groupToggle.click();

    // Verify toggle is still visible
    await expect(groupToggle).toBeVisible();
  });
});

