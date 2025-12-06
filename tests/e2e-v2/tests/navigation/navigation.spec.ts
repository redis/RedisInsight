import { test, expect } from '../../fixtures/base';
import { Tags } from '../../config';

test.describe('Navigation & Global UI', () => {
  test.describe('Main Navigation', () => {
    test(`should display main navigation ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({
      navigationPage,
    }) => {
      await navigationPage.goto();

      await expect(navigationPage.mainNavigation).toBeVisible();
    });

    test(`should show Redis logo ${Tags.SMOKE}`, async ({
      navigationPage,
    }) => {
      await navigationPage.goto();

      await expect(navigationPage.redisLogo).toBeVisible();
    });

    test(`should navigate to home via Redis logo ${Tags.CRITICAL}`, async ({
      navigationPage,
      page,
    }) => {
      // Navigate to settings first
      await page.goto('/settings');
      await page.waitForURL('**/settings');

      // Click Redis logo
      await navigationPage.clickRedisLogo();

      // Should be back at home
      await expect(page).toHaveURL(/\/$/);
    });

    test(`should show settings button ${Tags.SMOKE}`, async ({
      navigationPage,
    }) => {
      await navigationPage.goto();

      await expect(navigationPage.settingsButton).toBeVisible();
    });

    test(`should navigate to settings page ${Tags.CRITICAL}`, async ({
      navigationPage,
      page,
    }) => {
      await navigationPage.goto();
      await navigationPage.goToSettings();

      await expect(page).toHaveURL(/\/settings/);
    });

    test(`should show GitHub link ${Tags.REGRESSION}`, async ({
      navigationPage,
    }) => {
      await navigationPage.goto();

      await expect(navigationPage.githubLink).toBeVisible();
      await expect(navigationPage.githubLink).toHaveAttribute('href', 'https://github.com/RedisInsight/RedisInsight');
    });

    test(`should show Redis Cloud link ${Tags.REGRESSION}`, async ({
      navigationPage,
    }) => {
      await navigationPage.goto();

      await expect(navigationPage.cloudLink).toBeVisible();
    });
  });

  test.describe('Help Menu', () => {
    test(`should open help menu ${Tags.SMOKE}`, async ({
      navigationPage,
    }) => {
      await navigationPage.goto();
      await navigationPage.openHelpMenu();

      const isOpen = await navigationPage.isHelpMenuOpen();
      expect(isOpen).toBe(true);
    });

    test(`should show Provide Feedback link ${Tags.REGRESSION}`, async ({
      navigationPage,
    }) => {
      await navigationPage.goto();
      await navigationPage.openHelpMenu();

      await expect(navigationPage.provideFeedbackLink).toBeVisible();
    });

    test(`should show Keyboard Shortcuts option ${Tags.REGRESSION}`, async ({
      navigationPage,
    }) => {
      await navigationPage.goto();
      await navigationPage.openHelpMenu();

      await expect(navigationPage.keyboardShortcutsButton).toBeVisible();
    });

    test(`should show Release Notes link ${Tags.REGRESSION}`, async ({
      navigationPage,
    }) => {
      await navigationPage.goto();
      await navigationPage.openHelpMenu();

      await expect(navigationPage.releaseNotesLink).toBeVisible();
    });

    test(`should show Reset Onboarding option ${Tags.REGRESSION}`, async ({
      navigationPage,
    }) => {
      await navigationPage.goto();
      await navigationPage.openHelpMenu();

      await expect(navigationPage.resetOnboardingButton).toBeVisible();
    });
  });

  test.describe('Notification Center', () => {
    test(`should open notification center ${Tags.SMOKE}`, async ({
      navigationPage,
    }) => {
      await navigationPage.goto();
      await navigationPage.openNotificationCenter();

      const isOpen = await navigationPage.isNotificationCenterOpen();
      expect(isOpen).toBe(true);
    });

    test(`should show notification center title ${Tags.REGRESSION}`, async ({
      navigationPage,
    }) => {
      await navigationPage.goto();
      await navigationPage.openNotificationCenter();

      await expect(navigationPage.notificationCenterTitle).toBeVisible();
    });

    test(`should close notification center ${Tags.REGRESSION}`, async ({
      navigationPage,
    }) => {
      await navigationPage.goto();
      await navigationPage.openNotificationCenter();

      // Verify it's open
      expect(await navigationPage.isNotificationCenterOpen()).toBe(true);

      // Close it
      await navigationPage.closeNotificationCenter();

      // Verify it's closed
      expect(await navigationPage.isNotificationCenterOpen()).toBe(false);
    });
  });
});

