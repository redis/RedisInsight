import { test, expect } from '../../fixtures/base';
import { Tags } from '../../config';
import { SettingsPage } from '../../pages';

test.describe('Settings', () => {
  let settingsPage: SettingsPage;

  test.describe('Page Display', () => {
    test.beforeEach(async ({ settingsPage: sp }) => {
      settingsPage = sp;
      await settingsPage.goto();
    });

    test(`should display settings page ${Tags.SMOKE} ${Tags.CRITICAL}`, async () => {
      await expect(settingsPage.pageTitle).toBeVisible();
    });

    test(`should show all settings sections ${Tags.SMOKE}`, async () => {
      await expect(settingsPage.generalButton).toBeVisible();
      await expect(settingsPage.privacyButton).toBeVisible();
      await expect(settingsPage.workbenchButton).toBeVisible();
      await expect(settingsPage.redisCloudButton).toBeVisible();
      await expect(settingsPage.advancedButton).toBeVisible();
    });
  });

  test.describe('General Settings', () => {
    test.beforeEach(async ({ settingsPage: sp }) => {
      settingsPage = sp;
      await settingsPage.goto();
      await settingsPage.expandGeneral();
    });

    test(`should expand general settings section ${Tags.CRITICAL}`, async () => {
      const isExpanded = await settingsPage.isGeneralExpanded();
      expect(isExpanded).toBe(true);
    });

    test(`should show theme dropdown ${Tags.CRITICAL}`, async () => {
      await expect(settingsPage.themeDropdown).toBeVisible();
    });

    test(`should show date format options ${Tags.REGRESSION}`, async () => {
      await expect(settingsPage.dateFormatRadioPreselected).toBeVisible();
      await expect(settingsPage.dateFormatRadioCustom).toBeVisible();
    });

    test(`should show timezone dropdown ${Tags.REGRESSION}`, async () => {
      await expect(settingsPage.timezoneDropdown).toBeVisible();
    });

    test(`should show notification switch ${Tags.REGRESSION}`, async () => {
      await expect(settingsPage.notificationSwitch).toBeVisible();
    });

    test(`should change date/time format (custom) ${Tags.REGRESSION}`, async () => {
      // Set custom date format
      const customFormat = 'yyyy-MM-dd HH:mm:ss';
      await settingsPage.setCustomDateFormat(customFormat);

      // Verify the preview shows the new format (year first)
      const preview = await settingsPage.getDatePreviewValue();
      // The preview should start with the year (4 digits)
      expect(preview).toMatch(/^\d{4}-\d{2}-\d{2}/);
    });
  });

  test.describe('Privacy Settings', () => {
    test.beforeEach(async ({ settingsPage: sp }) => {
      settingsPage = sp;
      await settingsPage.goto();
      await settingsPage.expandPrivacy();
    });

    test(`should expand privacy settings section ${Tags.REGRESSION}`, async () => {
      const isExpanded = await settingsPage.isPrivacyExpanded();
      expect(isExpanded).toBe(true);
    });

    test(`should show usage data switch ${Tags.REGRESSION}`, async () => {
      await expect(settingsPage.usageDataSwitch).toBeVisible();
    });

    test(`should show privacy policy link ${Tags.REGRESSION}`, async () => {
      await expect(settingsPage.privacyPolicyLink).toBeVisible();
    });
  });

  test.describe('Workbench Settings', () => {
    test.beforeEach(async ({ settingsPage: sp }) => {
      settingsPage = sp;
      await settingsPage.goto();
      await settingsPage.expandWorkbench();
    });

    test(`should expand workbench settings section ${Tags.REGRESSION}`, async () => {
      const isExpanded = await settingsPage.isWorkbenchExpanded();
      expect(isExpanded).toBe(true);
    });

    test(`should show editor cleanup switch ${Tags.REGRESSION}`, async () => {
      await expect(settingsPage.editorCleanupSwitch).toBeVisible();
    });

    test(`should show pipeline commands setting ${Tags.REGRESSION}`, async () => {
      await expect(settingsPage.pipelineCommandsText).toBeVisible();
    });
  });

  test.describe('Advanced Settings', () => {
    test.beforeEach(async ({ settingsPage: sp }) => {
      settingsPage = sp;
      await settingsPage.goto();
      await settingsPage.expandAdvanced();
    });

    test(`should expand advanced settings section ${Tags.REGRESSION}`, async () => {
      const isExpanded = await settingsPage.isAdvancedExpanded();
      expect(isExpanded).toBe(true);
    });

    test(`should show advanced settings warning ${Tags.REGRESSION}`, async () => {
      await expect(settingsPage.advancedWarning).toBeVisible();
    });

    test(`should show keys to scan setting ${Tags.REGRESSION}`, async () => {
      await expect(settingsPage.keysToScanText).toBeVisible();
    });
  });

  test.describe('Redis Cloud Settings', () => {
    test.beforeEach(async ({ settingsPage: sp }) => {
      settingsPage = sp;
      await settingsPage.goto();
      await settingsPage.expandRedisCloud();
    });

    test(`should expand Redis Cloud settings section ${Tags.REGRESSION}`, async () => {
      const isExpanded = await settingsPage.isRedisCloudExpanded();
      expect(isExpanded).toBe(true);
    });

    test(`should show API user keys section ${Tags.REGRESSION}`, async () => {
      await expect(settingsPage.apiUserKeysText).toBeVisible();
    });

    test(`should show Remove all API keys button ${Tags.REGRESSION}`, async () => {
      await expect(settingsPage.removeApiKeysButton).toBeVisible();
    });

    test(`should show Autodiscover button ${Tags.REGRESSION}`, async () => {
      await expect(settingsPage.autodiscoverButton).toBeVisible();
    });

    test(`should show Create Redis Cloud database button ${Tags.REGRESSION}`, async () => {
      await expect(settingsPage.createCloudDbButton).toBeVisible();
    });
  });

  test.describe('Update Settings', () => {
    test.beforeEach(async ({ settingsPage: sp }) => {
      settingsPage = sp;
      await settingsPage.goto();
      await settingsPage.expandGeneral();
    });

    test(`should change theme and apply immediately ${Tags.REGRESSION}`, async ({ page }) => {
      // Get current theme
      const currentTheme = await settingsPage.getCurrentTheme();

      // Change to a different theme
      const newTheme = currentTheme.includes('Light') ? 'Dark Theme' : 'Light Theme';
      await settingsPage.changeTheme(newTheme as 'Light Theme' | 'Dark Theme');

      // Wait for theme to apply
      await page.waitForTimeout(500);

      // Verify theme changed
      const updatedTheme = await settingsPage.getCurrentTheme();
      expect(updatedTheme).toContain(newTheme.replace(' Theme', ''));

      // Restore original theme
      await settingsPage.changeTheme(currentTheme as 'Light Theme' | 'Dark Theme' | 'System Theme');
    });

    test(`should toggle notifications setting ${Tags.REGRESSION}`, async () => {
      // Get current state
      const initialState = await settingsPage.areNotificationsEnabled();

      // Toggle notifications
      await settingsPage.toggleNotifications();

      // Verify state changed
      const newState = await settingsPage.areNotificationsEnabled();
      expect(newState).toBe(!initialState);

      // Restore original state
      await settingsPage.toggleNotifications();
    });
  });
});

