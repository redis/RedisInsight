import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance, Environment } from 'e2eSrc/types';

/**
 * End-to-end: tutorial Run buttons rendered against a Production database
 * are disabled. The button receives the disabled state from the tutorials
 * provider — this verifies the integration, not the per-button gating
 * logic (which has its own unit tests).
 */
test.describe('Workbench > Tutorials — environment gating', () => {
  test.describe('Production DB', () => {
    let database: DatabaseInstance;

    test.beforeAll(async ({ apiHelper }) => {
      database = await apiHelper.createDatabase(StandaloneConfigFactory.build({ environment: Environment.Production }));
    });

    test.afterAll(async ({ apiHelper }) => {
      await apiHelper.deleteDatabase(database.id).catch(() => {});
    });

    test('should disable the tutorial Run button', async ({ browserPage, insightsPanel }) => {
      await browserPage.goto(database.id);
      await insightsPanel.open();
      await insightsPanel.switchToTutorialsTab();
      await insightsPanel.expandTutorialFolder('tutorials');
      await insightsPanel.expandTutorialFolder('ds');
      await insightsPanel.openTutorial('ds-hashes');

      const runButton = insightsPanel.getFirstRunButton();
      await expect(runButton).toBeVisible();
      await expect(runButton).toBeDisabled();
    });
  });
});
