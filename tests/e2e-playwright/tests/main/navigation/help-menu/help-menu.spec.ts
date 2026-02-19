import { test, expect } from '../../../../fixtures/base';

/**
 * Help Menu tests (TEST_PLAN.md: 0.2 Help Menu)
 *
 * Tests for the Help Center menu accessed from the sidebar navigation.
 * The Help Menu provides access to:
 * - Provide Feedback link (GitHub issues)
 * - Keyboard Shortcuts option (detailed tests in 12.8 Keyboard Shortcuts)
 * - Release Notes link
 * - Reset Onboarding option
 */
test.describe('Help Menu', () => {
  test.beforeEach(async ({ sidebarPanel }) => {
    await sidebarPanel.goto();
  });

  test('should open Help Center and display all menu options', async ({ sidebarPanel }) => {
    await sidebarPanel.openHelpMenu();

    // Verify Help Center dialog is open with all expected options
    await expect(sidebarPanel.helpMenuDialog).toBeVisible();
    await expect(sidebarPanel.provideFeedbackLink).toBeVisible();
    await expect(sidebarPanel.keyboardShortcutsButton).toBeVisible();
    await expect(sidebarPanel.releaseNotesLink).toBeVisible();
    await expect(sidebarPanel.resetOnboardingButton).toBeVisible();
  });

  test('should have Release Notes link pointing to GitHub releases', async ({ sidebarPanel }) => {
    await sidebarPanel.openHelpMenu();

    // Verify link has correct href and opens in new tab
    await expect(sidebarPanel.releaseNotesLink).toHaveAttribute(
      'href',
      'https://github.com/RedisInsight/RedisInsight/releases',
    );
    await expect(sidebarPanel.releaseNotesLink).toHaveAttribute('target', '_blank');
  });

  test('should have Provide Feedback link pointing to GitHub issues', async ({ sidebarPanel }) => {
    await sidebarPanel.openHelpMenu();

    // Verify link has correct href and opens in new tab
    await expect(sidebarPanel.provideFeedbackLink).toHaveAttribute(
      'href',
      'https://github.com/RedisInsight/RedisInsight/issues',
    );
    await expect(sidebarPanel.provideFeedbackLink).toHaveAttribute('target', '_blank');
  });
});
