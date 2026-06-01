import { test } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance, Environment } from 'e2eSrc/types';

/**
 * End-to-end: starting the Profiler on a Production database requires a
 * confirmation popover. Cancelling keeps the profiler stopped; confirming
 * actually starts the profiler against the real Redis backend.
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

    test('should require confirmation to start the profiler', async ({ browserPage, profilerPanel }) => {
      await browserPage.goto(database.id);
      await browserPage.openProfiler();

      // Cancel first attempt — the profiler does not start.
      await profilerPanel.clickStart();
      await profilerPanel.cancelProductionStart();
      await profilerPanel.expectNotRunning();

      // Confirm second attempt — the profiler actually starts.
      await profilerPanel.clickStart();
      await profilerPanel.confirmProductionStart();
      await profilerPanel.expectRunning();
    });
  });
});
