import { Page, Locator, expect } from '@playwright/test';
import { InstancePage } from '../InstancePage';
import {
  RqeNotAvailable,
  WelcomeScreen,
  IndexList,
  CreateIndexForm,
  CreateIndexOnboarding,
  QueryEditor,
  QueryLibrary,
  QueryResults,
  IndexInfoPanel,
  DeleteIndexModal,
  DeleteQueryModal,
  SaveQueryModal,
  PickSampleDataModal,
} from './components';

/**
 * Vector Search Page Object
 * Main page for Vector Search feature, composes all sub-components.
 *
 * Extends InstancePage which provides:
 * - instanceHeader: Database name, stats, breadcrumb
 * - navigationTabs: Browse, Search, Workbench, Analyze, Pub/Sub tabs
 * - bottomPanel: CLI, Command Helper, Profiler buttons
 */
export class VectorSearchPage extends InstancePage {
  readonly rqeNotAvailableWrapper: Locator;
  readonly loadingWrapper: Locator;
  readonly welcomeWrapper: Locator;
  readonly listWrapper: Locator;
  readonly queryPageWrapper: Locator;
  readonly createIndexWrapper: Locator;
  readonly indexCreatedToast: Locator;
  readonly indexDeletedToast: Locator;
  readonly sampleDataToast: Locator;

  readonly rqeNotAvailable: RqeNotAvailable;
  readonly welcomeScreen: WelcomeScreen;
  readonly indexList: IndexList;
  readonly createIndexForm: CreateIndexForm;
  readonly createIndexOnboarding: CreateIndexOnboarding;
  readonly queryEditor: QueryEditor;
  readonly queryLibrary: QueryLibrary;
  readonly queryResults: QueryResults;
  readonly indexInfoPanel: IndexInfoPanel;
  readonly deleteIndexModal: DeleteIndexModal;
  readonly deleteQueryModal: DeleteQueryModal;
  readonly saveQueryModal: SaveQueryModal;
  readonly pickSampleDataModal: PickSampleDataModal;

  constructor(page: Page) {
    super(page);

    this.rqeNotAvailableWrapper = page.getByTestId('vector-search-page--rqe-not-available');
    this.loadingWrapper = page.getByTestId('vector-search-page--loading');
    this.welcomeWrapper = page.getByTestId('vector-search-page--welcome');
    this.listWrapper = page.getByTestId('vector-search-page--list');
    this.queryPageWrapper = page.getByTestId('vector-search-query-page');
    this.createIndexWrapper = page.getByTestId('vector-search--create-index--page');
    this.indexCreatedToast = page.getByRole('alert').getByText('Index created successfully.');
    this.indexDeletedToast = page.getByRole('alert').getByText('Index has been deleted');
    this.sampleDataToast = page.getByRole('alert').getByText('Your sample data is now searchable.');

    this.rqeNotAvailable = new RqeNotAvailable(page);
    this.welcomeScreen = new WelcomeScreen(page);
    this.indexList = new IndexList(page);
    this.createIndexForm = new CreateIndexForm(page);
    this.createIndexOnboarding = new CreateIndexOnboarding(page);
    this.queryEditor = new QueryEditor(page);
    this.queryLibrary = new QueryLibrary(page);
    this.queryResults = new QueryResults(page);
    this.indexInfoPanel = new IndexInfoPanel(page);
    this.deleteIndexModal = new DeleteIndexModal(page);
    this.deleteQueryModal = new DeleteQueryModal(page);
    this.saveQueryModal = new SaveQueryModal(page);
    this.pickSampleDataModal = new PickSampleDataModal(page);
  }

  async goto(databaseId: string): Promise<void> {
    await this.gotoDatabase(databaseId);
    await this.navigationTabs.gotoSearch();
    await this.waitForLoad();
  }

  async openSampleDataModal(): Promise<void> {
    await expect(this.listWrapper).toBeVisible();
    await this.indexList.openCreateIndex('sample-data');
    await expect(this.pickSampleDataModal.heading).toBeVisible();
  }

  async navigateToCreateIndex(): Promise<void> {
    await expect(this.listWrapper).toBeVisible();
    await this.indexList.openCreateIndex('existing-data');
    await expect(this.createIndexForm.container).toBeVisible();
  }

  async selectQueryLibraryTab(): Promise<void> {
    await this.queryEditor.libraryTab.click();
    await this.queryLibrary.container.waitFor({ state: 'visible' });
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('load');
    await this.loadingWrapper.waitFor({ state: 'hidden' }).catch(() => {});
  }
}
