import { test, expect } from '../../../../fixtures/base';

test.describe('Copilot Panel', () => {
  test.beforeEach(async ({ sidebarPanel }) => {
    await sidebarPanel.goto();
  });

  test('should open Copilot panel and display sign-in options', async ({ sidebarPanel }) => {
    const { copilotPanel } = sidebarPanel;

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

    // Open Copilot panel
    await copilotPanel.open();

    // Close Copilot panel (close() waits for title to be hidden)
    await copilotPanel.close();

    // Verify panel is closed
    await expect(copilotPanel.title).not.toBeVisible();
  });
});
