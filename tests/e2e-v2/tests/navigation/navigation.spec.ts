import { test, expect } from '../../fixtures/base';
import { Tags } from '../../config';

test.describe('Navigation & Global UI', () => {
  test.describe('Main Navigation', () => {
    test(`should display main navigation ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ navigationPage }) => {
      await navigationPage.goto();

      await expect(navigationPage.mainNavigation).toBeVisible();
    });

    test(`should show Redis logo ${Tags.SMOKE}`, async ({ navigationPage }) => {
      await navigationPage.goto();

      await expect(navigationPage.redisLogo).toBeVisible();
    });

    test(`should navigate to home via Redis logo ${Tags.CRITICAL}`, async ({ navigationPage, page }) => {
      // Navigate to settings first
      await page.goto('/settings');
      await page.waitForURL('**/settings');

      // Click Redis logo
      await navigationPage.clickRedisLogo();

      // Should be back at home
      await expect(page).toHaveURL(/\/$/);
    });

    test(`should show settings button ${Tags.SMOKE}`, async ({ navigationPage }) => {
      await navigationPage.goto();

      await expect(navigationPage.settingsButton).toBeVisible();
    });

    test(`should navigate to settings page ${Tags.CRITICAL}`, async ({ navigationPage, page }) => {
      await navigationPage.goto();
      await navigationPage.goToSettings();

      await expect(page).toHaveURL(/\/settings/);
    });

    test(`should show GitHub link ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();

      await expect(navigationPage.githubLink).toBeVisible();
      await expect(navigationPage.githubLink).toHaveAttribute('href', 'https://github.com/RedisInsight/RedisInsight');
    });

    test(`should show Redis Cloud link ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();

      await expect(navigationPage.cloudLink).toBeVisible();
    });
  });

  test.describe('Help Menu', () => {
    test(`should open help menu ${Tags.SMOKE}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openHelpMenu();

      const isOpen = await navigationPage.isHelpMenuOpen();
      expect(isOpen).toBe(true);
    });

    test(`should show Provide Feedback link ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openHelpMenu();

      await expect(navigationPage.provideFeedbackLink).toBeVisible();
    });

    test(`should show Keyboard Shortcuts option ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openHelpMenu();

      await expect(navigationPage.keyboardShortcutsButton).toBeVisible();
    });

    test(`should show Release Notes link ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openHelpMenu();

      await expect(navigationPage.releaseNotesLink).toBeVisible();
    });

    test(`should show Reset Onboarding option ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openHelpMenu();

      await expect(navigationPage.resetOnboardingButton).toBeVisible();
    });
  });

  test.describe('Notification Center', () => {
    test(`should open notification center ${Tags.SMOKE}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openNotificationCenter();

      const isOpen = await navigationPage.isNotificationCenterOpen();
      expect(isOpen).toBe(true);
    });

    test(`should show notification center title ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openNotificationCenter();

      await expect(navigationPage.notificationCenterTitle).toBeVisible();
    });

    test(`should close notification center ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openNotificationCenter();

      // Verify it's open
      expect(await navigationPage.isNotificationCenterOpen()).toBe(true);

      // Close it
      await navigationPage.closeNotificationCenter();

      // Verify it's closed
      expect(await navigationPage.isNotificationCenterOpen()).toBe(false);
    });

    test(`should show notification list ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openNotificationCenter();

      // Verify notification items are visible
      const notificationCount = await navigationPage.getNotificationCount();
      expect(notificationCount).toBeGreaterThan(0);
    });

    test(`should show notification links ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openNotificationCenter();

      // Verify notification links are visible
      const hasLinks = await navigationPage.hasNotificationLinks();
      expect(hasLinks).toBe(true);
    });

    test(`should display notification with title, description, and timestamp ${Tags.REGRESSION}`, async ({
      navigationPage,
    }) => {
      await navigationPage.goto();
      await navigationPage.openNotificationCenter();

      // Verify notification dialog is visible
      await expect(navigationPage.notificationDialog).toBeVisible();

      // Get the first notification item
      const firstNotification = navigationPage.notificationDialog.locator('> div > div > div').nth(1);

      // Verify notification has title (first text element)
      const title = firstNotification.locator('div').first();
      await expect(title).toBeVisible();
      const titleText = await title.textContent();
      expect(titleText?.length).toBeGreaterThan(0);

      // Verify notification has description (paragraph element)
      const description = firstNotification.locator('p').first();
      await expect(description).toBeVisible();

      // Verify notification has timestamp (date format like "18 Aug 2025")
      const timestampPattern = /\d{1,2}\s+\w{3}\s+\d{4}/;
      const notificationText = await firstNotification.textContent();
      expect(notificationText).toMatch(timestampPattern);
    });
  });

  test.describe('Copilot Panel', () => {
    test(`should open Copilot panel ${Tags.SMOKE}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openCopilotPanel();

      const isOpen = await navigationPage.isCopilotPanelOpen();
      expect(isOpen).toBe(true);
    });

    test(`should close Copilot panel ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openCopilotPanel();

      // Verify it's open
      expect(await navigationPage.isCopilotPanelOpen()).toBe(true);

      // Close it
      await navigationPage.closeCopilotPanel();

      // Verify it's closed
      expect(await navigationPage.isCopilotPanelOpen()).toBe(false);
    });

    test(`should show sign-in options ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openCopilotPanel();

      await expect(navigationPage.copilotGoogleSignIn).toBeVisible();
      await expect(navigationPage.copilotGithubSignIn).toBeVisible();
      await expect(navigationPage.copilotSsoSignIn).toBeVisible();
    });

    test(`should show terms checkbox ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openCopilotPanel();

      await expect(navigationPage.copilotTermsCheckbox).toBeVisible();
    });
  });

  test.describe('Insights Panel', () => {
    test(`should open Insights panel ${Tags.SMOKE}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openInsightsPanel();

      const isOpen = await navigationPage.isInsightsPanelOpen();
      expect(isOpen).toBe(true);
    });

    test(`should close Insights panel ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openInsightsPanel();

      // Verify it's open
      expect(await navigationPage.isInsightsPanelOpen()).toBe(true);

      // Close it
      await navigationPage.closeInsightsPanel();

      // Verify it's closed
      expect(await navigationPage.isInsightsPanelOpen()).toBe(false);
    });

    test(`should show Tutorials tab ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openInsightsPanel();

      await expect(navigationPage.insightsTutorialsTab).toBeVisible();
    });

    test(`should show Tips tab ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openInsightsPanel();

      await expect(navigationPage.insightsTipsTab).toBeVisible();
    });

    test(`should switch to Tips tab ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openInsightsPanel();
      await navigationPage.switchToTipsTab();

      await expect(navigationPage.insightsTipsTab).toHaveAttribute('aria-selected', 'true');
    });

    test(`should show My tutorials section ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openInsightsPanel();

      await expect(navigationPage.insightsMyTutorials).toBeVisible();
    });

    test(`should show full screen button ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openInsightsPanel();

      // Verify full screen button is visible
      await expect(navigationPage.insightsFullScreenButton).toBeVisible();
    });

    test(`should expand/collapse tutorial folders ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openInsightsPanel();

      // Redis tutorials should be expanded by default
      expect(await navigationPage.isRedisTutorialsExpanded()).toBe(true);

      // Collapse Redis tutorials
      await navigationPage.toggleRedisTutorials();
      expect(await navigationPage.isRedisTutorialsExpanded()).toBe(false);

      // Expand Redis tutorials again
      await navigationPage.toggleRedisTutorials();
      expect(await navigationPage.isRedisTutorialsExpanded()).toBe(true);
    });

    test(`should show tutorial folder contents ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openInsightsPanel();

      // Verify tutorial folders are visible
      await expect(navigationPage.getTutorialFolder('Redis basic and RAG use cases')).toBeVisible();
      await expect(navigationPage.getTutorialFolder('Vector search examples')).toBeVisible();
      await expect(navigationPage.getTutorialFolder('How to query your data')).toBeVisible();
      await expect(navigationPage.getTutorialFolder('Data structures explained')).toBeVisible();
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test(`should open keyboard shortcuts dialog ${Tags.SMOKE}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openKeyboardShortcuts();

      const isOpen = await navigationPage.isKeyboardShortcutsOpen();
      expect(isOpen).toBe(true);
    });

    test(`should show Desktop application shortcuts section ${Tags.SMOKE}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openKeyboardShortcuts();

      await expect(navigationPage.shortcutsDesktopSection).toBeVisible();
    });

    test(`should show CLI shortcuts section ${Tags.SMOKE}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openKeyboardShortcuts();

      await expect(navigationPage.shortcutsCliSection).toBeVisible();
    });

    test(`should show Workbench shortcuts section ${Tags.SMOKE}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openKeyboardShortcuts();

      await expect(navigationPage.shortcutsWorkbenchSection).toBeVisible();
    });

    test(`should close keyboard shortcuts dialog ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openKeyboardShortcuts();

      // Verify it's open
      expect(await navigationPage.isKeyboardShortcutsOpen()).toBe(true);

      // Close it
      await navigationPage.closeKeyboardShortcuts();

      // Verify it's closed
      expect(await navigationPage.isKeyboardShortcutsOpen()).toBe(false);
    });

    test(`should display desktop shortcuts ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openKeyboardShortcuts();

      // Desktop section should have at least 2 shortcuts (Open new window, Reload page)
      const count = await navigationPage.getShortcutCount('desktop');
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test(`should display CLI shortcuts ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openKeyboardShortcuts();

      // CLI section should have at least 5 shortcuts
      const count = await navigationPage.getShortcutCount('cli');
      expect(count).toBeGreaterThanOrEqual(5);
    });

    test(`should display Workbench shortcuts ${Tags.REGRESSION}`, async ({ navigationPage }) => {
      await navigationPage.goto();
      await navigationPage.openKeyboardShortcuts();

      // Workbench section should have at least 6 shortcuts
      const count = await navigationPage.getShortcutCount('workbench');
      expect(count).toBeGreaterThanOrEqual(6);
    });
  });
});
