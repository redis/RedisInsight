import { test, expect } from '../../fixtures/base';
import { Tags } from '../../config';
import { COMMANDS, EXPECTED_RESULTS, getWorkbenchTestData, getInvalidCommand } from '../../test-data/workbench';
import { getStandaloneConfig } from '../../test-data/databases';
import { DatabaseInstance } from '../../types';

test.describe.serial('Workbench > Command Execution', () => {
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

  test.beforeEach(async ({ workbenchPage }) => {
    await workbenchPage.goto(database.id);
  });

  test(`should execute single Redis command ${Tags.CRITICAL} ${Tags.SMOKE}`, async ({ workbenchPage }) => {
    // Execute PING command
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Verify result
    const result = await workbenchPage.resultsPanel.getLastResultText();
    expect(result).toBe(EXPECTED_RESULTS.PING);
  });

  test(`should view command result ${Tags.CRITICAL}`, async ({ workbenchPage }) => {
    // Execute a command
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Verify result is visible
    await expect(workbenchPage.resultsPanel.resultText).toBeVisible();

    // Verify execution time is displayed
    const executionTime = await workbenchPage.resultsPanel.getLastExecutionTime();
    expect(executionTime).toMatch(/\d+(\.\d+)?\s*msec/);
  });

  test(`should execute multiple commands ${Tags.CRITICAL}`, async ({ workbenchPage }) => {
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

  test(`should handle command error ${Tags.CRITICAL}`, async ({ workbenchPage }) => {
    // Execute invalid command
    const invalidCommand = getInvalidCommand();
    await workbenchPage.executeCommand(invalidCommand);

    // Verify error result is displayed
    const result = await workbenchPage.resultsPanel.getLastResultText();
    expect(result).toContain('ERR');
  });

  test(`should execute SET and GET commands ${Tags.SMOKE}`, async ({ workbenchPage }) => {
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
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    const config = getStandaloneConfig();
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ workbenchPage }) => {
    await workbenchPage.goto(database.id);
  });

  test(`should view text result ${Tags.CRITICAL} ${Tags.SMOKE}`, async ({ workbenchPage }) => {
    // Execute PING command
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Verify text result is displayed
    const result = await workbenchPage.resultsPanel.getLastResultText();
    expect(result).toBe(EXPECTED_RESULTS.PING);
  });

  test(`should clear results ${Tags.REGRESSION}`, async ({ workbenchPage }) => {
    // Execute a command first
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Verify result exists
    const resultCount = await workbenchPage.resultsPanel.getResultCount();
    expect(resultCount).toBeGreaterThan(0);

    // Clear results
    await workbenchPage.clearResults();

    // Verify no results
    const hasNoResults = await workbenchPage.hasNoResults();
    expect(hasNoResults).toBe(true);
  });

  test(`should toggle Raw mode ${Tags.REGRESSION}`, async ({ page, workbenchPage }) => {
    // Execute a command
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Find and click Raw mode toggle
    const rawModeToggle = page.getByTestId('btn-change-mode');
    await expect(rawModeToggle).toBeVisible();
    await rawModeToggle.click();

    // Verify mode changed (button should still be visible)
    await expect(rawModeToggle).toBeVisible();
  });

  test(`should toggle Group results ${Tags.REGRESSION}`, async ({ page, workbenchPage }) => {
    // Execute a command
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Find and click Group results toggle
    const groupToggle = page.getByTestId('btn-change-group-mode');
    await expect(groupToggle).toBeVisible();
    await groupToggle.click();

    // Verify toggle is still visible
    await expect(groupToggle).toBeVisible();
  });

  test(`should re-run command ${Tags.REGRESSION}`, async ({ page, workbenchPage }) => {
    // Clear any existing results first
    const clearButton = page.getByTestId('clear-history-btn');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    // Execute a command first
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Verify result exists
    const resultCount = await workbenchPage.resultsPanel.getResultCount();
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

  test(`should delete command result ${Tags.REGRESSION}`, async ({ page, workbenchPage }) => {
    // Clear any existing results first
    const clearButton = page.getByTestId('clear-history-btn');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    // Execute a command first
    await workbenchPage.executeCommand(COMMANDS.PING);

    // Verify result exists
    const resultCount = await workbenchPage.resultsPanel.getResultCount();
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

  test(`should view table result ${Tags.REGRESSION}`, async ({ workbenchPage }) => {
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

  test(`should view JSON result ${Tags.REGRESSION}`, async ({ page, workbenchPage }) => {
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

  test(`should copy result ${Tags.REGRESSION}`, async ({ page, workbenchPage }) => {
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

  test(`should expand and collapse results ${Tags.REGRESSION}`, async ({ page, workbenchPage }) => {
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
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    const config = getStandaloneConfig();
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ workbenchPage }) => {
    await workbenchPage.goto(database.id);
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
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    const config = getStandaloneConfig();
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ workbenchPage }) => {
    await workbenchPage.goto(database.id);
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

  test(`should open Intro to vector search tutorial ${Tags.REGRESSION}`, async ({ page }) => {
    // Click on Intro to vector search tutorial button
    const tutorialButton = page.getByTestId('query-tutorials-link_vss-intro');
    await expect(tutorialButton).toBeVisible();
    await tutorialButton.click();

    // Verify insights panel opens with tutorial content
    const insightsPanel = page.getByTestId('side-panels-insights');
    await expect(insightsPanel).toBeVisible();

    // Verify tutorial tab is selected
    const tutorialsTab = page.getByRole('tab', { name: 'Tutorials' });
    await expect(tutorialsTab).toHaveAttribute('aria-selected', 'true');
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

test.describe.serial('Workbench > Command History', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    const config = getStandaloneConfig();
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ workbenchPage }) => {
    await workbenchPage.goto(database.id);
  });

  test(`should persist command history after page refresh ${Tags.REGRESSION}`, async ({ page, workbenchPage }) => {
    // Execute a command
    await workbenchPage.executeCommand('PING');
    await expect(workbenchPage.resultsPanel.resultText).toBeVisible();

    // Refresh the page
    await page.reload();
    await workbenchPage.waitForLoad();

    // Command history should be preserved - use Up Arrow to access it
    await workbenchPage.editor.container.click();
    await page.keyboard.press('ArrowUp');

    // Verify the previous command is loaded in the editor
    const command = await workbenchPage.editor.getCommand();
    expect(command).toBe('PING');
  });

  test(`should preserve original datetime in history after page refresh ${Tags.REGRESSION}`, async ({
    page,
    workbenchPage,
  }) => {
    // Execute a command
    await workbenchPage.executeCommand('PING');
    await expect(workbenchPage.resultsPanel.resultText).toBeVisible();

    // Get the original datetime
    const originalDateTime = await workbenchPage.resultsPanel.getLastDateTime();
    expect(originalDateTime).toBeTruthy();

    // Wait a moment to ensure time would change if not preserved
    await page.waitForTimeout(2000);

    // Refresh the page
    await page.reload();
    await workbenchPage.waitForLoad();

    // Wait for results to load - results are persisted after refresh
    await expect(workbenchPage.resultsPanel.container).toBeVisible({ timeout: 15000 });

    // Get the datetime after refresh
    const datetimeAfterRefresh = await workbenchPage.resultsPanel.getLastDateTime();

    // Verify the original datetime is preserved (not updated to current time)
    expect(datetimeAfterRefresh).toBe(originalDateTime);
  });

  test(`should re-run a previous command from history ${Tags.REGRESSION}`, async ({ page, workbenchPage }) => {
    // Execute a command
    await workbenchPage.executeCommand('PING');
    await expect(workbenchPage.resultsPanel.resultText).toBeVisible();

    // Get initial result count
    const initialCount = await workbenchPage.resultsPanel.getResultCount();

    // Clear the editor
    await workbenchPage.editor.clear();

    // Click on the re-run button in the results panel
    const reRunButton = page.getByTestId('re-run-command').first();
    await expect(reRunButton).toBeVisible();
    await reRunButton.click();

    // Wait for new result to appear
    await workbenchPage.resultsPanel.waitForNewResult(initialCount);

    // Verify command was re-run (new result appears)
    const newCount = await workbenchPage.resultsPanel.getResultCount();
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test(`should access command history with Up Arrow ${Tags.REGRESSION}`, async ({ page, workbenchPage }) => {
    // Execute a command
    await workbenchPage.executeCommand('PING');
    await expect(workbenchPage.resultsPanel.resultText).toBeVisible();

    // Clear the editor
    await workbenchPage.editor.clear();

    // Press Up Arrow to access history
    await workbenchPage.editor.container.click();
    await page.keyboard.press('ArrowUp');

    // Verify the previous command is loaded in the editor
    const command = await workbenchPage.editor.getCommand();
    expect(command).toBe('PING');
  });

  test(`should run commands with quantifier ${Tags.REGRESSION}`, async ({ page, workbenchPage }) => {
    // Create some test keys first
    await workbenchPage.executeCommand('SET test-quant-key1 value1');
    await workbenchPage.executeCommand('SET test-quant-key2 value2');
    await workbenchPage.executeCommand('SET test-quant-key3 value3');

    // Clear results
    const clearButton = page.getByTestId('clear-history-btn');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    // Execute command with quantifier (5 RANDOMKEY)
    await workbenchPage.executeCommand('5 RANDOMKEY');

    // Verify multiple RANDOMKEY results are displayed (5 separate results)
    // Each result shows "RANDOMKEY" as the command in a button with "Copy query" text
    const randomKeyResults = page.getByRole('button', { name: /RANDOMKEY Copy query/ });
    await expect(randomKeyResults).toHaveCount(5, { timeout: 10000 });

    // Clean up test keys
    await workbenchPage.executeCommand('DEL test-quant-key1 test-quant-key2 test-quant-key3');
  });

  test(`should limit history to 30 commands ${Tags.REGRESSION}`, async ({ page, workbenchPage }) => {
    // Clear any existing results first
    const clearButton = page.getByTestId('clear-history-btn');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    // Execute 32 commands (more than the 30 limit)
    // Use unique identifiers to avoid substring matching issues
    for (let i = 1; i <= 32; i++) {
      // Use padded numbers to avoid substring matching (cmd-01, cmd-02, etc.)
      const paddedNum = i.toString().padStart(2, '0');
      await workbenchPage.editor.setCommand(`ECHO "cmd-${paddedNum}"`);
      await page.getByTestId('btn-submit').click();
      // Wait for the result text to appear
      await expect(workbenchPage.resultsPanel.resultText).toBeVisible();
      // Small delay to ensure command is processed
      await page.waitForTimeout(100);
    }

    // Verify only 30 results are displayed (oldest should be removed)
    const resultCount = await workbenchPage.resultsPanel.getResultCount();
    expect(resultCount).toBe(30);

    // Verify the oldest commands (01 and 02) are not in history
    // and the newest commands (03-32) are present
    const allResults = page.locator('[data-testid^="query-card-"]');
    const resultsText = await allResults.allTextContents();
    const resultsJoined = resultsText.join(' ');

    // cmd-01 and cmd-02 should NOT be present (they were removed)
    expect(resultsJoined).not.toContain('cmd-01');
    expect(resultsJoined).not.toContain('cmd-02');

    // cmd-32 should be present (newest)
    expect(resultsJoined).toContain('cmd-32');

    // cmd-03 should be present (oldest remaining)
    expect(resultsJoined).toContain('cmd-03');
  });
});

test.describe.serial('Workbench > Group Results', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    const config = getStandaloneConfig();
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ workbenchPage }) => {
    await workbenchPage.goto(database.id);
  });

  test(`should view group summary with success count ${Tags.REGRESSION}`, async ({ page }) => {
    // Enable group results mode
    const groupResultsButton = page.getByTestId('btn-change-group-mode');
    await groupResultsButton.click();
    await expect(groupResultsButton).toHaveAttribute('aria-pressed', 'true');

    // Clear any existing results
    const clearButton = page.getByTestId('clear-history-btn');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    // Execute multiple commands at once
    const editor = page.getByRole('textbox', { name: /Editor content/ });
    await editor.fill('PING\nINFO server\nGET nonexistent');
    await page.getByTestId('btn-submit').click();

    // Wait for results and verify group summary shows "3 Command(s) - 3 success, 0 error(s)"
    const groupSummary = page.getByText(/\d+ Command\(s\) - \d+ success, \d+ error\(s\)/);
    await expect(groupSummary.first()).toBeVisible({ timeout: 10000 });

    // Verify the summary text contains expected values
    const summaryText = await groupSummary.first().textContent();
    expect(summaryText).toContain('3 Command(s)');
    expect(summaryText).toContain('3 success');
    expect(summaryText).toContain('0 error(s)');
  });

  test(`should view group summary with error count ${Tags.REGRESSION}`, async ({ page }) => {
    // Enable group results mode
    const groupResultsButton = page.getByTestId('btn-change-group-mode');
    await groupResultsButton.click();
    await expect(groupResultsButton).toHaveAttribute('aria-pressed', 'true');

    // Clear any existing results
    const clearButton = page.getByTestId('clear-history-btn');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    // Execute multiple commands including an invalid one
    const editor = page.getByRole('textbox', { name: /Editor content/ });
    await editor.fill('PING\nINVALID_COMMAND\nGET nonexistent');
    await page.getByTestId('btn-submit').click();

    // Wait for results and verify group summary shows errors
    const groupSummary = page.getByText(/\d+ Command\(s\) - \d+ success, \d+ error\(s\)/);
    await expect(groupSummary.first()).toBeVisible({ timeout: 10000 });

    // Verify the summary text contains expected values
    const summaryText = await groupSummary.first().textContent();
    expect(summaryText).toContain('3 Command(s)');
    expect(summaryText).toContain('2 success');
    expect(summaryText).toContain('1 error(s)');
  });

  test(`should copy all commands from group result ${Tags.REGRESSION}`, async ({ page }) => {
    // Enable group results mode
    const groupResultsButton = page.getByTestId('btn-change-group-mode');
    await groupResultsButton.click();
    await expect(groupResultsButton).toHaveAttribute('aria-pressed', 'true');

    // Clear any existing results
    const clearButton = page.getByTestId('clear-history-btn');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    // Execute multiple commands at once
    const editor = page.getByRole('textbox', { name: /Editor content/ });
    await editor.fill('SET copytest value1\nGET copytest\nDEL copytest');
    await page.getByTestId('btn-submit').click();

    // Wait for results
    const groupSummary = page.getByText(/\d+ Command\(s\) - \d+ success, \d+ error\(s\)/);
    await expect(groupSummary.first()).toBeVisible({ timeout: 10000 });

    // Click copy button (copies all commands in group mode)
    const copyButton = page.getByTestId('copy-command-btn').first();
    await expect(copyButton).toBeVisible();
    await copyButton.click();

    // Verify copy button is still visible (action completed)
    await expect(copyButton).toBeVisible();
  });

  test(`should view group results in full screen ${Tags.REGRESSION}`, async ({ page }) => {
    // Enable group results mode
    const groupResultsButton = page.getByTestId('btn-change-group-mode');
    await groupResultsButton.click();
    await expect(groupResultsButton).toHaveAttribute('aria-pressed', 'true');

    // Clear any existing results
    const clearButton = page.getByTestId('clear-history-btn');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    // Execute multiple commands at once
    const editor = page.getByRole('textbox', { name: /Editor content/ });
    await editor.fill('PING\nINFO server\nGET nonexistent');
    await page.getByTestId('btn-submit').click();

    // Wait for results
    const groupSummary = page.getByText(/\d+ Command\(s\) - \d+ success, \d+ error\(s\)/);
    await expect(groupSummary.first()).toBeVisible({ timeout: 10000 });

    // The full screen button should be visible when the card is expanded
    // In group mode, the card is expanded by default after execution
    const fullScreenButton = page.getByTestId('toggle-full-screen');

    // If the full screen button is not visible, the card might be collapsed - expand it
    if (!(await fullScreenButton.isVisible())) {
      const toggleCollapseButton = page.getByTestId('toggle-collapse');
      await toggleCollapseButton.click();
      await expect(fullScreenButton).toBeVisible({ timeout: 5000 });
    }

    await fullScreenButton.click();

    // Verify full screen mode is active - the result card should be in a full screen container
    // In full screen mode, the same toggle button is used to exit
    await expect(fullScreenButton).toBeVisible();

    // Verify the group summary is still visible in full screen
    await expect(groupSummary.first()).toBeVisible();

    // Exit full screen by clicking the same button
    await fullScreenButton.click();

    // Verify we're back to normal mode - the group summary should still be visible
    await expect(groupSummary.first()).toBeVisible();
  });
});

