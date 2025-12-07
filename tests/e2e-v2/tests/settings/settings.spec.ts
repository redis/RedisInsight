import { test, expect } from '../../fixtures/base';
import { Tags } from '../../config';

test.describe('Settings', () => {
  test.describe('Page Display', () => {
    test(`should display settings page ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();

      await expect(settingsPage.pageTitle).toBeVisible();
    });

    test(`should show all settings sections ${Tags.SMOKE}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();

      await expect(settingsPage.generalButton).toBeVisible();
      await expect(settingsPage.privacyButton).toBeVisible();
      await expect(settingsPage.workbenchButton).toBeVisible();
      await expect(settingsPage.redisCloudButton).toBeVisible();
      await expect(settingsPage.advancedButton).toBeVisible();
    });
  });

  test.describe('General Settings', () => {
    test(`should expand general settings section ${Tags.CRITICAL}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandGeneral();

      const isExpanded = await settingsPage.isGeneralExpanded();
      expect(isExpanded).toBe(true);
    });

    test(`should show theme dropdown ${Tags.CRITICAL}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandGeneral();

      await expect(settingsPage.themeDropdown).toBeVisible();
    });

    test(`should show date format options ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandGeneral();

      await expect(settingsPage.dateFormatRadioPreselected).toBeVisible();
      await expect(settingsPage.dateFormatRadioCustom).toBeVisible();
    });

    test(`should show timezone dropdown ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandGeneral();

      await expect(settingsPage.timezoneDropdown).toBeVisible();
    });
  });

  test.describe('Privacy Settings', () => {
    test(`should expand privacy settings section ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandPrivacy();

      const isExpanded = await settingsPage.isPrivacyExpanded();
      expect(isExpanded).toBe(true);
    });

    test(`should show usage data switch ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandPrivacy();

      await expect(settingsPage.usageDataSwitch).toBeVisible();
    });

    test(`should show privacy policy link ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandPrivacy();

      await expect(settingsPage.privacyPolicyLink).toBeVisible();
    });
  });

  test.describe('Workbench Settings', () => {
    test(`should expand workbench settings section ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandWorkbench();

      const isExpanded = await settingsPage.isWorkbenchExpanded();
      expect(isExpanded).toBe(true);
    });

    test(`should show editor cleanup switch ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandWorkbench();

      await expect(settingsPage.editorCleanupSwitch).toBeVisible();
    });

    test(`should show pipeline commands setting ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandWorkbench();

      await expect(settingsPage.pipelineCommandsText).toBeVisible();
    });
  });

  test.describe('Advanced Settings', () => {
    test(`should expand advanced settings section ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandAdvanced();

      const isExpanded = await settingsPage.isAdvancedExpanded();
      expect(isExpanded).toBe(true);
    });

    test(`should show advanced settings warning ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandAdvanced();

      await expect(settingsPage.advancedWarning).toBeVisible();
    });

    test(`should show keys to scan setting ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandAdvanced();

      await expect(settingsPage.keysToScanText).toBeVisible();
    });
  });

  test.describe('Redis Cloud Settings', () => {
    test(`should expand Redis Cloud settings section ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandRedisCloud();

      const isExpanded = await settingsPage.isRedisCloudExpanded();
      expect(isExpanded).toBe(true);
    });

    test(`should show API user keys section ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandRedisCloud();

      await expect(settingsPage.apiUserKeysText).toBeVisible();
    });

    test(`should show Remove all API keys button ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandRedisCloud();

      await expect(settingsPage.removeApiKeysButton).toBeVisible();
    });

    test(`should show Autodiscover button ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandRedisCloud();

      await expect(settingsPage.autodiscoverButton).toBeVisible();
    });

    test(`should show Create Redis Cloud database button ${Tags.REGRESSION}`, async ({
      settingsPage,
    }) => {
      await settingsPage.goto();
      await settingsPage.expandRedisCloud();

      await expect(settingsPage.createCloudDbButton).toBeVisible();
    });
  });
});

