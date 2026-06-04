import { Page, Locator } from '@playwright/test';
import { InstancePage } from '../InstancePage';
import { Editor } from './components/Editor';
import { ResultsPanel } from './components/ResultsPanel';

/**
 * Workbench Page Object
 * Handles the Workbench tab for executing Redis commands
 *
 * Extends InstancePage to get access to:
 * - instanceHeader (database name, stats, breadcrumb)
 * - navigationTabs (Browse, Workbench, Analyze, Pub/Sub)
 * - bottomPanel (CLI, Command Helper, Profiler)
 */
export class WorkbenchPage extends InstancePage {
  // Components
  readonly editor: Editor;
  readonly resultsPanel: ResultsPanel;

  // Main elements
  readonly submitButton: Locator;
  readonly clearResultsButton: Locator;
  readonly rawModeButton: Locator;
  readonly groupResultsButton: Locator;

  // Tutorial links
  readonly introToSearchLink: Locator;
  readonly basicUseCasesLink: Locator;
  readonly introToVectorSearchLink: Locator;

  // No results state
  readonly noResultsContainer: Locator;
  readonly noResultsTitle: Locator;
  readonly exploreButton: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize components
    this.editor = new Editor(page);
    this.resultsPanel = new ResultsPanel(page);

    // Main elements
    this.submitButton = page.getByTestId('btn-submit');
    this.clearResultsButton = page.locator('button:has-text("Clear Results")');
    this.rawModeButton = page.getByTestId('btn-change-mode');
    this.groupResultsButton = page.getByTestId('btn-change-group-mode');

    // Tutorial links
    this.introToSearchLink = page.getByTestId('query-tutorials-link_sq-intro');
    this.basicUseCasesLink = page.getByTestId('query-tutorials-link_redis_use_cases_basic');
    this.introToVectorSearchLink = page.getByTestId('query-tutorials-link_vss-intro');

    // No results state
    this.noResultsContainer = page.getByTestId('wb_no-results');
    this.noResultsTitle = page.getByTestId('wb_no-results__title');
    this.exploreButton = page.getByTestId('no-results-explore-btn');
  }

  /**
   * Navigate to Workbench page for a specific database
   */
  async goto(databaseId: string): Promise<void> {
    await this.gotoDatabase(databaseId);
    await this.navigationTabs.gotoWorkbench();
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.editor.waitForEditor();
  }

  /**
   * Execute a Redis command and wait for result
   */
  async executeCommand(command: string): Promise<void> {
    const previousCount = await this.resultsPanel.getResultCount();
    await this.editor.setCommand(command);
    await this.submitButton.click();
    await this.resultsPanel.waitForNewResult(previousCount);
  }

  /**
   * Execute a command and return the result text
   */
  async executeAndGetResult(command: string): Promise<string> {
    await this.executeCommand(command);
    return this.resultsPanel.getLastResultText();
  }

  /**
   * Check if no results state is displayed
   */
  async hasNoResults(): Promise<boolean> {
    return this.noResultsContainer.isVisible();
  }

  /**
   * Clear all results
   */
  async clearResults(): Promise<void> {
    if (await this.clearResultsButton.isVisible()) {
      await this.clearResultsButton.click();
      await this.noResultsContainer.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    }
  }

  /**
   * Toggle raw mode
   */
  async toggleRawMode(): Promise<void> {
    await this.rawModeButton.click();
  }

  /**
   * Toggle group results mode
   */
  async toggleGroupResults(): Promise<void> {
    await this.groupResultsButton.click();
  }

  /**
   * Get the number of results displayed
   */
  async getResultCount(): Promise<number> {
    return this.resultsPanel.getResultCount();
  }
}
