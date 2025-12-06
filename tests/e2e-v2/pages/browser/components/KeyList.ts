import { Page, Locator, expect } from '@playwright/test';
import { KeyType } from '../../../types';

/**
 * Key List component (left panel in Browser)
 */
export class KeyList {
  readonly page: Page;

  // Filter controls
  readonly filterByNameButton: Locator;
  readonly searchByValuesButton: Locator;
  readonly keyTypeFilter: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  // View controls
  readonly listViewButton: Locator;
  readonly treeViewButton: Locator;
  readonly columnsButton: Locator;
  readonly refreshButton: Locator;
  readonly treeSettingsButton: Locator;

  // Results info
  readonly resultsCount: Locator;
  readonly scannedCount: Locator;
  readonly lastRefresh: Locator;

  // Key list container
  readonly keyListContainer: Locator;

  constructor(page: Page) {
    this.page = page;

    // Filter controls - use testid for specificity
    this.filterByNameButton = page.getByRole('button', { name: /filter by key name/i });
    this.searchByValuesButton = page.getByRole('button', { name: /search by values/i });
    this.keyTypeFilter = page.locator('[data-testid="key-type-filter"]');
    this.searchInput = page.getByPlaceholder('Filter by Key Name or Pattern');
    this.searchButton = page.getByTestId('search-btn');

    // View controls
    this.listViewButton = page.getByRole('button', { name: /list view/i });
    this.treeViewButton = page.getByRole('button', { name: /tree view/i });
    this.columnsButton = page.getByRole('button', { name: 'columns' });
    this.refreshButton = page.locator('[data-testid="refresh-keys-btn"]');
    this.treeSettingsButton = page.getByRole('button', { name: /tree view settings/i });

    // Results info
    this.resultsCount = page.getByText(/Results:/);
    this.scannedCount = page.getByText(/Scanned/);
    this.lastRefresh = page.getByText(/Last refresh:/);

    // Key list
    this.keyListContainer = page.locator('[data-testid="virtual-list"], [role="tree"]');
  }

  /**
   * Wait for keys to load
   */
  async waitForKeysLoaded(timeout = 30000): Promise<void> {
    await expect(this.resultsCount).toBeVisible({ timeout });
  }

  /**
   * Search for keys by pattern
   */
  async searchKeys(pattern: string): Promise<void> {
    await this.searchInput.fill(pattern);
    await this.searchButton.click();
  }

  /**
   * Clear search
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    await this.searchButton.click();
  }

  /**
   * Filter by key type
   */
  async filterByType(type: KeyType | 'All Key Types'): Promise<void> {
    await this.keyTypeFilter.click();
    await this.page.getByRole('option', { name: type }).click();
  }

  /**
   * Switch to list view
   */
  async switchToListView(): Promise<void> {
    await this.listViewButton.click();
  }

  /**
   * Switch to tree view
   */
  async switchToTreeView(): Promise<void> {
    await this.treeViewButton.click();
  }

  /**
   * Click on a key by name
   */
  async clickKey(keyName: string): Promise<void> {
    await this.page.getByRole('treeitem', { name: new RegExp(keyName) }).click();
  }

  /**
   * Check if key exists in list
   */
  async keyExists(keyName: string): Promise<boolean> {
    try {
      await expect(this.page.getByRole('treeitem', { name: new RegExp(keyName) })).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get results count text
   */
  async getResultsCountText(): Promise<string | null> {
    return this.resultsCount.textContent();
  }

  /**
   * Refresh the key list
   */
  async refresh(): Promise<void> {
    await this.refreshButton.click();
    await this.waitForKeysLoaded();
  }
}

