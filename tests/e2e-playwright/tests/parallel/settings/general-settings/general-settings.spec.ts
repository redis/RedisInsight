import { test, expect } from '../../../../fixtures/base';

/**
 * General Settings tests (TEST_PLAN.md: 7.1 General Settings)
 *
 * Tests for the General section on the Settings page.
 * Verifies theme dropdown, notification switch, date/time format options,
 * custom date format input, and timezone dropdown are displayed and functional.
 */
test.describe('General Settings', () => {
  test.beforeEach(async ({ settingsPage }) => {
    await settingsPage.goto();
  });

  test('should view settings page', async ({ settingsPage }) => {
    await expect(settingsPage.pageTitle).toBeVisible();
  });

  test('should show theme dropdown', async ({ settingsPage }) => {
    await settingsPage.expandGeneral();
    await expect(settingsPage.themeDropdown).toBeVisible();
  });

  test('should toggle show notifications', async ({ settingsPage }) => {
    await settingsPage.expandGeneral();
    await expect(settingsPage.notificationSwitch).toBeVisible();

    const initialState = await settingsPage.areNotificationsEnabled();

    await settingsPage.toggleNotifications();
    const toggledState = await settingsPage.areNotificationsEnabled();
    expect(toggledState).toBe(!initialState);

    // Restore original state
    await settingsPage.toggleNotifications();
    const restoredState = await settingsPage.areNotificationsEnabled();
    expect(restoredState).toBe(initialState);
  });

  test('should show date/time format options', async ({ settingsPage }) => {
    await settingsPage.expandGeneral();
    await expect(settingsPage.dateFormatRadioPreselected).toBeVisible();
    await expect(settingsPage.dateFormatRadioCustom).toBeVisible();
  });

  test('should change date/time format (custom)', async ({ settingsPage }) => {
    await settingsPage.expandGeneral();
    await settingsPage.dateFormatRadioCustom.click();
    await expect(settingsPage.customDateFormatInput).toBeVisible();
  });

  test('should show time zone dropdown', async ({ settingsPage }) => {
    await settingsPage.expandGeneral();
    await expect(settingsPage.timezoneDropdown).toBeVisible();
  });
});
