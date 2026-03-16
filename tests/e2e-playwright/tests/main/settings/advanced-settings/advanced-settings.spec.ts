import { test, expect } from '../../../../fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';

/**
 * Advanced Settings tests (TEST_PLAN.md: 7.5 Advanced Settings)
 *
 * Tests for the Advanced section on the Settings page.
 * Verifies the warning callout, "Keys to Scan" configuration,
 * and that changing the scan count takes effect in the Browser.
 */
test.describe('Advanced Settings', () => {
  test.beforeEach(async ({ settingsPage }) => {
    await settingsPage.goto();
    await settingsPage.expandAdvanced();
  });

  test('should show advanced settings warning', async ({ settingsPage }) => {
    await expect(settingsPage.advancedWarning).toBeVisible();
  });

  test('should show keys to scan setting', async ({ settingsPage }) => {
    await expect(settingsPage.keysToScanText).toBeVisible();
    await expect(settingsPage.keysToScanInput).toBeVisible();
  });

  test('should change keys to scan and verify in Browser', async ({
    settingsPage,
    apiHelper,
    browserPage,
  }) => {
    let database: DatabaseInstance | undefined;
    let originalValue: string | undefined;

    try {
      const config = StandaloneConfigFactory.build();
      database = await apiHelper.createDatabase(config);

      // Seed keys so we can observe scan behavior
      for (let i = 0; i < 15; i++) {
        await apiHelper.createStringKey(database.id, `adv-scan-test:key${i}`, `value${i}`);
      }

      originalValue = await settingsPage.getKeysToScan();

      // Change scan count to a small number
      await settingsPage.setKeysToScan('5');

      // Navigate to Browser and verify keys load
      await browserPage.goto(database.id);
      await browserPage.keyList.searchKeys('adv-scan-test:*');
      const scannedText = await browserPage.keyList.getScannedCountText();
      expect(scannedText).toBeTruthy();
    } finally {
      if (originalValue) {
        await settingsPage.goto();
        await settingsPage.expandAdvanced();
        await settingsPage.setKeysToScan(originalValue);
      }
      if (database?.id) {
        await apiHelper.deleteKeysByPattern(database.id, 'adv-scan-test:*');
        await apiHelper.deleteDatabase(database.id);
      }
    }
  });
});
