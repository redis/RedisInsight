import { Page, Locator, expect } from '@playwright/test';
import { InstancePage } from '../InstancePage';
import { AddKeyDialog, BulkActionsPanel, KeyDetails, KeyList, MakeSearchableModal } from './components';

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
  readonly makeSearchableModal: MakeSearchableModal;

  // Browser-specific action buttons
  readonly addKeyButton: Locator;
  readonly bulkActionsButton: Locator;

  // Key details panel
  readonly keyDetailsPanel: Locator;
  readonly noKeySelectedMessage: Locator;

  // View index / Make searchable (key details header)
  readonly viewIndexButton: Locator;
  readonly viewIndexMenuTrigger: Locator;
  readonly viewIndexCountBadge: Locator;
  readonly makeSearchableButton: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize browser-specific components
    this.addKeyDialog = new AddKeyDialog(page);
    this.bulkActionsPanel = new BulkActionsPanel(page);
    this.keyDetails = new KeyDetails(page);
    this.keyList = new KeyList(page);
    this.makeSearchableModal = new MakeSearchableModal(page);

    // Browser-specific action buttons
    this.addKeyButton = page.getByText('Add key', { exact: true });
    this.bulkActionsButton = page.getByRole('button', { name: /bulk actions/i });

    // Key details panel
    this.keyDetailsPanel = page.getByTestId('key-details-header');
    this.noKeySelectedMessage = page.getByText(/Select the key from the list/);

    // View index / Make searchable
    this.viewIndexButton = page.getByRole('button', { name: 'View index', exact: true });
    this.viewIndexMenuTrigger = page.getByTestId('view-index-data-menu-trigger');
    this.viewIndexCountBadge = page.getByTestId('view-index-data-count-badge');
    this.makeSearchableButton = page.getByRole('button', { name: 'Make searchable' });
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

  /**
   * Get a "View index" menu item by index name (inside the dropdown)
   */
  getViewIndexMenuItem(indexName: string): Locator {
    return this.page.getByRole('menuitem', { name: indexName, exact: true });
  }

  /**
   * Get the "Index" button that appears on a folder node when hovered
   */
  getIndexFolderButton(folderName: string): Locator {
    return this.page.getByTestId(`index-folder-btn-${folderName}`);
  }
}
