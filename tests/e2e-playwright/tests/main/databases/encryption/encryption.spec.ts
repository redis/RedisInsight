import { test, expect } from 'e2eSrc/fixtures/base';

/**
 * Certificate and Encryption Handling Tests (TEST_PLAN.md: 1.7 Certificate and Encryption Handling)
 *
 * Tests for credential encryption settings managed through the EULA popup.
 * These tests reset the EULA agreements to trigger the consent dialog,
 * so they re-accept EULA after each test to restore normal state.
 */
test.describe('Certificate and Encryption Handling', () => {
  test.describe.configure({ mode: 'serial' });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.ensureEulaAccepted();
  });

  test('should store credentials encrypted when encryption enabled', async ({ apiHelper, eulaPage }) => {
    // Reset agreements to trigger EULA popup
    await apiHelper.resetAgreements();

    await eulaPage.goto();
    await eulaPage.waitForPopup();

    // Encryption is enabled by default in the EULA dialog
    const isEncryptionChecked = await eulaPage.isSwitchChecked(eulaPage.encryptionSwitch);
    expect(isEncryptionChecked).toBe(true);

    // Accept with encryption enabled (default)
    await eulaPage.acceptEula();

    // Verify via API that encryption is enabled
    const settings = await apiHelper.getSettings();
    expect(settings.agreements?.encryption).toBe(true);
  });

  test('should display warning when encryption disabled and credentials stored as plaintext', async ({
    apiHelper,
    eulaPage,
  }) => {
    // Reset agreements to trigger EULA popup again
    await apiHelper.resetAgreements();

    await eulaPage.goto();
    await eulaPage.waitForPopup();

    // Disable encryption
    await eulaPage.acceptWithCustomSettings({ encryption: false });

    // Verify via API that encryption is disabled
    const settings = await apiHelper.getSettings();
    expect(settings.agreements?.encryption).toBe(false);

    // Re-enable encryption for clean state
    await apiHelper.resetAgreements();
    await eulaPage.goto();
    await eulaPage.waitForPopup();
    await eulaPage.acceptEula();
  });
});
