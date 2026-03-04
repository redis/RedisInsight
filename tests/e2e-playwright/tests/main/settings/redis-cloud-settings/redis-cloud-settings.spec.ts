import { test, expect } from '../../../../fixtures/base';

/**
 * Redis Cloud Settings tests (TEST_PLAN.md: 7.4 Redis Cloud Settings)
 *
 * Tests for the Redis Cloud section on the Settings page.
 * Verifies API user keys text and cloud account buttons are displayed.
 *
 * Note: The Redis Cloud section is behind the `cloudSso` feature flag,
 * which is only enabled for the ELECTRON build type. Tests are skipped
 * when the section is not visible (browser mode).
 */
test.describe('Redis Cloud Settings', () => {
  test.beforeEach(async ({ settingsPage }) => {
    await settingsPage.goto();

    const isVisible = await settingsPage.redisCloudButton.isVisible();
    if (!isVisible) {
      test.skip(true, 'Redis Cloud settings not available (cloudSso feature flag disabled)');
    }

    await settingsPage.expandRedisCloud();
  });

  test('should view Redis Cloud settings', async ({ settingsPage }) => {
    await expect(settingsPage.apiUserKeysText).toBeVisible();
  });

  test('should configure cloud account', async ({ settingsPage }) => {
    await expect(settingsPage.autodiscoverButton).toBeVisible();
    await expect(settingsPage.createCloudDbButton).toBeVisible();
  });
});
