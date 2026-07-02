import { test, expect } from '../../../../fixtures/base';

/**
 * Help Menu tests (TEST_PLAN.md: 0.2 Help Menu)
 *
 * Tests for the Help center menu accessed from the sidebar navigation.
 * The Help Menu provides access to:
 * - Provide Feedback link (GitHub issues)
 * - Keyboard shortcuts option (detailed tests in 12.8 Keyboard shortcuts)
 * - Release notes link
 * - Reset onboarding option
 */
test.describe('Help Menu', () => {
  test.beforeEach(async ({ sidebarPanel }) => {
    await sidebarPanel.goto();
  });

  test('should open Help center and display all menu options', async ({ sidebarPanel }) => {
    const { helpMenu } = sidebarPanel;
    await helpMenu.open();

    // Verify Help center dialog is open with all expected options
    await expect(helpMenu.helpMenuDialog).toBeVisible();
    await expect(helpMenu.provideFeedbackLink).toBeVisible();
    await expect(helpMenu.keyboardShortcutsButton).toBeVisible();
    await expect(helpMenu.releaseNotesLink).toBeVisible();
    await expect(helpMenu.resetOnboardingButton).toBeVisible();
  });

  test('should have Release notes link pointing to GitHub releases', async ({ sidebarPanel }) => {
    const { helpMenu } = sidebarPanel;
    await helpMenu.open();

    // Verify link has correct href and opens in new tab
    await expect(helpMenu.releaseNotesLink).toHaveAttribute(
      'href',
      'https://github.com/RedisInsight/RedisInsight/releases',
    );
    await expect(helpMenu.releaseNotesLink).toHaveAttribute('target', '_blank');
  });

  test('should have Provide Feedback link pointing to GitHub issues', async ({ sidebarPanel }) => {
    const { helpMenu } = sidebarPanel;
    await helpMenu.open();

    // Verify link has correct href and opens in new tab
    await expect(helpMenu.provideFeedbackLink).toHaveAttribute(
      'href',
      'https://github.com/RedisInsight/RedisInsight/issues',
    );
    await expect(helpMenu.provideFeedbackLink).toHaveAttribute('target', '_blank');
  });
});
