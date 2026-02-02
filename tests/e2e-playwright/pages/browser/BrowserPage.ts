import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';
import { AddKeyDialog, BulkActionsPanel, KeyDetails, KeyList } from './components';

/**
 * Browser Page Object
 * Main page for browsing Redis keys
 */
export class BrowserPage extends BasePage {
  // Components
  readonly addKeyDialog: AddKeyDialog;
  readonly bulkActionsPanel: BulkActionsPanel;
  readonly keyDetails: KeyDetails;
  readonly keyList: KeyList;

  // Navigation tabs
  readonly browseTab: Locator;
  readonly workbenchTab: Locator;
  readonly analyzeTab: Locator;
  readonly pubSubTab: Locator;

  // Action buttons
  readonly addKeyButton: Locator;
  readonly bulkActionsButton: Locator;

  // Database info
  readonly databaseName: Locator;
  readonly databaseSelector: Locator;
  readonly logicalDatabaseButton: Locator;
  readonly cpuUsage: Locator;
  readonly commandsPerSec: Locator;
  readonly totalMemory: Locator;
  readonly totalKeys: Locator;

  // Bottom panel
  readonly cliButton: Locator;
  readonly commandHelperButton: Locator;
  readonly profilerButton: Locator;

  // Key details panel
  readonly keyDetailsPanel: Locator;
  readonly noKeySelectedMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize components
    this.addKeyDialog = new AddKeyDialog(page);
    this.bulkActionsPanel = new BulkActionsPanel(page);
    this.keyDetails = new KeyDetails(page);
    this.keyList = new KeyList(page);

    // Navigation tabs
    this.browseTab = page.getByRole('tab', { name: 'Browse' });
    this.workbenchTab = page.getByRole('tab', { name: 'Workbench' });
    this.analyzeTab = page.getByRole('tab', { name: 'Analyze' });
    this.pubSubTab = page.getByRole('tab', { name: 'Pub/Sub' });

    // Action buttons
    this.addKeyButton = page.getByText('Add key');
    this.bulkActionsButton = page.getByRole('button', { name: /bulk actions/i });

    // Database info
    this.databaseName = page.locator('[data-testid="db-name"], [data-testid="database-name"]');
    this.databaseSelector = page.getByRole('button', { name: /db0/i });
    this.logicalDatabaseButton = page.getByRole('button', { name: /^db\d+$/i });
    this.cpuUsage = page.locator('[data-testid="cpu-usage"]');
    this.commandsPerSec = page.locator('[data-testid="commands-per-sec"]');
    this.totalMemory = page.locator('[data-testid="total-memory"]');
    this.totalKeys = page.locator('[data-testid="total-keys"]');

    // Bottom panel buttons
    this.cliButton = page.getByText('CLI').locator('..');
    this.commandHelperButton = page.getByText('Command Helper').locator('..');
    this.profilerButton = page.getByText('Profiler').locator('..');

    // Key details
    this.keyDetailsPanel = page.locator('[data-testid="key-details"]');
    this.noKeySelectedMessage = page.getByText(/Select the key from the list/);
  }

  /**
   * Navigate to Browser page for a specific database
   * @param databaseId - The ID of the database to navigate to
   */
  async goto(databaseId: string): Promise<void> {
    await this.gotoDatabase(databaseId);
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.keyList.waitForKeysLoaded();
  }

  async openAddKeyDialog(): Promise<void> {
    await this.addKeyButton.click();
    await expect(this.addKeyDialog.title).toBeVisible();
  }

  async closeAddKeyDialog(): Promise<void> {
    if (await this.addKeyDialog.isVisible()) {
      await this.addKeyDialog.clickCancel();
    }
  }

  async navigateToWorkbench(): Promise<void> {
    await this.workbenchTab.click();
    await this.page.waitForURL(/workbench/);
  }

  async navigateToAnalyze(): Promise<void> {
    await this.analyzeTab.click();
  }

  async navigateToPubSub(): Promise<void> {
    await this.pubSubTab.click();
    await this.page.waitForURL(/pub-sub/);
  }

  async openCli(): Promise<void> {
    await this.cliButton.click();
  }

  async expectKeyInList(keyName: string): Promise<void> {
    const exists = await this.keyList.keyExists(keyName);
    expect(exists).toBe(true);
  }

  async expectKeyNotInList(keyName: string): Promise<void> {
    const exists = await this.keyList.keyExists(keyName);
    expect(exists).toBe(false);
  }

  /**
   * Get the logical database index displayed in the header
   * @returns The logical database index (e.g., "db0", "db1") or null if not visible
   */
  async getLogicalDatabaseIndex(): Promise<string | null> {
    try {
      const button = this.logicalDatabaseButton;
      if (await button.isVisible()) {
        const text = await button.textContent();
        return text?.trim() || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if the logical database button is visible in the header
   */
  async isLogicalDatabaseButtonVisible(): Promise<boolean> {
    return this.logicalDatabaseButton.isVisible();
  }
}

