import { Page, Locator } from '@playwright/test';

/**
 * Instance Header component
 * Common header shown on all database instance pages (Browser, Workbench, Analyze, Pub/Sub)
 * Contains database name, connection info, and stats (CPU, memory, keys, etc.)
 */
export class InstanceHeader {
  readonly page: Page;

  // Breadcrumb navigation
  readonly databasesButton: Locator;
  readonly databaseNameDropdown: Locator;
  readonly databaseName: Locator;
  readonly logicalDatabaseButton: Locator;
  readonly databaseInfoButton: Locator;

  // Database stats
  readonly cpuUsage: Locator;
  readonly commandsPerSec: Locator;
  readonly totalMemory: Locator;
  readonly totalKeys: Locator;
  readonly connectedClients: Locator;

  // Header actions
  readonly refreshButton: Locator;
  readonly autoRefreshButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Breadcrumb navigation
    this.databasesButton = page.getByRole('button', { name: 'Redis Databases' });
    this.databaseNameDropdown = page.locator('[data-testid="db-name-dropdown"]');
    this.databaseName = page.locator('[data-testid="db-name"], [data-testid="database-name"]');
    this.logicalDatabaseButton = page.getByRole('button', { name: /^db\d+$/i });
    this.databaseInfoButton = page.getByRole('img', { name: 'Info' });

    // Database stats - using approximate locators based on UI structure
    this.cpuUsage = page.locator('[data-testid="cpu-usage"]');
    this.commandsPerSec = page.locator('[data-testid="commands-per-sec"]');
    this.totalMemory = page.locator('[data-testid="total-memory"]');
    this.totalKeys = page.locator('[data-testid="total-keys"]');
    this.connectedClients = page.locator('[data-testid="connected-clients"]');

    // Header actions
    this.refreshButton = page.getByRole('button', { name: /refresh/i });
    this.autoRefreshButton = page.getByRole('button', { name: 'Auto-refresh config popover' });
  }

  /**
   * Navigate back to databases list
   */
  async goToDatabases(): Promise<void> {
    await this.databasesButton.click();
  }

  /**
   * Get the database name displayed in header
   */
  async getDatabaseName(): Promise<string | null> {
    try {
      return await this.databaseName.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Get the logical database index (e.g., "db0", "db1")
   */
  async getLogicalDatabaseIndex(): Promise<string | null> {
    try {
      if (await this.logicalDatabaseButton.isVisible()) {
        const text = await this.logicalDatabaseButton.textContent();
        return text?.trim() || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if logical database button is visible
   */
  async isLogicalDatabaseButtonVisible(): Promise<boolean> {
    return this.logicalDatabaseButton.isVisible();
  }

  /**
   * Open database info panel
   */
  async openDatabaseInfo(): Promise<void> {
    await this.databaseInfoButton.click();
  }
}

