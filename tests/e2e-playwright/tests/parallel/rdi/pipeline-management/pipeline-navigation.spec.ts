import { test, expect } from '../../../../fixtures/base';
import { RdiInstanceData } from 'e2eSrc/types';
import { RDI_V2_FEATURE_FLAGS, RdiInstanceFactory, RdiPipelineFactory } from 'e2eSrc/test-data/rdi';

/**
 * Breadcrumb navigation on the v2 RDI pipeline page (TEST_PLAN.md: 11.2 RDI Pipeline)
 *
 * RedisInsight's header renders the one breadcrumb,
 * `Data integration / <instance> ▾ / <pipeline>`, and its links go through
 * rdi-ui's unsaved-changes check for the open pipeline.
 */
test.use({ featureFlags: RDI_V2_FEATURE_FLAGS });

test.describe('RDI > Pipeline navigation', () => {
  // A new instance per test: rdi-ui keeps UI drafts per instance in localStorage
  let instance: RdiInstanceData;
  const pipeline = RdiPipelineFactory.build({ status: 'stopped' });
  const otherPipeline = RdiPipelineFactory.build();

  test.beforeEach(async ({ rdiMock, rdiPipelinePage }) => {
    instance = RdiInstanceFactory.build();
    await rdiMock.install(instance, [pipeline, otherPipeline]);
    await rdiPipelinePage.goto(instance.id);
  });

  test('should add the pipeline to the breadcrumb when opening it', async ({ rdiPipelinePage }) => {
    await rdiPipelinePage.openPipeline(pipeline.name);

    await expect(rdiPipelinePage.header.pipelineName).toHaveText(pipeline.name);
    await expect(rdiPipelinePage.header.instanceNameLink).toHaveText(instance.name);
  });

  test('should return to the pipeline list from the instance name', async ({ rdiPipelinePage }) => {
    await rdiPipelinePage.openPipeline(pipeline.name);

    await rdiPipelinePage.header.instanceNameLink.click();

    await expect(rdiPipelinePage.pipelineList.getRow(otherPipeline.name)).toBeVisible();
    await expect(rdiPipelinePage.header.pipelineName).toBeHidden();
  });

  test('should open the instance switcher from the chevron', async ({ rdiPipelinePage }) => {
    const { header, instancesSwitcher } = rdiPipelinePage;
    await rdiPipelinePage.openPipeline(pipeline.name);

    await header.switchInstanceButton.click();

    await expect(instancesSwitcher.popover).toBeVisible();
    await expect(instancesSwitcher.rdiTab).toHaveAttribute('aria-selected', 'true');
    await expect(instancesSwitcher.getInstance(instance.name)).toBeVisible();
    // The chevron opens the switcher without leaving the pipeline
    await expect(header.pipelineName).toHaveText(pipeline.name);
  });

  test('should leave to the RDI instances list from Data integration', async ({
    rdiPipelinePage,
    rdiInstancesPage,
  }) => {
    await rdiPipelinePage.openPipeline(pipeline.name);

    await rdiPipelinePage.header.dataIntegrationLink.click();

    await rdiInstancesPage.waitForLoad();
    await expect(rdiInstancesPage.getInstanceRow(instance.id)).toBeVisible();
  });

  test.describe('Unsaved changes', () => {
    test.beforeEach(async ({ rdiPipelinePage }) => {
      await rdiPipelinePage.openPipeline(pipeline.name);
      await rdiPipelinePage.pipelineView.makeUnsavedSettingsChange();
    });

    test('should stay on the pipeline when the prompt is cancelled', async ({ rdiPipelinePage }) => {
      const { header, confirmNavigationDialog, pipelineView } = rdiPipelinePage;

      await header.instanceNameLink.click();
      await expect(confirmNavigationDialog.dialog).toBeVisible();

      await confirmNavigationDialog.stayButton.click();

      await expect(confirmNavigationDialog.dialog).toBeHidden();
      await expect(header.pipelineName).toHaveText(pipeline.name);
      await expect(pipelineView.jsonDataStructureRadio).toBeChecked();
    });

    test('should return to the pipeline list when the prompt is confirmed', async ({ rdiPipelinePage }) => {
      const { header, confirmNavigationDialog, pipelineList } = rdiPipelinePage;

      await header.instanceNameLink.click();
      await confirmNavigationDialog.leaveButton.click();

      await expect(pipelineList.getRow(otherPipeline.name)).toBeVisible();
      await expect(header.pipelineName).toBeHidden();
    });

    test('should prompt before leaving to the RDI instances list', async ({ rdiPipelinePage, rdiInstancesPage }) => {
      const { header, confirmNavigationDialog } = rdiPipelinePage;

      await header.dataIntegrationLink.click();
      await expect(confirmNavigationDialog.dialog).toBeVisible();
      await expect(header.pipelineName).toHaveText(pipeline.name);

      await confirmNavigationDialog.leaveButton.click();

      await rdiInstancesPage.waitForLoad();
      await expect(rdiInstancesPage.getInstanceRow(instance.id)).toBeVisible();
    });
  });
});
