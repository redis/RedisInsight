import { Page, Locator } from '@playwright/test';
import { InstancePage } from '../InstancePage';

/**
 * Analytics Page Object Model
 * Contains Slow Log and Database Analysis sub-pages
 *
 * Extends InstancePage to get access to:
 * - instanceHeader (database name, stats, breadcrumb)
 * - navigationTabs (Browse, Workbench, Analyze, Pub/Sub)
 * - bottomPanel (CLI, Command Helper, Profiler)
 */
export class AnalyticsPage extends InstancePage {
  // Sub-page tabs
  readonly databaseAnalysisTab: Locator;
  readonly slowLogTab: Locator;

  // Slow Log elements
  readonly slowLogTable: Locator;
  readonly slowLogRows: Locator;
  readonly configureButton: Locator;
  readonly clearSlowLogButton: Locator;
  readonly refreshButton: Locator;
  readonly displayUpToDropdown: Locator;
  readonly executionTimeText: Locator;
  readonly slowLogEmptyState: Locator;
  readonly slowLogEmptyStateMessage: Locator;

  // Database Analysis page and header elements
  readonly databaseAnalysisPage: Locator;
  readonly analysisHeader: Locator;
  readonly newReportButton: Locator;
  readonly analysisProgress: Locator;
  readonly noReportsMessage: Locator;
  readonly reportHistorySelect: Locator;
  readonly scannedKeysText: Locator;

  // Database Analysis sub-tabs
  readonly dataSummaryTab: Locator;
  readonly tipsTab: Locator;

  // Summary per data (donut charts)
  readonly summaryPerData: Locator;
  readonly summaryPerDataCharts: Locator;
  readonly memoryChartTitle: Locator;
  readonly keysChartTitle: Locator;
  readonly totalMemoryValue: Locator;
  readonly totalKeysValue: Locator;
  readonly extrapolateSwitch: Locator;

  // TTL / Expiration
  readonly ttlDistributionChart: Locator;
  readonly showNoExpirySwitch: Locator;

  // Top Namespaces
  readonly topNamespacesContainer: Locator;
  readonly topNamespacesEmpty: Locator;
  readonly topNamespacesMessage: Locator;
  readonly treeViewPageLink: Locator;
  readonly nspTableMemory: Locator;
  readonly nspTableKeys: Locator;

  // Top Keys
  readonly topKeysTitle: Locator;
  readonly topKeysTableMemory: Locator;
  readonly topKeysTableLength: Locator;

  // Tips/Recommendations elements
  readonly badgesLegend: Locator;
  readonly recommendationAccordions: Locator;
  readonly emptyRecommendationsMessage: Locator;
  readonly tutorialButton: Locator;
  readonly votingSection: Locator;
  readonly usefulVoteButton: Locator;
  readonly notUsefulVoteButton: Locator;

  constructor(page: Page) {
    super(page);

    // Sub-page tabs (rendered by @redis-ui/components Tabs with role="tab")
    this.databaseAnalysisTab = page.getByRole('tab', { name: 'Database Analysis' });
    this.slowLogTab = page.getByRole('tab', { name: 'Slow Log' });

    // Slow Log elements
    this.slowLogTable = page.getByTestId('slowlog-table');
    this.slowLogRows = this.slowLogTable.getByRole('row').filter({ hasNot: page.locator('[role="columnheader"]') });
    this.configureButton = page.getByRole('button', { name: 'Configure' });
    this.clearSlowLogButton = page.getByRole('button', { name: 'Clear Slow Log' });
    this.refreshButton = page.getByTestId('refresh-slowlog-btn').or(page.locator('[data-testid*="refresh"]').first());
    this.displayUpToDropdown = page.getByRole('combobox').filter({ hasText: /^\d+$/ });
    this.executionTimeText = page.getByText(/Execution time:/);
    this.slowLogEmptyState = page.getByText('No Slow Logs found');
    this.slowLogEmptyStateMessage = page.getByText(/Either no commands exceeding/);

    // Database Analysis page and header
    this.databaseAnalysisPage = page.getByTestId('database-analysis-page');
    this.analysisHeader = page.getByTestId('db-analysis-header');
    this.newReportButton = page.getByTestId('start-database-analysis-btn');
    this.analysisProgress = page.getByTestId('analysis-progress');
    this.noReportsMessage = page.getByTestId('empty-analysis-no-reports');
    this.reportHistorySelect = page.getByTestId('select-report');
    this.scannedKeysText = page.getByText(/Scanned \d+%/);

    // Database Analysis sub-tabs
    this.dataSummaryTab = page.getByRole('tab', { name: 'Data Summary' });
    this.tipsTab = page.getByRole('tab', { name: /Tips/ });

    // Summary per data (donut charts)
    this.summaryPerData = page.getByTestId('summary-per-data');
    this.summaryPerDataCharts = page.getByTestId('summary-per-data-charts');
    this.memoryChartTitle = page.getByTestId('donut-title-memory');
    this.keysChartTitle = page.getByTestId('donut-title-keys');
    this.totalMemoryValue = page.getByTestId('total-memory-value');
    this.totalKeysValue = page.getByTestId('total-keys-value');
    this.extrapolateSwitch = page.getByTestId('extrapolate-results').first();

    // TTL / Expiration
    this.ttlDistributionChart = page.getByTestId('analysis-ttl');
    this.showNoExpirySwitch = page.getByTestId('show-no-expiry-switch');

    // Top Namespaces
    this.topNamespacesContainer = page.getByTestId('top-namespaces');
    this.topNamespacesEmpty = page.getByTestId('top-namespaces-empty');
    this.topNamespacesMessage = page.getByTestId('top-namespaces-message');
    this.treeViewPageLink = page.getByTestId('tree-view-page-link');
    this.nspTableMemory = page.getByTestId('nsp-table-memory');
    this.nspTableKeys = page.getByTestId('nsp-table-keys');

    // Top Keys
    this.topKeysTitle = page.getByTestId('top-keys-title');
    this.topKeysTableMemory = page.getByTestId('top-keys-table-memory');
    this.topKeysTableLength = page.getByTestId('top-keys-table-length');

    // Tips/Recommendations elements
    this.badgesLegend = page.getByTestId('badges-legend');
    this.recommendationAccordions = page.locator('[data-testid$="-accordion"]');
    this.emptyRecommendationsMessage = page.getByTestId('empty-recommendations-message');
    this.tutorialButton = page.locator('[data-testid$="-to-tutorial-btn"]');
    this.votingSection = page.getByTestId('recommendation-voting');
    this.usefulVoteButton = page.getByTestId('useful-vote-btn');
    this.notUsefulVoteButton = page.getByTestId('not useful-vote-btn');
  }

  /**
   * Navigate to Analytics page - defaults to Slow Log
   */
  async goto(databaseId: string): Promise<void> {
    await this.gotoSlowLog(databaseId);
  }

  async waitForLoad(): Promise<void> {
    await this.slowLogTab.waitFor({ state: 'visible' });
  }

  /**
   * Navigate to Slow Log page via UI
   */
  async gotoSlowLog(databaseId: string): Promise<void> {
    await this.gotoDatabase(databaseId);
    await this.navigationTabs.gotoAnalyze();
    await this.slowLogTab.click();
    await this.slowLogTab.waitFor({ state: 'visible' });
  }

  /**
   * Navigate to Database Analysis page via UI
   */
  async gotoDatabaseAnalysis(databaseId: string): Promise<void> {
    await this.gotoDatabase(databaseId);
    await this.navigationTabs.gotoAnalyze();
    await this.databaseAnalysisTab.click();
    await this.databaseAnalysisTab.waitFor({ state: 'visible' });
  }

  /**
   * Switch to Slow Log sub-tab
   */
  async clickSlowLogTab(): Promise<void> {
    await this.slowLogTab.click();
  }

  /**
   * Switch to Database Analysis sub-tab
   */
  async clickDatabaseAnalysisTab(): Promise<void> {
    await this.databaseAnalysisTab.click();
  }

  /**
   * Get slow log entries count
   */
  async getSlowLogEntriesCount(): Promise<number> {
    await this.slowLogTable.waitFor({ state: 'visible' });
    return await this.slowLogRows.count();
  }

  /**
   * Check if slow log has entries
   */
  async hasSlowLogEntries(): Promise<boolean> {
    const count = await this.getSlowLogEntriesCount();
    return count > 0;
  }

  /**
   * Click New Report button to generate analysis
   */
  async clickNewReport(): Promise<void> {
    await this.newReportButton.click();
  }

  /**
   * Wait for analysis report to be generated
   * @param timeout - max wait time in ms (default 30s, use longer for large datasets)
   */
  async waitForReportGenerated(timeout = 30000): Promise<void> {
    await this.analysisProgress.waitFor({ state: 'visible', timeout });
  }

  /**
   * Check if analysis report is visible
   */
  async isReportVisible(): Promise<boolean> {
    try {
      await this.analysisProgress.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ensure a report has been generated (check first, generate if needed)
   * Use in beforeEach or at the start of tests that require a report
   * @param timeout - max wait time in ms (default 30s, use longer for large datasets)
   */
  async ensureReportGenerated(timeout = 30000): Promise<void> {
    const hasReport = await this.isReportVisible();
    if (!hasReport) {
      await this.clickNewReport();
      await this.waitForReportGenerated(timeout);
    }
  }

  /**
   * Get tips count from tab label
   */
  async getTipsCount(): Promise<number> {
    const tabText = await this.tipsTab.textContent();
    const match = tabText?.match(/Tips\s*\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Refresh slow log
   */
  async refreshSlowLog(): Promise<void> {
    await this.refreshButton.click();
    await this.page.getByText(/Last refresh:.*now/).waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Get last refresh time text
   */
  async getLastRefreshText(): Promise<string> {
    const lastRefreshElement = this.page
      .locator('[class*="last-refresh"]')
      .or(this.page.getByText(/Last refresh:/).locator('..'));
    return (await lastRefreshElement.textContent()) || '';
  }

  /**
   * Check if TTL distribution chart is visible
   */
  async isTtlDistributionVisible(): Promise<boolean> {
    try {
      await this.ttlDistributionChart.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if report history select is visible
   */
  async isReportHistoryVisible(): Promise<boolean> {
    try {
      await this.reportHistorySelect.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get report history options count
   */
  async getReportHistoryCount(): Promise<number> {
    await this.reportHistorySelect.click();
    const options = this.page.getByRole('option');
    const count = await options.count();
    await this.page.keyboard.press('Escape');
    return count;
  }

  /**
   * Toggle show no expiry switch
   */
  async toggleShowNoExpiry(): Promise<void> {
    await this.showNoExpirySwitch.click();
  }

  /**
   * Clear slow log entries
   */
  async clearSlowLog(): Promise<void> {
    await this.clearSlowLogButton.click();
    await this.page.getByText('Clear slow log').waitFor({ state: 'visible' });
    await this.page.getByTestId('reset-confirm-btn').click();
    await this.page.getByText('Clear slow log').waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Check if slow log empty state is visible
   */
  async isSlowLogEmpty(): Promise<boolean> {
    try {
      await this.slowLogEmptyState.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Open slow log configuration dialog
   */
  async openSlowLogConfig(): Promise<void> {
    await this.configureButton.click();
    await this.page.getByTestId('slowlog-config-save-btn').waitFor({ state: 'visible' });
  }

  /**
   * Set slowlog-log-slower-than threshold value
   */
  async setSlowLogThreshold(value: string, unit: 'msec' | 'µs' = 'msec'): Promise<void> {
    const thresholdInput = this.page.getByRole('textbox', { name: 'slowlog-log-slower-than' });
    await thresholdInput.clear();
    await thresholdInput.fill(value);

    const unitCombobox = this.page.getByRole('combobox').filter({ hasText: /msec|µs/ });
    const currentUnit = await unitCombobox.textContent();
    if (currentUnit && !currentUnit.includes(unit)) {
      await unitCombobox.click();
      await this.page.getByRole('option', { name: unit }).click();
    }
  }

  /**
   * Save slow log configuration
   */
  async saveSlowLogConfig(): Promise<void> {
    await this.page.getByTestId('slowlog-config-save-btn').click();
    await this.page.getByTestId('slowlog-config-save-btn').waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Cancel slow log configuration
   */
  async cancelSlowLogConfig(): Promise<void> {
    await this.page.getByTestId('slowlog-config-cancel-btn').click();
    await this.page.getByTestId('slowlog-config-cancel-btn').waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Get current execution time threshold from the header
   */
  async getExecutionTimeThreshold(): Promise<string> {
    const text = await this.executionTimeText.textContent();
    const match = text?.match(/Execution time:\s*([\d.]+)\s*msec/);
    return match ? match[1] : '';
  }

  // ===== Top Namespaces Methods =====

  /**
   * Switch top namespaces table to view by Memory
   */
  async switchTopNamespacesView(view: 'memory' | 'keys'): Promise<void> {
    const testId = view === 'memory' ? 'btn-change-table-memory' : 'btn-change-table-keys';
    await this.topNamespacesContainer.getByTestId(testId).click();
  }

  /**
   * Get the visible top namespaces table (memory or keys view)
   */
  async getVisibleNamespacesTable(): Promise<Locator> {
    if (await this.nspTableMemory.isVisible()) {
      return this.nspTableMemory;
    }
    return this.nspTableKeys;
  }

  // ===== Top Keys Methods =====

  /**
   * Switch top keys table to view by Memory or Length
   */
  async switchTopKeysView(view: 'memory' | 'length'): Promise<void> {
    const testId = view === 'memory' ? 'btn-change-table-memory' : 'btn-change-table-keys';
    // Scope to the top keys section to avoid conflict with namespace buttons
    await this.topKeysTitle.locator('..').getByTestId(testId).click();
  }

  /**
   * Get the visible top keys table (memory or length view)
   */
  async getVisibleTopKeysTable(): Promise<Locator> {
    if (await this.topKeysTableMemory.isVisible()) {
      return this.topKeysTableMemory;
    }
    return this.topKeysTableLength;
  }

  // ===== Tips/Recommendations Methods =====

  /**
   * Click on Tips tab
   */
  async clickTipsTab(): Promise<void> {
    await this.tipsTab.click();
    await this.tipsTab.waitFor({ state: 'visible' });
  }

  /**
   * Get count of recommendation accordions
   */
  async getRecommendationCount(): Promise<number> {
    return this.recommendationAccordions.count();
  }

  /**
   * Check if badges legend is visible (contains recommendation type labels)
   */
  async isBadgesLegendVisible(): Promise<boolean> {
    return this.badgesLegend.isVisible();
  }

  /**
   * Expand or collapse a recommendation by index
   */
  async toggleRecommendation(index: number): Promise<void> {
    const accordion = this.recommendationAccordions.nth(index);
    const button = accordion.locator('button[aria-expanded]');
    await button.click();
  }

  /**
   * Check if a recommendation is expanded
   */
  async isRecommendationExpanded(index: number): Promise<boolean> {
    const accordion = this.recommendationAccordions.nth(index);
    const button = accordion.locator('button[aria-expanded]');
    const expanded = await button.getAttribute('aria-expanded');
    return expanded === 'true';
  }

  /**
   * Check if tutorial button is visible for any recommendation
   */
  async hasTutorialButton(): Promise<boolean> {
    const count = await this.tutorialButton.count();
    return count > 0;
  }

  /**
   * Click tutorial button for first recommendation that has one
   */
  async clickTutorialButton(): Promise<void> {
    await this.tutorialButton.first().click();
  }

  /**
   * Check if voting section is visible for any recommendation
   */
  async isVotingSectionVisible(): Promise<boolean> {
    const count = await this.votingSection.count();
    return count > 0;
  }
}
