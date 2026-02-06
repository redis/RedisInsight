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
  readonly resetFilterButton: Locator;

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
  readonly scanMoreButton: Locator;

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
    this.resetFilterButton = page.getByTestId('reset-filter-btn');

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
    this.scanMoreButton = page.getByTestId('scan-more');

    // Key list container
    this.keyListContainer = page.locator('[data-testid="virtual-list"], [role="tree"], [role="grid"]');
    this.container = page.locator('[data-testid="virtual-list"], [role="tree"], [role="grid"]');
    this.noKeysMessage = page.getByText(/no keys/i);
  }

  /**
   * Wait for keys to load
   * Handles List view (Total:), Tree view (Results:), and empty database
   */
  async waitForKeysLoaded(timeout = 30000): Promise<void> {
    // Wait for either:
    // - "Total:" (List view with keys)
    // - "Results:" (Tree view or filtered results)
    // - "Let's start working" (empty database)
    await expect(
      this.page.getByText(/Total:|Results:|Let's start working/).first(),
    ).toBeVisible({ timeout });
  }

  /**
   * Search for keys by pattern
   */
  async searchKeys(pattern: string): Promise<void> {
    await this.searchInput.fill(pattern);
    await this.searchButton.click();
    // Wait for "Results:" to appear (indicates filter is applied)
    await this.resultsCount.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Clear search by clicking the reset filter button
   */
  async clearSearch(): Promise<void> {
    await this.resetFilterButton.click();
    // Wait for reset button to disappear (indicates filter is cleared)
    await this.resetFilterButton.waitFor({ state: 'hidden', timeout: 10000 });
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
   * Click scan more button to load more keys
   */
  async scanMore(): Promise<void> {
    await this.scanMoreButton.click();
  }

  /**
   * Check if scan more button is visible
   */
  async isScanMoreVisible(): Promise<boolean> {
    try {
      await this.scanMoreButton.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get scanned count text (e.g., "Scanned 1 000 / 3 274")
   */
  async getScannedCountText(): Promise<string> {
    await this.scannedCount.waitFor({ state: 'visible' });
    return await this.scannedCount.innerText();
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

      // Try grid cell (list view) - look for exact key name in gridcell
      const gridCell = this.page.getByRole('gridcell', { name: keyName });

      // Try treeitem (tree view) - key name appears in the treeitem accessible name
      const treeItem = this.page.getByRole('treeitem', { name: new RegExp(escapedKeyName) });

      const keyElement = gridCell.or(treeItem);
      await keyElement.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get key row locator by name
   * Returns a locator that can be used for assertions (visible/not visible)
   */
  getKeyRow(keyName: string): Locator {
    // Escape special regex characters in key name
    const escapedKeyName = keyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Return locator for grid cell (list view) or treeitem (tree view)
    // Use or() to combine both selectors
    return this.page
      .getByRole('gridcell', { name: keyName })
      .or(this.page.getByRole('treeitem', { name: new RegExp(escapedKeyName) }));
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
   * Get key count as number
   */
  async getKeyCount(): Promise<number> {
    const text = await this.getResultsCountText();
    if (!text) return 0;
    // Extract number from "Results: X." or "Total: X"
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
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
      // Use first() to handle multiple matches
      const noKeysText = this.page.getByText(/no keys|no results found|0 keys/i).first();
      const totalZero = this.page.getByText(/Total:\s*0/).first();
      const resultsZero = this.page.getByText(/Results:\s*0/).first();

      const noKeysVisible = await noKeysText.isVisible().catch(() => false);
      const totalZeroVisible = await totalZero.isVisible().catch(() => false);
      const resultsZeroVisible = await resultsZero.isVisible().catch(() => false);

      return noKeysVisible || totalZeroVisible || resultsZeroVisible;
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

  /**
   * Get current delimiter from tree view settings
   */
  async getCurrentDelimiter(): Promise<string> {
    const delimiterChip = this.page.getByRole('dialog').locator('[class*="chip"]').first();
    const text = await delimiterChip.textContent();
    return text?.replace('Remove', '').trim() || '';
  }

  /**
   * Add delimiter in tree view settings
   */
  async addDelimiter(delimiter: string): Promise<void> {
    const delimiterInput = this.page.getByRole('textbox', { name: 'Delimiter' });
    await delimiterInput.fill(delimiter);
    await delimiterInput.press('Enter');
  }

  /**
   * Remove delimiter in tree view settings
   */
  async removeDelimiter(delimiter: string): Promise<void> {
    const delimiterChip = this.page.getByRole('dialog').locator(`[class*="chip"]`).filter({ hasText: delimiter });
    await delimiterChip.getByRole('button', { name: 'Remove' }).click();
  }

  /**
   * Apply tree view settings
   */
  async applyTreeViewSettings(): Promise<void> {
    await this.page.getByRole('button', { name: 'Apply' }).click();
    // Wait for dialog to close
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' });
  }

  /**
   * Cancel tree view settings
   */
  async cancelTreeViewSettings(): Promise<void> {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
    // Wait for dialog to close
    await this.page.getByRole('dialog').waitFor({ state: 'hidden' });
  }

  /**
   * Change sort by option in tree view settings
   */
  async changeSortBy(option: string): Promise<void> {
    const sortByDropdown = this.page.getByRole('combobox', { name: 'Sort by' });
    await sortByDropdown.click();
    await this.page.getByRole('option', { name: option }).click();
  }
}

