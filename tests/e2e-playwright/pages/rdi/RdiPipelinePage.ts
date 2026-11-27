import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { RdiInstancesPage } from './RdiInstancesPage';
import {
  ConfirmNavigationDialog,
  InstancesSwitcher,
  PipelineActionDialog,
  PipelineList,
  PipelineView,
  PipelineWizard,
  RdiInstanceHeader,
} from './components';

/**
 * Page Object for an RDI instance's v2 pipeline page
 * (`/integrate/:rdiInstanceId/pipeline-management-v2`), which renders
 * `RdiPipelines` from `@rdi-ui/pipeline` under RedisInsight's own header.
 *
 * The v2 page needs the `dev-rdiUi` feature flag and an RDI instance on
 * version 1.16.0 or later; see `RDI_V2_FEATURE_FLAGS` in test-data/rdi.
 */
export class RdiPipelinePage extends BasePage {
  readonly container: Locator;

  readonly header: RdiInstanceHeader;
  readonly instancesSwitcher: InstancesSwitcher;
  readonly pipelineList: PipelineList;
  readonly pipelineView: PipelineView;
  readonly wizard: PipelineWizard;
  readonly confirmNavigationDialog: ConfirmNavigationDialog;
  readonly actionDialog: PipelineActionDialog;

  private readonly rdiInstancesPage: RdiInstancesPage;

  constructor(page: Page) {
    super(page);
    this.container = page.getByTestId('pipeline-management-v2-page');

    this.header = new RdiInstanceHeader(page);
    this.instancesSwitcher = new InstancesSwitcher(page);
    this.pipelineList = new PipelineList(page);
    this.pipelineView = new PipelineView(page);
    this.wizard = new PipelineWizard(page);
    this.confirmNavigationDialog = new ConfirmNavigationDialog(page);
    this.actionDialog = new PipelineActionDialog(page);

    this.rdiInstancesPage = new RdiInstancesPage(page);
  }

  /**
   * Open an RDI instance's pipeline list from the RDI instances list
   */
  async goto(rdiInstanceId: string): Promise<void> {
    await this.rdiInstancesPage.goto();
    await this.rdiInstancesPage.openInstance(rdiInstanceId);
    await this.waitForLoad();
    await this.pipelineList.waitForLoad();
  }

  /**
   * Wait for the v2 page itself. It may show the pipeline list, an open
   * pipeline or the wizard, depending on the path.
   */
  async waitForLoad(): Promise<void> {
    await this.container.waitFor({ state: 'visible' });
  }

  /**
   * Open a pipeline from the list, on its Dashboard
   */
  async openPipeline(pipelineName: string): Promise<void> {
    await this.pipelineList.openPipeline(pipelineName);
    await this.pipelineView.waitForLoad();
  }

  /**
   * Run a pipeline action from its row menu and confirm it
   * @param action - The menu item, e.g. "Stop pipeline"
   */
  async runRowAction(pipelineName: string, action: string): Promise<void> {
    await this.pipelineList.openRowActions(pipelineName);
    await this.pipelineList.getRowAction(pipelineName, action).click();
    await this.actionDialog.getConfirmButton(action).click();
  }
}
