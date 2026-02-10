import { Page, Locator, expect } from '@playwright/test';
import { InstancePage } from '../InstancePage';
import { AddKeyDialog, BulkActionsPanel, KeyDetails, KeyList } from './components';

/**
 * Browser Page Object
 * Main page for browsing Redis keys
 *
 * Extends InstancePage which provides:
 * - instanceHeader: Database name, stats, breadcrumb
 * - navigationTabs: Browse, Workbench, Analyze, Pub/Sub tabs
 * - bottomPanel: CLI, Command Helper, Profiler buttons
 */
export class BrowserPage extends InstancePage {
  // Browser-specific components
  readonly addKeyDialog: AddKeyDialog;
  readonly bulkActionsPanel: BulkActionsPanel;
  readonly keyDetails: KeyDetails;
  readonly keyList: KeyList;

  // Browser-specific action buttons
  readonly addKeyButton: Locator;
  readonly bulkActionsButton: Locator;

  // Browser-specific key details panel
  readonly keyDetailsPanel: Locator;
  readonly noKeySelectedMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize browser-specific components
    this.addKeyDialog = new AddKeyDialog(page);
    this.bulkActionsPanel = new BulkActionsPanel(page);
    this.keyDetails = new KeyDetails(page);
    this.keyList = new KeyList(page);

    // Browser-specific action buttons
    this.addKeyButton = page.getByText('Add key', { exact: true });
    this.bulkActionsButton = page.getByRole('button', { name: /bulk actions/i });

    // Browser-specific key details panel
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

  async expectKeyInList(keyName: string): Promise<void> {
    const exists = await this.keyList.keyExists(keyName);
    expect(exists).toBe(true);
  }

  async expectKeyNotInList(keyName: string): Promise<void> {
    const exists = await this.keyList.keyExists(keyName);
    expect(exists).toBe(false);
  }
}
