import { test, expect } from '../../../../fixtures/base';

/**
 * Privacy Settings tests (TEST_PLAN.md: 7.2 Privacy Settings)
 *
 * Tests for the Privacy section on the Settings page.
 * Verifies usage data switch, privacy policy link, and telemetry behavior.
 */
test.describe('Privacy Settings', () => {
  test('should display privacy settings', async ({ settingsPage }) => {
    await settingsPage.goto();
    await settingsPage.expandPrivacy();

    await expect(settingsPage.privacySectionHeader).toBeVisible();
    await expect(settingsPage.usageDataSwitch).toBeVisible();
    await expect(settingsPage.privacyPolicyLink).toBeVisible();
    await expect(settingsPage.privacyPolicyLink).toHaveAttribute('target', '_blank');
  });

  test('should not emit telemetry after disabling usage data', async ({ page, settingsPage, apiHelper }) => {
    // Start with analytics enabled so we can toggle it off
    await apiHelper.acceptEula({ analytics: true });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await settingsPage.goto();
    await settingsPage.expandPrivacy();

    // Intercept telemetry requests, then toggle usage data off
    const telemetryUrls = await settingsPage.interceptTelemetryRequests();
    await settingsPage.toggleUsageData();

    // Navigate away and back — the settings page sends a page-view on mount,
    // so any telemetry leak would be captured here
    await settingsPage.gotoHome();
    await settingsPage.goto();

    // No telemetry should have been emitted
    expect(telemetryUrls).toHaveLength(0);
  });

  test('should emit telemetry after enabling usage data', async ({ page, settingsPage, apiHelper }) => {
    // Start with analytics disabled so we can toggle it on
    await apiHelper.acceptEula({ analytics: false });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await settingsPage.goto();
    await settingsPage.expandPrivacy();

    // Intercept telemetry requests, then toggle usage data on
    const telemetryUrls = await settingsPage.interceptTelemetryRequests();
    await settingsPage.toggleUsageData();

    // Navigate away and back to trigger a fresh page-view event
    await settingsPage.gotoHome();
    await settingsPage.goto();

    // At least a send-page request should have gone through
    expect(telemetryUrls.length).toBeGreaterThan(0);
    expect(telemetryUrls.some((url) => url.includes('send-page'))).toBe(true);
  });
});
