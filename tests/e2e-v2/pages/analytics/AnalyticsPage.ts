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
}

