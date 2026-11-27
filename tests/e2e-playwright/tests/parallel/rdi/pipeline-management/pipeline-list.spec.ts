import { test, expect } from '../../../../fixtures/base';
import { RdiInstanceData } from 'e2eSrc/types';
import { RDI_V2_FEATURE_FLAGS, RdiInstanceFactory, RdiPipelineFactory } from 'e2eSrc/test-data/rdi';

/**
 * RDI pipeline list on the v2 pipeline page (TEST_PLAN.md: 11.2 RDI Pipeline)
 *
 * The page renders RdiPipelines from @rdi-ui/pipeline. There is no RDI
 * backend in the test environment, so RdiMock fakes the RDI instance and the
 * RDI API calls the page sends through RedisInsight's proxy.
 */
test.use({ featureFlags: RDI_V2_FEATURE_FLAGS });

test.describe('RDI > Pipeline list', () => {
  // A new instance per test: rdi-ui keeps UI drafts per instance in localStorage
  let instance: RdiInstanceData;
  const runningPipeline = RdiPipelineFactory.build({ status: 'started' });
  const stoppedPipeline = RdiPipelineFactory.build({ status: 'stopped' });

  test.beforeEach(async ({ rdiMock, rdiPipelinePage }) => {
    instance = RdiInstanceFactory.build();
    await rdiMock.install(instance, [runningPipeline, stoppedPipeline]);
    await rdiPipelinePage.goto(instance.id);
  });

  test('should list the pipelines of the RDI instance', async ({ rdiPipelinePage }) => {
    const { pipelineList } = rdiPipelinePage;

    await expect(pipelineList.getRow(runningPipeline.name)).toBeVisible();
    await expect(pipelineList.getRow(stoppedPipeline.name)).toBeVisible();
    await expect(pipelineList.addPipelineButton).toBeVisible();
  });

  test('should show the status, source and target of each pipeline', async ({ rdiPipelinePage }) => {
    const runningRow = rdiPipelinePage.pipelineList.getRow(runningPipeline.name);
    const stoppedRow = rdiPipelinePage.pipelineList.getRow(stoppedPipeline.name);

    await expect(runningRow).toContainText('Running');
    await expect(runningRow).toContainText(`${runningPipeline.source.name} | PostgreSQL`);
    await expect(runningRow).toContainText(`${runningPipeline.target.host}:${runningPipeline.target.port}`);
    await expect(stoppedRow).toContainText('Stopped');
  });

  test('should show only RedisInsight breadcrumb', async ({ rdiPipelinePage }) => {
    const { header } = rdiPipelinePage;

    await expect(header.breadcrumbs).toHaveCount(1);
    await expect(header.getDataIntegrationCrumbs()).toHaveCount(1);
    await expect(header.getInstanceName(instance.name)).toBeVisible();
    await expect(header.pipelineName).toBeHidden();
  });

  test('should show only RedisInsight breadcrumb with an open pipeline', async ({ rdiPipelinePage }) => {
    await rdiPipelinePage.openPipeline(runningPipeline.name);

    await expect(rdiPipelinePage.header.breadcrumbs).toHaveCount(1);
    await expect(rdiPipelinePage.header.getDataIntegrationCrumbs()).toHaveCount(1);
  });

  test('should stop a running pipeline after confirming', async ({ rdiPipelinePage, rdiMock }) => {
    const action = 'Stop pipeline';
    const { pipelineList, actionDialog } = rdiPipelinePage;

    await pipelineList.openRowActions(runningPipeline.name);
    await pipelineList.getRowAction(runningPipeline.name, action).click();
    await expect(actionDialog.getDialog(action)).toBeVisible();

    await actionDialog.getConfirmButton(action).click();

    await expect(actionDialog.getDialog(action)).toBeHidden();
    await expect(pipelineList.getRow(runningPipeline.name)).toContainText('Stopped');
    expect(rdiMock.proxyRequests('POST', `/api/v2/pipelines/${runningPipeline.name}/stop`)).toHaveLength(1);
  });

  test('should not stop a pipeline when the confirmation is cancelled', async ({ rdiPipelinePage, rdiMock }) => {
    const action = 'Stop pipeline';
    const { pipelineList, actionDialog } = rdiPipelinePage;

    await pipelineList.openRowActions(runningPipeline.name);
    await pipelineList.getRowAction(runningPipeline.name, action).click();
    await actionDialog.getCancelButton(action).click();

    await expect(actionDialog.getDialog(action)).toBeHidden();
    await expect(pipelineList.getRow(runningPipeline.name)).toContainText('Running');
    expect(rdiMock.proxyRequests('POST', `/api/v2/pipelines/${runningPipeline.name}/stop`)).toHaveLength(0);
  });

  test('should start a stopped pipeline', async ({ rdiPipelinePage, rdiMock }) => {
    await rdiPipelinePage.runRowAction(stoppedPipeline.name, 'Start pipeline');

    await expect(rdiPipelinePage.pipelineList.getRow(stoppedPipeline.name)).toContainText('Running');
    expect(rdiMock.proxyRequests('POST', `/api/v2/pipelines/${stoppedPipeline.name}/start`)).toHaveLength(1);
  });

  test('should reset a pipeline', async ({ rdiPipelinePage, rdiMock }) => {
    await rdiPipelinePage.runRowAction(runningPipeline.name, 'Reset pipeline');

    await expect
      .poll(() => rdiMock.proxyRequests('POST', `/api/v2/pipelines/${runningPipeline.name}/reset`))
      .toHaveLength(1);
  });
});
