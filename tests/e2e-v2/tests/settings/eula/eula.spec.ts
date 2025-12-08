import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';

/**
 * EULA & Privacy Settings Tests
 *
 * IMPORTANT: These tests require agreements to be reset before each test.
 * They should run in isolation from other tests to avoid flakiness.
 *
 * The EULA popup blocks all UI interactions until accepted.
 */
test.describe('Settings > EULA & Privacy', () => {
  test.describe.serial('EULA Popup', () => {
    test.beforeEach(async ({ apiHelper }) => {
      // Reset agreements to trigger EULA popup
      await apiHelper.resetAgreements();
    });

    test.afterEach(async ({ apiHelper }) => {
      // Ensure EULA is accepted after each test so other tests aren't blocked
      await apiHelper.acceptEula();
    });

    test(`should show EULA popup on first launch ${Tags.CRITICAL} ${Tags.SMOKE}`, async ({ eulaPage }) => {
      await eulaPage.goto();
      await eulaPage.waitForPopup();

      // Verify dialog is visible
      await expect(eulaPage.dialog).toBeVisible();
      await expect(eulaPage.dialogTitle).toBeVisible();
    });

    test(`should have submit button disabled until EULA checkbox is checked ${Tags.SMOKE}`, async ({ eulaPage }) => {
      await eulaPage.goto();
      await eulaPage.waitForPopup();

      // Initially submit should be disabled
      await expect(eulaPage.submitButton).toBeDisabled();

      // Check EULA
      await eulaPage.eulaSwitch.click();

      // Now submit should be enabled
      await expect(eulaPage.submitButton).toBeEnabled();
    });

    test(`should enable recommended settings toggle ${Tags.REGRESSION}`, async ({ eulaPage }) => {
      await eulaPage.goto();
      await eulaPage.waitForPopup();

      // Enable recommended settings
      await eulaPage.useRecommendedSettingsSwitch.click();

      // Verify analytics is enabled (part of recommended)
      // The switch is a button with role="switch" and aria-checked attribute
      await expect(eulaPage.usageDataSwitch).toHaveAttribute('aria-checked', 'true');
    });

    test(`should have encryption enabled by default ${Tags.REGRESSION}`, async ({ eulaPage }) => {
      await eulaPage.goto();
      await eulaPage.waitForPopup();

      // Encryption should be on by default
      await expect(eulaPage.encryptionSwitch).toHaveAttribute('aria-checked', 'true');
    });

    test(`should close popup after accepting EULA ${Tags.SMOKE}`, async ({ eulaPage, page }) => {
      await eulaPage.goto();
      await eulaPage.waitForPopup();

      // Accept EULA
      await eulaPage.acceptEula();

      // Dialog should be closed
      await expect(eulaPage.dialog).not.toBeVisible();

      // Should see main content (database list table)
      await expect(page.locator('table')).toBeVisible();
    });

    test(`should have working Privacy Policy link ${Tags.REGRESSION}`, async ({ eulaPage }) => {
      await eulaPage.goto();
      await eulaPage.waitForPopup();

      // Get link href
      const href = await eulaPage.privacyPolicyLink.getAttribute('href');
      expect(href).toContain('redis.io/legal/privacy-policy');
    });

    test(`should have working license agreement links ${Tags.REGRESSION}`, async ({ eulaPage }) => {
      await eulaPage.goto();
      await eulaPage.waitForPopup();

      // Check subscription agreement link
      const subscriptionHref = await eulaPage.subscriptionAgreementLink.getAttribute('href');
      expect(subscriptionHref).toContain('redis.io/software-subscription-agreement');

      // Check server side license link
      const licenseHref = await eulaPage.serverSideLicenseLink.getAttribute('href');
      expect(licenseHref).toContain('github.com/RedisInsight/RedisInsight/blob/main/LICENSE');
    });

    test(`should accept EULA with custom settings ${Tags.REGRESSION}`, async ({ eulaPage, apiHelper }) => {
      await eulaPage.goto();
      await eulaPage.waitForPopup();

      // Accept with analytics enabled
      await eulaPage.acceptWithCustomSettings({ analytics: true });

      // Verify settings were saved
      const settings = await apiHelper.getSettings();
      expect(settings.agreements?.eula).toBe(true);
      expect(settings.agreements?.analytics).toBe(true);
    });
  });
});

