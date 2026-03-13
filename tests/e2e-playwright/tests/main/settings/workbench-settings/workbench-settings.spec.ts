import { test, expect } from '../../../../fixtures/base';

/**
 * Workbench Settings tests (TEST_PLAN.md: 7.3 Workbench Settings)
 *
 * Verifies Workbench section controls are visible and that changing
 * editor cleanup and pipeline commands settings persists after navigation.
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
