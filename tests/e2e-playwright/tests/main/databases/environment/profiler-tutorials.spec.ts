import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance, Environment } from 'e2eSrc/types';

/**
 * RI-8190 — Scenarios 6 & 7:
 *  - Profiler on a Production DB shows a confirmation popover when Start is
 *    clicked, and the "decreases throughput" advisory banner is always present.
 *  - Tutorial "Run" buttons are disabled on Production DBs with a tooltip.
 */
test.use({ featureFlags: { 'dev-prodMode': true } });

test.describe('Environment classification — Profiler & Tutorials', () => {
  let productionDb: DatabaseInstance;
  let unspecifiedDb: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    productionDb = await apiHelper.createDatabase(
      StandaloneConfigFactory.build({ environment: Environment.Production }),
    );
    unspecifiedDb = await apiHelper.createDatabase(StandaloneConfigFactory.build());
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteDatabase(productionDb.id).catch(() => {});
    await apiHelper.deleteDatabase(unspecifiedDb.id).catch(() => {});
  });

  test('Production DB: Profiler shows confirmation popover and advisory banner is always present', async ({
    browserPage,
    page,
  }) => {
    await browserPage.goto(productionDb.id);
    await browserPage.openProfiler();

    // Advisory banner is rendered regardless of environment.
    await expect(page.getByTestId('monitor-warning-message')).toBeVisible();

    // Start Profiler triggers the production confirmation popover.
    await page.getByTestId('start-monitor').click();
    await expect(page.getByTestId('profiler-start-confirm')).toBeVisible();
    await expect(page.getByTestId('profiler-start-cancel')).toBeVisible();

    // Cancel — popover closes and profiler does not start.
    await page.getByTestId('profiler-start-cancel').click();
    await expect(page.getByTestId('profiler-start-confirm')).toBeHidden();
    await expect(page.getByTestId('start-monitor')).toBeVisible();
  });

  test('Unspecified DB: Profiler advisory is still rendered, no confirmation popover', async ({
    browserPage,
    page,
  }) => {
    await browserPage.goto(unspecifiedDb.id);
    await browserPage.openProfiler();

    // Advisory banner is always present.
    await expect(page.getByTestId('monitor-warning-message')).toBeVisible();

    // Clicking Start does NOT open the confirmation popover for non-Production DBs.
    await page.getByTestId('start-monitor').click();
    await expect(page.getByTestId('profiler-start-confirm')).toHaveCount(0);
  });

  test('Production DB: Tutorial Run button is disabled', async ({
    browserPage,
    insightsPanel,
  }) => {
    await browserPage.goto(productionDb.id);
    await insightsPanel.open();
    await insightsPanel.switchToTutorialsTab();
    await insightsPanel.expandTutorialFolder('tutorials');
    await insightsPanel.expandTutorialFolder('ds');
    await insightsPanel.openTutorial('ds-hashes');

    const runButton = insightsPanel.getFirstRunButton();
    await expect(runButton).toBeVisible();
    await expect(runButton).toBeDisabled();
  });

  test('Unspecified DB: Tutorial Run button is enabled (no production gating)', async ({
    browserPage,
    insightsPanel,
  }) => {
    await browserPage.goto(unspecifiedDb.id);
    await insightsPanel.open();
    await insightsPanel.switchToTutorialsTab();
    await insightsPanel.expandTutorialFolder('tutorials');
    await insightsPanel.expandTutorialFolder('ds');
    await insightsPanel.openTutorial('ds-hashes');

    const runButton = insightsPanel.getFirstRunButton();
    await expect(runButton).toBeVisible();
    await expect(runButton).toBeEnabled();
  });
});
