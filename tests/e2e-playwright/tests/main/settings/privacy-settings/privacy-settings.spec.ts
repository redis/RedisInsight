import { test, expect } from '../../../../fixtures/base';

/**
 * Privacy Settings tests (TEST_PLAN.md: 7.2 Privacy Settings)
 *
 * Tests for the Privacy section on the Settings page.
 * Verifies usage data switch and privacy policy link are displayed.
 */
test.describe('Privacy Settings', () => {
  test.beforeEach(async ({ settingsPage }) => {
    await settingsPage.goto();
    await settingsPage.expandPrivacy();
  });

  test('should view privacy settings', async ({ settingsPage }) => {
    await expect(settingsPage.privacyButton).toBeVisible();
    const isExpanded = await settingsPage.isPrivacyExpanded();
    expect(isExpanded).toBe(true);
  });

  test('should show usage data switch', async ({ settingsPage }) => {
    await expect(settingsPage.usageDataSwitch).toBeVisible();
  });

  test('should show privacy policy link', async ({ settingsPage }) => {
    await expect(settingsPage.privacyPolicyLink).toBeVisible();
    await expect(settingsPage.privacyPolicyLink).toHaveAttribute('target', '_blank');
  });
});
