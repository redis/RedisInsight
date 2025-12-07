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

  test(`should re-run command ${Tags.REGRESSION}`, async ({ page }) => {
    // Clear any existing results first
    const clearButton = page.getByTestId('clear-history-btn');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    // Execute a command first
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Verify result exists
    let resultCount = await workbenchPage.resultsPanel.getResultCount();
    expect(resultCount).toBe(1);

    // Click re-run button
    const reRunButton = page.getByTestId('re-run-command');
    await expect(reRunButton).toBeVisible();
    await reRunButton.click();

    // Wait for result count to increase
    await expect(async () => {
      const newCount = await workbenchPage.resultsPanel.getResultCount();
      expect(newCount).toBe(2);
    }).toPass({ timeout: 10000 });
  });

  test(`should delete command result ${Tags.REGRESSION}`, async ({ page }) => {
    // Clear any existing results first
    const clearButton = page.getByTestId('clear-history-btn');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    // Execute a command first
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Verify result exists
    let resultCount = await workbenchPage.resultsPanel.getResultCount();
    expect(resultCount).toBe(1);

    // Click delete button
    const deleteButton = page.getByTestId('delete-command');
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Verify result is deleted
    await expect(async () => {
      const newCount = await workbenchPage.resultsPanel.getResultCount();
      expect(newCount).toBe(0);
    }).toPass({ timeout: 10000 });
  });

  test(`should view table result ${Tags.REGRESSION}`, async () => {
    // Execute HSET command to create hash data
    await workbenchPage.executeCommand('HSET test-hash-table field1 value1 field2 value2');

    // Execute HGETALL to get table-like result
    await workbenchPage.executeCommand('HGETALL test-hash-table');

    // Verify result is displayed
    const result = await workbenchPage.resultsPanel.getLastResultText();
    expect(result).toContain('field1');
    expect(result).toContain('value1');

    // Clean up
    await workbenchPage.executeCommand('DEL test-hash-table');
  });

  test(`should view JSON result ${Tags.REGRESSION}`, async ({ page }) => {
    // Execute JSON.SET command
    await workbenchPage.executeCommand('JSON.SET test-json-result $ \'{"name":"test","value":123}\'');

    // Execute JSON.GET to get JSON result
    await workbenchPage.executeCommand('JSON.GET test-json-result');

    // JSON results are displayed in a plugin iframe
    // Verify the plugin result container is visible
    const pluginResult = page.getByTestId('query-plugin-result');
    await expect(pluginResult).toBeVisible();

    // Verify the iframe contains JSON data
    const iframe = pluginResult.locator('iframe');
    await expect(iframe).toBeVisible();

    // Clean up
    await workbenchPage.executeCommand('DEL test-json-result');
  });

  test(`should copy result ${Tags.REGRESSION}`, async ({ page }) => {
    // Clear any existing results first
    const clearButton = page.getByTestId('clear-history-btn');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    // Execute a command
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Find and click copy button (use first() since there may be multiple results)
    const copyButton = page.getByTestId('copy-command-btn').first();
    await expect(copyButton).toBeVisible();
    await copyButton.click();

    // Verify copy action (button should still be visible after click)
    await expect(copyButton).toBeVisible();
  });

  test(`should expand and collapse results ${Tags.REGRESSION}`, async ({ page }) => {
    // Clear any existing results first
    const clearButton = page.getByTestId('clear-history-btn');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    // Execute a command
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Find toggle collapse button (use first() since there may be multiple results)
    const toggleButton = page.getByTestId('toggle-collapse').first();
    await expect(toggleButton).toBeVisible();

    // Click to collapse
    await toggleButton.click();

    // Verify result is collapsed (result text should not be visible)
    const resultText = page.getByTestId('query-cli-card-result').first();
    await expect(resultText).not.toBeVisible();

    // Click to expand
    await toggleButton.click();

    // Verify result is expanded
    await expect(resultText).toBeVisible();
  });
});

test.describe.serial('Workbench > Editor', () => {
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

  test(`should show command autocomplete ${Tags.SMOKE}`, async ({ page }) => {
    // Type partial command to trigger autocomplete
    const editor = page.getByRole('textbox', { name: /Editor content/ });
    await editor.fill('SET');

    // Verify autocomplete dropdown appears with suggestions
    const autocompleteList = page.getByRole('listbox', { name: 'Suggest' });
    await expect(autocompleteList).toBeVisible();

    // Verify SET command is in the suggestions
    const setOption = page.getByRole('option', { name: /^SET$/ });
    await expect(setOption).toBeVisible();
  });

  test(`should show syntax highlighting ${Tags.REGRESSION}`, async ({ page }) => {
    // Type a command
    const editor = page.getByRole('textbox', { name: /Editor content/ });
    await editor.fill('SET mykey myvalue');

    // Press Escape to close autocomplete
    await page.keyboard.press('Escape');

    // Verify the command is displayed (syntax highlighting is applied via Monaco editor)
    // We verify the text is present in the editor
    await expect(page.locator('.monaco-editor')).toContainText('SET');
  });

  test(`should type and verify editor content ${Tags.REGRESSION}`, async ({ page }) => {
    // Type a command
    const editor = page.getByRole('textbox', { name: /Editor content/ });
    await editor.fill('SET mykey myvalue');

    // Press Escape to close autocomplete
    await page.keyboard.press('Escape');

    // Verify the content is in the editor
    await expect(editor).toHaveValue('SET mykey myvalue');

    // Verify the Monaco editor displays the content
    await expect(page.locator('.monaco-editor')).toContainText('SET');
  });

  test(`should navigate command history ${Tags.REGRESSION}`, async ({ page }) => {
    // Execute first command
    const editor = page.getByRole('textbox', { name: /Editor content/ });
    await editor.fill('PING');
    await page.keyboard.press('Control+Enter');

    // Wait for result
    await page.waitForTimeout(500);

    // Execute second command
    await editor.fill('INFO server');
    await page.keyboard.press('Control+Enter');

    // Wait for result
    await page.waitForTimeout(500);

    // Clear editor
    await editor.fill('');

    // Press Ctrl+Up to navigate to previous command
    await page.keyboard.press('Control+ArrowUp');

    // Verify the editor shows the previous command
    await expect(page.locator('.monaco-editor')).toContainText('INFO');
  });

  test(`should clear editor ${Tags.REGRESSION}`, async ({ page }) => {
    // Type a command
    const editor = page.getByRole('textbox', { name: /Editor content/ });
    await editor.fill('SET mykey myvalue');

    // Press Escape to close autocomplete
    await page.keyboard.press('Escape');

    // Verify content is in editor
    await expect(page.locator('.monaco-editor')).toContainText('SET');

    // Clear editor using Ctrl+A and Delete
    await editor.selectText();
    await page.keyboard.press('Delete');

    // Verify editor is empty
    await expect(editor).toHaveValue('');
  });
});

test.describe.serial('Workbench > Tutorials', () => {
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

  test(`should open Intro to search tutorial ${Tags.SMOKE}`, async ({ page }) => {
    // Click on Intro to search tutorial button
    const tutorialButton = page.getByTestId('query-tutorials-link_sq-intro');
    await expect(tutorialButton).toBeVisible();
    await tutorialButton.click();

    // Verify insights panel opens with tutorial content
    const insightsPanel = page.getByTestId('side-panels-insights');
    await expect(insightsPanel).toBeVisible();

    // Verify tutorial tab is selected
    const tutorialsTab = page.getByRole('tab', { name: 'Tutorials' });
    await expect(tutorialsTab).toHaveAttribute('aria-selected', 'true');
  });

  test(`should open Basic use cases tutorial ${Tags.REGRESSION}`, async ({ page }) => {
    // Click on Basic use cases tutorial button
    const tutorialButton = page.getByTestId('query-tutorials-link_redis_use_cases_basic');
    await expect(tutorialButton).toBeVisible();
    await tutorialButton.click();

    // Verify insights panel opens
    const insightsPanel = page.getByTestId('side-panels-insights');
    await expect(insightsPanel).toBeVisible();
  });

  test(`should click Explore button ${Tags.REGRESSION}`, async ({ page }) => {
    // Click on Explore button in the no results area
    const exploreButton = page.getByTestId('no-results-explore-btn');
    await expect(exploreButton).toBeVisible();
    await exploreButton.click();

    // Verify insights panel opens
    const insightsPanel = page.getByTestId('side-panels-insights');
    await expect(insightsPanel).toBeVisible();
  });

  test(`should close insights panel ${Tags.REGRESSION}`, async ({ page }) => {
    // Open insights panel first
    const tutorialButton = page.getByTestId('query-tutorials-link_sq-intro');
    await tutorialButton.click();

    // Verify panel is open
    const insightsPanel = page.getByTestId('side-panels-insights');
    await expect(insightsPanel).toBeVisible();

    // Close the panel
    const closeButton = page.getByTestId('close-insights-btn');
    await closeButton.click();

    // Verify panel is closed
    await expect(insightsPanel).not.toBeVisible();
  });
});

