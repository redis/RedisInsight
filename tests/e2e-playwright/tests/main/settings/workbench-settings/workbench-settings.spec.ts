import { test, expect } from '../../../../fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';

/**
 * Workbench Settings tests (TEST_PLAN.md: 7.3 Workbench Settings)
 *
 * Verifies Workbench section controls are visible, that changing
 * editor cleanup and pipeline commands settings persists after navigation,
 * and that those settings take effect in the Workbench (editor cleanup clears
 * or keeps the editor after running a command).
 *
 * Note: "Configure command timeout" is N/A -- it's a per-database setting, not on the Settings page.
 */
test.describe('Workbench Settings', () => {
  test.beforeEach(async ({ settingsPage }) => {
    await settingsPage.goto();
  });

  test('should show editor cleanup switch', async ({ settingsPage }) => {
    await settingsPage.expandWorkbench();
    await expect(settingsPage.editorCleanupSwitch).toBeVisible();
  });

  test('should show pipeline commands setting', async ({ settingsPage }) => {
    await settingsPage.expandWorkbench();
    await expect(settingsPage.pipelineCommandsText).toBeVisible();
  });

  test('should save editor cleanup when toggled', async ({
    settingsPage,
    databasesPage,
  }) => {
    await settingsPage.expandWorkbench();
    await expect(settingsPage.editorCleanupSwitch).toBeVisible();

    const initialState = await settingsPage.isEditorCleanupEnabled();
    await settingsPage.toggleEditorCleanup();
    const toggledState = await settingsPage.isEditorCleanupEnabled();
    expect(toggledState).toBe(!initialState);

    await databasesPage.goto();
    await settingsPage.goto();
    await settingsPage.expandWorkbench();
    const persistedState = await settingsPage.isEditorCleanupEnabled();
    expect(persistedState).toBe(toggledState);

    await settingsPage.toggleEditorCleanup();
    const restoredState = await settingsPage.isEditorCleanupEnabled();
    expect(restoredState).toBe(initialState);
  });

  test('should save pipeline commands when changed', async ({
    settingsPage,
    databasesPage,
  }) => {
    await settingsPage.expandWorkbench();
    await expect(settingsPage.pipelineCommandsValue).toBeVisible();

    const initialValue = await settingsPage.getPipelineCommandsValue();
    await settingsPage.setPipelineCommandsAndApply(2);
    await expect(settingsPage.pipelineCommandsValue).toHaveText('2');

    await databasesPage.goto();
    await settingsPage.goto();
    await settingsPage.expandWorkbench();
    const persistedValue = await settingsPage.getPipelineCommandsValue();
    expect(persistedValue.trim()).toBe('2');

    const restoreValue = initialValue.trim() ? parseInt(initialValue, 10) : 5;
    await settingsPage.setPipelineCommandsAndApply(restoreValue);
    await expect(settingsPage.pipelineCommandsValue).toHaveText(
      String(restoreValue),
    );
  });
});

test.describe('Workbench Settings take effect', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    const config = StandaloneConfigFactory.build({
      name: `test-wb-settings-${Date.now().toString(36)}`,
    });
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test('editor cleanup when enabled clears editor after running command', async ({
    settingsPage,
    workbenchPage,
  }) => {
    await settingsPage.goto();
    await settingsPage.expandWorkbench();
    if (!(await settingsPage.isEditorCleanupEnabled())) {
      await settingsPage.toggleEditorCleanup();
    }

    await workbenchPage.goto(database.id);
    await workbenchPage.executeCommand('PING');

    const editorContent = await workbenchPage.editor.getCommand();
    expect(editorContent.trim()).toBe('');
  });

  test('editor cleanup when disabled keeps command in editor after run', async ({
    settingsPage,
    workbenchPage,
  }) => {
    await settingsPage.goto();
    await settingsPage.expandWorkbench();
    if (await settingsPage.isEditorCleanupEnabled()) {
      await settingsPage.toggleEditorCleanup();
    }

    await workbenchPage.goto(database.id);
    await workbenchPage.executeCommand('PING');

    const editorContent = await workbenchPage.editor.getCommand();
    expect(editorContent.trim()).toContain('PING');
  });
});
