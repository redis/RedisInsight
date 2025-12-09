import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig } from '../../../test-data/databases';
import { DatabaseInstance } from '../../../types';

/**
 * Workbench Context Tests
 *
 * Tests that workbench context (editor content, CLI state) is preserved
 * when navigating between tabs.
 */
test.describe.serial('Workbench > Context Preservation', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    // Create a test database with unique name
    const dbName = `test-wb-context-${Date.now().toString(36)}`;
    const config = getStandaloneConfig({ name: dbName });
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    // Clean up
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ workbenchPage }) => {
    await workbenchPage.goto(database.id);
  });

  test(`should preserve editor content when switching tabs ${Tags.SMOKE}`, async ({ page, workbenchPage }) => {
    // Type a command in the editor
    const testCommand = 'PING';
    await workbenchPage.editor.setCommand(testCommand);

    // Verify the command is in the editor
    const editorContent = await workbenchPage.editor.getCommand();
    expect(editorContent).toContain(testCommand);

    // Navigate to Browser tab
    await page.getByRole('tab', { name: 'Browse' }).click();
    await page.waitForTimeout(500);

    // Navigate back to Workbench tab
    await page.getByRole('tab', { name: 'Workbench' }).click();
    await page.waitForTimeout(500);

    // Verify the command is still in the editor
    const preservedContent = await workbenchPage.editor.getCommand();
    expect(preservedContent).toContain(testCommand);
  });

  test(`should preserve command results when switching tabs ${Tags.REGRESSION}`, async ({
    page,
    workbenchPage,
  }) => {
    // Execute a command
    await workbenchPage.executeCommand('PING');

    // Verify result is shown
    await expect(workbenchPage.resultsPanel.container).toBeVisible();
    // Verify result count
    const resultCount = await workbenchPage.resultsPanel.getResultCount();
    expect(resultCount).toBe(1);

    // Navigate to Browser tab
    await page.getByRole('tab', { name: 'Browse' }).click();
    await page.waitForTimeout(500);

    // Navigate back to Workbench tab
    await page.getByRole('tab', { name: 'Workbench' }).click();
    await page.waitForTimeout(500);

    // Verify the result card is still visible (context preserved)
    await expect(workbenchPage.resultsPanel.container).toBeVisible();
    const preservedCount = await workbenchPage.resultsPanel.getResultCount();
    expect(preservedCount).toBe(1);
  });

  test(`should clear context when page is reloaded ${Tags.REGRESSION}`, async ({ page, workbenchPage }) => {
    // Type a command in the editor
    const testCommand = 'INFO';
    await workbenchPage.editor.setCommand(testCommand);

    // Execute the command
    await workbenchPage.executeCommand('PING');

    // Verify result is shown
    await expect(workbenchPage.resultsPanel.container).toBeVisible();

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait for workbench to load
    await workbenchPage.waitForLoad();

    // Verify the editor is cleared or has default content
    const editorContent = await workbenchPage.editor.getCommand();
    // After reload, editor should not contain our test command
    expect(editorContent).not.toContain(testCommand);
  });

  test(`should preserve Insights panel state when navigating ${Tags.REGRESSION}`, async ({
    page,
  }) => {
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // Open Insights panel using button role with accessible name
    const insightsButton = page.getByRole('button', { name: 'Insights-trigger' });
    await expect(insightsButton).toBeVisible({ timeout: 10000 });
    await insightsButton.click();
    await page.waitForTimeout(500);

    // Verify Insights panel is open by checking for the Insights title and tabs
    const insightsTitle = page.getByText('Insights').first();
    await expect(insightsTitle).toBeVisible();
    const tutorialsTab = page.getByRole('tab', { name: 'Tutorials' });
    await expect(tutorialsTab).toBeVisible();

    // Navigate to Browser tab
    await page.getByRole('tab', { name: 'Browse' }).click();
    await page.waitForTimeout(500);

    // Navigate back to Workbench tab
    await page.getByRole('tab', { name: 'Workbench' }).click();
    await page.waitForTimeout(500);

    // Verify Insights panel is still open
    await expect(insightsTitle).toBeVisible();
    await expect(tutorialsTab).toBeVisible();
  });
});

