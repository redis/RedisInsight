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
  readonly totalCount: Locator;
  readonly scannedCount: Locator;
  readonly lastRefresh: Locator;

  // Key list container
  readonly keyListContainer: Locator;
  readonly container: Locator;
  readonly noKeysMessage: Locator;

  // Key type filter dropdown
  readonly keyTypeFilterDropdown: Locator;

  constructor(page: Page) {
    this.page = page;

    // Filter controls - use testid for specificity
    this.filterByNameButton = page.getByRole('button', { name: /filter by key name/i });
    this.searchByValuesButton = page.getByRole('button', { name: /search by values/i });
    this.keyTypeFilter = page.getByTestId('select-filter-key-type');
    this.keyTypeFilterDropdown = page.locator('[role="listbox"]');
    this.searchInput = page.getByPlaceholder('Filter by Key Name or Pattern');
    this.searchButton = page.getByTestId('search-btn');

    // View controls
    this.listViewButton = page.getByTestId('view-type-browser-btn');
    this.treeViewButton = page.getByTestId('view-type-list-btn');
    this.columnsButton = page.getByRole('button', { name: 'columns' });
    this.refreshButton = page.getByRole('button', { name: /refresh/i }).first();
    this.treeSettingsButton = page.getByTestId('tree-view-settings-btn');

    // Results info
    this.resultsCount = page.getByText(/Results:/);
    this.totalCount = page.getByText(/Total:/);
    this.scannedCount = page.getByText(/Scanned/);
    this.lastRefresh = page.getByText(/Last refresh:/);

    // Key list container
    this.keyListContainer = page.locator('[data-testid="virtual-list"], [role="tree"], [role="grid"]');
    this.container = page.locator('[data-testid="virtual-list"], [role="tree"], [role="grid"]');
    this.noKeysMessage = page.getByText(/no keys/i);
  }

  /**
   * Wait for keys to load
   * Handles both List view (Total:) and Tree view (Results:)
   */
  async waitForKeysLoaded(timeout = 30000): Promise<void> {
    // Wait for either "Total:" (List view) or "Results:" (Tree view)
    await expect(
      this.page.getByText(/Total:|Results:/).first(),
    ).toBeVisible({ timeout });
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
    // Wait for dropdown to appear
    await this.keyTypeFilterDropdown.waitFor({ state: 'visible' });
    // Use exact match for type to avoid "Set" matching "Sorted Set"
    await this.page.getByRole('option', { name: type, exact: true }).click();
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
    // Try grid row first (list view), then treeitem (tree view)
    const gridRow = this.page.getByRole('row', { name: new RegExp(keyName) });
    const treeItem = this.page.getByRole('treeitem', { name: new RegExp(keyName) });

    if (await gridRow.isVisible()) {
      await gridRow.click();
    } else {
      await treeItem.click();
    }
  }

  /**
   * Check if key exists in list
   * Handles both List view (grid) and Tree view (treeitem)
   */
  async keyExists(keyName: string, timeout = 5000): Promise<boolean> {
    try {
      // Escape special regex characters in key name
      const escapedKeyName = keyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Try grid cell first (list view) - look for exact key name in gridcell
      const gridCell = this.page.getByRole('gridcell', { name: keyName });

      // Try treeitem (tree view) - key name appears in the treeitem accessible name
      const treeItem = this.page.getByRole('treeitem', { name: new RegExp(escapedKeyName) });

      // Wait briefly for either to appear using waitFor
      try {
        await gridCell.waitFor({ state: 'visible', timeout });
        return true;
      } catch {
        // Grid cell not found, try treeitem
      }

      try {
        await treeItem.waitFor({ state: 'visible', timeout });
        return true;
      } catch {
        // Treeitem not found either
      }

      return false;
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
   * Get total count text
   */
  async getTotalCountText(): Promise<string | null> {
    return this.totalCount.textContent();
  }

  /**
   * Refresh the key list
   */
  async refresh(): Promise<void> {
    await this.refreshButton.click();
  }

  /**
   * Check if no keys message is visible
   */
  async isNoKeysMessageVisible(): Promise<boolean> {
    try {
      // Check for various "no keys" indicators
      const noKeysText = this.page.getByText(/no keys|no results|0 keys/i);
      const totalZero = this.page.getByText(/Total:\s*0/);

      const noKeysVisible = await noKeysText.isVisible().catch(() => false);
      const totalZeroVisible = await totalZero.isVisible().catch(() => false);

      return noKeysVisible || totalZeroVisible;
    } catch {
      return false;
    }
  }

  /**
   * Check if tree view is active
   */
  async isTreeViewActive(): Promise<boolean> {
    const isActive = await this.treeViewButton.getAttribute('class');
    return isActive?.includes('active') || false;
  }

  /**
   * Check if list view is active
   */
  async isListViewActive(): Promise<boolean> {
    const isActive = await this.listViewButton.getAttribute('class');
    return isActive?.includes('active') || false;
  }

  /**
   * Open tree view settings dialog
   */
  async openTreeViewSettings(): Promise<void> {
    await this.treeSettingsButton.click();
    // Wait for dialog to appear
    await this.page.getByRole('dialog').waitFor({ state: 'visible' });
  }

  /**
   * Get folder by name in tree view
   */
  getFolderByName(folderName: string): Locator {
    return this.page.getByRole('treeitem', { name: new RegExp(`Folder ${folderName}`) });
  }

  /**
   * Expand folder in tree view
   */
  async expandFolder(folderName: string): Promise<void> {
    const folder = this.getFolderByName(folderName);
    await folder.click();
    // Wait for chevron to change to down
    await this.page.getByRole('treeitem', { name: new RegExp(`Chevron Down.*${folderName}`) }).waitFor({ state: 'visible' });
  }

  /**
   * Collapse folder in tree view
   */
  async collapseFolder(folderName: string): Promise<void> {
    const folder = this.getFolderByName(folderName);
    await folder.click();
    // Wait for chevron to change to right
    await this.page.getByRole('treeitem', { name: new RegExp(`Chevron Right.*${folderName}`) }).waitFor({ state: 'visible' });
  }

  /**
   * Check if folder is expanded
   */
  async isFolderExpanded(folderName: string): Promise<boolean> {
    const expandedFolder = this.page.getByRole('treeitem', { name: new RegExp(`Chevron Down.*${folderName}`) });
    return expandedFolder.isVisible();
  }

  /**
   * Get folder percentage text
   */
  async getFolderPercentage(folderName: string): Promise<string | null> {
    const folder = this.getFolderByName(folderName);
    const percentageElement = folder.locator('div').filter({ hasText: /\d+%|<1%/ }).first();
    return percentageElement.textContent();
  }

  /**
   * Get folder count
   */
  async getFolderCount(folderName: string): Promise<string | null> {
    const folder = this.getFolderByName(folderName);
    // The count is the last number in the folder row
    const countElement = folder.locator('div').last();
    return countElement.textContent();
  }
}

