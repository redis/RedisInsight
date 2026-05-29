import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance, Environment } from 'e2eSrc/types';

/**
 * End-to-end: Start Profiler against a Production database opens a
 * confirmation popover before profiling begins.
 */
test.use({ featureFlags: { 'dev-prodMode': true } });

test.describe('Workbench > Profiler (Bottom Panel) — environment gating', () => {
  test.describe('Production DB', () => {
    let database: DatabaseInstance;

    test.beforeAll(async ({ apiHelper }) => {
      database = await apiHelper.createDatabase(StandaloneConfigFactory.build({ environment: Environment.Production }));
    });

    test.afterAll(async ({ apiHelper }) => {
      await apiHelper.deleteDatabase(database.id).catch(() => {});
    });

    test('should require confirmation to start the profiler', async ({ browserPage, page }) => {
      await browserPage.goto(database.id);
      await browserPage.openProfiler();

      await page.getByTestId('start-monitor').click();
      await expect(page.getByTestId('profiler-start-confirm')).toBeVisible();
      await expect(page.getByTestId('profiler-start-cancel')).toBeVisible();

      // Cancel — popover closes and profiler does not start.
      await page.getByTestId('profiler-start-cancel').click();
      await expect(page.getByTestId('profiler-start-confirm')).toBeHidden();
      await expect(page.getByTestId('start-monitor')).toBeVisible();
    });
  });
});
