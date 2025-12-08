import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Analytics Page Object Model
 * Contains Slow Log and Database Analysis sub-pages
 */
export class AnalyticsPage extends BasePage {
  // Navigation tabs
  readonly analyzeTab: Locator;
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

    // Navigation tabs
    this.analyzeTab = page.getByRole('tab', { name: 'Analyze' });
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
    this.memoryChart = page.locator('img').filter({ hasText: /Memory/ }).first();
    this.keysChart = page.locator('img').filter({ hasText: /Keys/ }).first();
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
    this.likeButton = page.getByRole('button', { name: 'vote useful' }).first();
    this.dislikeButton = page.getByRole('button', { name: 'vote useful' }).last();
  }

  /**
   * Navigate to Analytics page - defaults to Slow Log
   * @param databaseId - The database ID to navigate to
   */
  async goto(databaseId?: string): Promise<void> {
    if (!databaseId) {
      throw new Error('databaseId is required - use goto(databaseId)');
    }
    await this.gotoSlowLog(databaseId);
  }

  /**
   * Navigate to Slow Log page
   */
  async gotoSlowLog(databaseId: string): Promise<void> {
    await this.page.goto(`/${databaseId}/analytics/slowlog`);
    await this.slowLogTab.waitFor({ state: 'visible' });
  }

  /**
   * Navigate to Database Analysis page
   */
  async gotoDatabaseAnalysis(databaseId: string): Promise<void> {
    await this.page.goto(`/${databaseId}/analytics/database-analysis`);
    await this.databaseAnalysisTab.waitFor({ state: 'visible' });
  }

  /**
   * Click Analyze tab from Browser/Workbench
   */
  async clickAnalyzeTab(): Promise<void> {
    await this.analyzeTab.click();
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
    // Find the refresh button in the slow log section
    const refreshBtn = this.page.locator('[data-testid*="refresh"]').first();
    await refreshBtn.click();
    // Wait for the "Last refresh: now" text to appear
    await this.page.getByText(/Last refresh:.*now/).waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Get last refresh time text
   */
  async getLastRefreshText(): Promise<string> {
    const lastRefreshElement = this.page.locator('[class*="last-refresh"]').or(
      this.page.getByText(/Last refresh:/).locator('..')
    );
    return await lastRefreshElement.textContent() || '';
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
    // Click to open the dropdown
    await this.reportHistorySelect.click();
    // Count the options
    const options = this.page.getByRole('option');
    const count = await options.count();
    // Close dropdown by pressing Escape
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
    // Wait for confirmation dialog
    await this.page.getByText('Clear slow log').waitFor({ state: 'visible' });
    // Click Clear button in dialog
    await this.page.getByTestId('reset-confirm-btn').click();
    // Wait for dialog to close
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
    // Wait for dialog to appear by checking for the save button
    await this.page.getByTestId('slowlog-config-save-btn').waitFor({ state: 'visible' });
  }

  /**
   * Set slowlog-log-slower-than threshold value
   * @param value - The threshold value
   * @param unit - The unit ('msec' or 'µs')
   */
  async setSlowLogThreshold(value: string, unit: 'msec' | 'µs' = 'msec'): Promise<void> {
    const thresholdInput = this.page.getByRole('textbox', { name: 'slowlog-log-slower-than' });
    await thresholdInput.clear();
    await thresholdInput.fill(value);

    // Select unit if different from current
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
    // Wait for dialog to close by checking the save button is hidden
    await this.page.getByTestId('slowlog-config-save-btn').waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Cancel slow log configuration
   */
  async cancelSlowLogConfig(): Promise<void> {
    await this.page.getByTestId('slowlog-config-cancel-btn').click();
    // Wait for dialog to close
    await this.page.getByTestId('slowlog-config-cancel-btn').waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Get current execution time threshold from the header
   */
  async getExecutionTimeThreshold(): Promise<string> {
    const text = await this.executionTimeText.textContent();
    // Extract the number from "Execution time: X msec, Max length: Y"
    const match = text?.match(/Execution time:\s*([\d.]+)\s*msec/);
    return match ? match[1] : '';
  }

  /**
   * Generate slow log entries by temporarily setting threshold to 0 and running commands
   * This ensures there are entries available for testing
   */
  async generateSlowLogEntries(): Promise<void> {
    // Check if we already have entries
    const isEmpty = await this.isSlowLogEmpty();
    if (!isEmpty) {
      return; // Already have entries
    }

    // Get current threshold to restore later
    const originalThreshold = await this.getExecutionTimeThreshold();

    // Set threshold to 0 to log all commands
    await this.openSlowLogConfig();
    await this.setSlowLogThreshold('0');
    await this.saveSlowLogConfig();

    // Wait a moment for config to apply
    await this.page.waitForTimeout(500);

    // Refresh to generate some slow log entries (the refresh itself creates entries)
    await this.refreshSlowLog();

    // Wait for entries to appear
    await this.slowLogTable.waitFor({ state: 'visible', timeout: 10000 });

    // Restore original threshold
    await this.openSlowLogConfig();
    await this.setSlowLogThreshold(originalThreshold || '10');
    await this.saveSlowLogConfig();
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

