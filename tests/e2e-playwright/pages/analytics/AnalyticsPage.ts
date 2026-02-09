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

  // Database Analysis elements
  readonly newReportButton: Locator;
  readonly reportDropdown: Locator;
  readonly noReportsMessage: Locator;
  readonly dataSummaryTab: Locator;
  readonly tipsTab: Locator;
  readonly topNamespacesTable: Locator;
  readonly topKeysTable: Locator;
  readonly memoryChart: Locator;
  readonly keysChart: Locator;
  readonly scannedKeysText: Locator;
  readonly ttlDistributionChart: Locator;
  readonly showNoExpirySwitch: Locator;
  readonly reportHistorySelect: Locator;

  // Tips/Recommendations elements
  readonly codeChangesLabel: Locator;
  readonly configChangesLabel: Locator;
  readonly upgradeLabel: Locator;
  readonly recommendationAccordions: Locator;
  readonly tutorialButton: Locator;
  readonly votingSection: Locator;
  readonly likeButton: Locator;
  readonly dislikeButton: Locator;

  constructor(page: Page) {
    super(page);

    // Sub-page tabs
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

    // Database Analysis elements
    this.newReportButton = page.getByTestId('start-database-analysis-btn');
    this.reportDropdown = page.getByRole('combobox').filter({ hasText: /\d{1,2}:\d{2}:\d{2}/ });
    this.noReportsMessage = page.getByText('No Reports found');
    this.dataSummaryTab = page.getByRole('tab', { name: 'Data Summary' });
    this.tipsTab = page.getByRole('tab', { name: /Tips/ });
    this.topNamespacesTable = page.locator('table').filter({ hasText: 'Key Pattern' });
    this.topKeysTable = page.locator('table').filter({ hasText: 'Key Name' });
    // Charts are in containers with text labels, not on img elements directly
    this.memoryChart = page.locator('[data-testid="analysis-memory"]').or(
      page.locator('div').filter({ hasText: /Memory/ }).locator('canvas, svg').first(),
    );
    this.keysChart = page.locator('[data-testid="analysis-keys"]').or(
      page.locator('div').filter({ hasText: /Keys/ }).locator('canvas, svg').first(),
    );
    this.scannedKeysText = page.getByText(/Scanned \d+%/);
    this.ttlDistributionChart = page.getByTestId('analysis-ttl');
    this.showNoExpirySwitch = page.getByTestId('show-no-expiry-switch');
    this.reportHistorySelect = page.getByTestId('select-report');

    // Tips/Recommendations elements
    this.codeChangesLabel = page.getByText('Code Changes');
    this.configChangesLabel = page.getByText('Configuration Changes');
    this.upgradeLabel = page.getByText('Upgrade');
    this.recommendationAccordions = page.locator('[data-testid$="-accordion"]');
    this.tutorialButton = page.getByRole('button', { name: 'Tutorial' });
    this.votingSection = page.getByText('Is this useful?');
    this.likeButton = page.getByTestId('like-vote-btn');
    this.dislikeButton = page.getByTestId('dislike-vote-btn');
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
   */
  async waitForReportGenerated(): Promise<void> {
    await this.scannedKeysText.waitFor({ state: 'visible', timeout: 30000 });
  }

  /**
   * Check if analysis report is visible
   */
  async isReportVisible(): Promise<boolean> {
    try {
      await this.scannedKeysText.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get tips count from tab label
   */
  async getTipsCount(): Promise<number> {
    const tabText = await this.tipsTab.textContent();
    const match = tabText?.match(/Tips \((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Refresh slow log
   */
  async refreshSlowLog(): Promise<void> {
    const refreshBtn = this.page.locator('[data-testid*="refresh"]').first();
    await refreshBtn.click();
    await this.page.getByText(/Last refresh:.*now/).waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Get last refresh time text
   */
  async getLastRefreshText(): Promise<string> {
    const lastRefreshElement = this.page.locator('[class*="last-refresh"]').or(
      this.page.getByText(/Last refresh:/).locator('..'),
    );
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
   * Check if recommendation labels are visible
   */
  async areRecommendationLabelsVisible(): Promise<{
    codeChanges: boolean;
    configChanges: boolean;
    upgrade: boolean;
  }> {
    return {
      codeChanges: await this.codeChangesLabel.isVisible(),
      configChanges: await this.configChangesLabel.isVisible(),
      upgrade: await this.upgradeLabel.isVisible(),
    };
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
   * Check if voting section is visible
   */
  async isVotingSectionVisible(): Promise<boolean> {
    const count = await this.votingSection.count();
    return count > 0;
  }
}

