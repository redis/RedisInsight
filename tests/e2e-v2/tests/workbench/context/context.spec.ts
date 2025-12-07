import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig } from '../../../test-data/databases';
import { WorkbenchPage } from '../../../pages';

/**
 * Workbench Context Tests
 *
 * Tests that workbench context (editor content, CLI state) is preserved
 * when navigating between tabs.
 */
test.describe.serial('Workbench > Context Preservation', () => {
  let databaseId: string;
  let workbenchPage: WorkbenchPage;

  test.beforeAll(async ({ apiHelper }) => {
    // Create a test database with unique name
    const dbName = `test-wb-context-${Date.now().toString(36)}`;
    const config = getStandaloneConfig({ name: dbName });
    const db = await apiHelper.createDatabase(config);
    databaseId = db.id;
  });

  test.afterAll(async ({ apiHelper }) => {
    // Clean up
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

  test(`should preserve editor content when switching tabs ${Tags.SMOKE}`, async ({ page }) => {
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

  test(`should clear context when page is reloaded ${Tags.REGRESSION}`, async ({ page }) => {
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
});

