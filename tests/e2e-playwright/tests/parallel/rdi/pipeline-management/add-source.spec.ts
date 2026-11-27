import { test, expect } from '../../../../fixtures/base';
import { RdiInstanceData } from 'e2eSrc/types';
import { RDI_V2_FEATURE_FLAGS, RdiInstanceFactory, RdiPipelineFactory } from 'e2eSrc/test-data/rdi';

/**
 * Adding a source to a deployed pipeline on the v2 RDI pipeline page
 * (TEST_PLAN.md: 11.2 RDI Pipeline)
 *
 * rdi-ui reads the wizard's mode from the query string: `?addSource=true`
 * opens a deployed pipeline's create wizard in add-source mode. Without it,
 * the wizard path of a deployed pipeline redirects to its Dashboard, so the
 * host must keep the query string when it hands rdi-ui the current path.
 */
test.use({ featureFlags: RDI_V2_FEATURE_FLAGS });

test.describe('RDI > Pipeline > Add source', () => {
  // A new instance per test: rdi-ui keeps UI drafts per instance in localStorage
  let instance: RdiInstanceData;
  const pipeline = RdiPipelineFactory.build();

  test.beforeEach(async ({ rdiMock, rdiPipelinePage }) => {
    instance = RdiInstanceFactory.build();
    await rdiMock.install(instance, [pipeline]);
    await rdiPipelinePage.goto(instance.id);
    await rdiPipelinePage.openPipeline(pipeline.name);
  });

  test('should open the wizard in add-source mode from the Dashboard', async ({ rdiPipelinePage }) => {
    const { pipelineView, wizard } = rdiPipelinePage;

    await pipelineView.addSourceButton.click();

    await expect(rdiPipelinePage.page).toHaveURL(/[?&]addSource=true/);
    await expect(wizard.addSourcesStep).toHaveAttribute('aria-selected', 'true');
    await expect(wizard.getSource(pipeline.source.name)).toBeVisible();
    await expect(wizard.getSourceType('PostgreSQL')).toBeDisabled();
  });

  test('should keep add-source mode when the page is reloaded', async ({ rdiPipelinePage }) => {
    const { pipelineView, wizard } = rdiPipelinePage;
    await pipelineView.addSourceButton.click();
    await expect(wizard.addSourcesStep).toBeVisible();

    await rdiPipelinePage.reload();

    await expect(rdiPipelinePage.page).toHaveURL(/[?&]addSource=true/);
    await expect(wizard.addSourcesStep).toHaveAttribute('aria-selected', 'true');
    await expect(wizard.getSource(pipeline.source.name)).toBeVisible();
    await expect(pipelineView.dashboardTab).toBeHidden();
  });

  test('should add a new source next to the existing one', async ({ rdiPipelinePage }) => {
    const { pipelineView, wizard } = rdiPipelinePage;
    await pipelineView.addSourceButton.click();
    await expect(wizard.sourcesCount).toHaveText('Sources · 1');

    await wizard.addSourceButton.click();

    await expect(wizard.sourcesCount).toHaveText('Sources · 2');
    await expect(wizard.getSource('Untitled source')).toBeVisible();
    await expect(wizard.getSourceType('MySQL')).toBeEnabled();
  });

  test('should keep the pipeline in the breadcrumb in the wizard', async ({ rdiPipelinePage }) => {
    await rdiPipelinePage.pipelineView.addSourceButton.click();
    await expect(rdiPipelinePage.wizard.addSourcesStep).toBeVisible();

    await expect(rdiPipelinePage.header.pipelineName).toHaveText(pipeline.name);
    await expect(rdiPipelinePage.header.getDataIntegrationCrumbs()).toHaveCount(1);
  });
});
