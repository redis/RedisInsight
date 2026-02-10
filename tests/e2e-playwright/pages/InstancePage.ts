import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { InstanceHeader, NavigationTabs, BottomPanel } from './components';

/**
 * Base class for all database instance pages (Browser, Workbench, Analyze, Pub/Sub)
 *
 * Provides common components:
 * - Instance header (database name, stats, breadcrumb)
 * - Navigation tabs (Browse, Workbench, Analyze, Pub/Sub)
 * - Bottom panel (CLI, Command Helper, Profiler)
 *
 * Specific pages (BrowserPage, WorkbenchPage, etc.) should extend this class.
 */
export abstract class InstancePage extends BasePage {
  // Common components for all instance pages
  readonly instanceHeader: InstanceHeader;
  readonly navigationTabs: NavigationTabs;
  readonly bottomPanel: BottomPanel;

  constructor(page: Page) {
    super(page);

    // Initialize common components
    this.instanceHeader = new InstanceHeader(page);
    this.navigationTabs = new NavigationTabs(page);
    this.bottomPanel = new BottomPanel(page);
  }

  /**
   * Navigate to a database and this specific page
   * @param databaseId - The ID of the database to navigate to
   */
  abstract goto(databaseId: string): Promise<void>;

  /**
   * Navigate to Browser tab (staying on same database)
   */
  async navigateToBrowser(): Promise<void> {
    await this.navigationTabs.gotoBrowser();
    await this.waitForLoad();
  }

  /**
   * Navigate to Workbench tab (staying on same database)
   */
  async navigateToWorkbench(): Promise<void> {
    await this.navigationTabs.gotoWorkbench();
    await this.waitForLoad();
  }

  /**
   * Navigate to Analyze tab (staying on same database)
   */
  async navigateToAnalyze(): Promise<void> {
    await this.navigationTabs.gotoAnalyze();
    await this.waitForLoad();
  }

  /**
   * Navigate to Pub/Sub tab (staying on same database)
   */
  async navigateToPubSub(): Promise<void> {
    await this.navigationTabs.gotoPubSub();
    await this.waitForLoad();
  }

  /**
   * Open CLI panel
   */
  async openCli(): Promise<void> {
    await this.bottomPanel.openCli();
  }

  /**
   * Open Command Helper panel
   */
  async openCommandHelper(): Promise<void> {
    await this.bottomPanel.openCommandHelper();
  }

  /**
   * Open Profiler panel
   */
  async openProfiler(): Promise<void> {
    await this.bottomPanel.openProfiler();
  }

  /**
   * Get the database name from header
   */
  async getDatabaseName(): Promise<string | null> {
    return this.instanceHeader.getDatabaseName();
  }

  /**
   * Get the logical database index (e.g., "db0", "db1")
   */
  async getLogicalDatabaseIndex(): Promise<string | null> {
    return this.instanceHeader.getLogicalDatabaseIndex();
  }

  /**
   * Check if logical database button is visible
   */
  async isLogicalDatabaseButtonVisible(): Promise<boolean> {
    return this.instanceHeader.isLogicalDatabaseButtonVisible();
  }

  /**
   * Navigate back to databases list
   */
  async goToDatabases(): Promise<void> {
    await this.instanceHeader.goToDatabases();
  }
}
