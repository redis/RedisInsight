import { test, expect } from '../../../../fixtures/base';

/**
 * Advanced Settings tests (TEST_PLAN.md: 7.5 Advanced Settings)
 *
 * Tests for the Advanced section on the Settings page.
 * Verifies the warning callout and "Keys to Scan" configuration are displayed.
 */
test.describe('Advanced Settings', () => {
  test.beforeEach(async ({ settingsPage }) => {
    await settingsPage.goto();
    await settingsPage.expandAdvanced();
  });

  test('should show advanced settings warning', async ({ settingsPage }) => {
    await expect(settingsPage.advancedWarning).toBeVisible();
  });

  test('should show keys to scan setting', async ({ settingsPage }) => {
    await expect(settingsPage.keysToScanText).toBeVisible();
  });
});
