import { test, expect } from '../../../../fixtures/base';

/**
 * Copilot Panel tests (TEST_PLAN.md: 0.4 Copilot Panel)
 *
 * Note: Copilot feature is controlled by feature flags (databaseChat, documentationChat).
 * If neither feature is enabled, the Copilot trigger button won't be visible.
 * Tests will skip if Copilot is not available in the current environment.
 */
test.describe('Copilot Panel', () => {
  test.beforeEach(async ({ sidebarPanel }) => {
    await sidebarPanel.goto();
  });

  test('should open Copilot panel and display sign-in options', async ({ sidebarPanel }) => {
    const { copilotPanel } = sidebarPanel;

    // Skip test if Copilot feature is not available (feature-flagged)
    const isCopilotAvailable = await copilotPanel.trigger.isVisible();
    if (!isCopilotAvailable) {
      test.skip();
      return;
    }

    // Open Copilot panel (open() waits for title visibility)
    await copilotPanel.open();

    // Verify sign-in options are displayed (Google, GitHub, SSO)
    await expect(copilotPanel.googleSignIn).toBeVisible();
    await expect(copilotPanel.githubSignIn).toBeVisible();
    await expect(copilotPanel.ssoSignIn).toBeVisible();

    // Verify terms checkbox is displayed
    await expect(copilotPanel.termsCheckbox).toBeVisible();

    // Verify full screen button is displayed
    await expect(copilotPanel.fullScreenButton).toBeVisible();
  });

  test('should close Copilot panel', async ({ sidebarPanel }) => {
    const { copilotPanel } = sidebarPanel;

    // Skip test if Copilot feature is not available (feature-flagged)
    const isCopilotAvailable = await copilotPanel.trigger.isVisible();
    if (!isCopilotAvailable) {
      test.skip();
      return;
    }

    // Open Copilot panel
    await copilotPanel.open();

    // Close Copilot panel (close() waits for title to be hidden)
    await copilotPanel.close();

    // Verify panel is closed
    await expect(copilotPanel.title).not.toBeVisible();
  });
});
