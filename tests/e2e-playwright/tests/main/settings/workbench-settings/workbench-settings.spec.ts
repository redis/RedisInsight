import { test, expect } from '../../../../fixtures/base';

/**
 * Workbench Settings tests (TEST_PLAN.md: 7.3 Workbench Settings)
 *
 * Tests for the Workbench section on the Settings page.
 * Verifies editor cleanup switch and pipeline commands setting are displayed.
 *
 * Note: "Configure command timeout" is N/A -- it's a per-database setting, not on the Settings page.
 */
test.describe('Workbench Settings', () => {
  test.beforeEach(async ({ settingsPage }) => {
    await settingsPage.goto();
    await settingsPage.expandWorkbench();
  });

  test('should show editor cleanup switch', async ({ settingsPage }) => {
    await expect(settingsPage.editorCleanupSwitch).toBeVisible();
  });

  test('should show pipeline commands setting', async ({ settingsPage }) => {
    await expect(settingsPage.pipelineCommandsText).toBeVisible();
  });
});
