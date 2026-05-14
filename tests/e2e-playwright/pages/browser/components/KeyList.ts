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
  /** Keys browser panel refresh (distinct from instance header refresh) */
  readonly refreshButton: Locator;
  readonly keysAutoRefreshConfigButton: Locator;
  readonly keysAutoRefreshSwitch: Locator;
  readonly emptyDatabasePanel: Locator;
  readonly addKeyFromEmptyButton: Locator;
  readonly treeSettingsButton: Locator;

  // Results info
  readonly resultsCount: Locator;
  readonly totalCount: Locator;
  readonly scannedCount: Locator;
  readonly lastRefresh: Locator;
  readonly scanMoreButton: Locator;

  // Key list container
  readonly keyListContainer: Locator;
  readonly keysBrowserPanel: Locator;
  /** List view table root — present in both legacy left panel and `devBrowser` keys-browser-panel */
  readonly keyListTable: Locator;
  readonly keysSummary: Locator;
  readonly noKeysMessage: Locator;

  // Index selector (Redisearch mode)
  readonly indexSelector: Locator;

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

    // Index selector (Redisearch mode)
    this.indexSelector = page.getByTestId('select-search-mode');

    // View controls
    this.listViewButton = page.getByTestId('view-type-browser-btn');
    this.treeViewButton = page.getByTestId('view-type-list-btn');
    this.columnsButton = page.getByTestId('btn-columns-actions');
    this.refreshButton = page.getByTestId('keys-refresh-btn');
    this.keysAutoRefreshConfigButton = page.getByTestId('keys-auto-refresh-config-btn');
    this.keysAutoRefreshSwitch = page.getByTestId('keys-auto-refresh-switch');
    this.emptyDatabasePanel = page.getByTestId('no-result-found-msg');
    this.addKeyFromEmptyButton = page.getByTestId('add-key-msg-btn');
    this.treeSettingsButton = page.getByTestId('tree-view-settings-btn');

    // Results info
    this.resultsCount = page.getByText(/Results:/);
    this.totalCount = page.getByText(/Total:/);
    this.scannedCount = page.getByText(/Scanned/);
    this.lastRefresh = page.getByText(/Last refresh:/);
    this.scanMoreButton = page.getByTestId('scan-more');

    // Key list container — matches new panel, legacy list view, or legacy tree view
    this.keyListContainer = page.locator(
      '[data-testid="keys-browser-panel"], [data-testid="keyList-table"], [data-testid="virtual-tree"]',
    );
    this.keysBrowserPanel = page.getByTestId('keys-browser-panel');
    this.keyListTable = page.getByTestId('keyList-table');
    this.keysSummary = page.getByTestId('keys-summary');
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
    await expect(this.page.getByText(/Total:|Results:|Let's start working/).first()).toBeVisible({ timeout });
  }

  /**
   * Search for keys by pattern
   */
  async searchKeys(pattern: string): Promise<void> {
    await this.searchInput.fill(pattern);
    await this.searchButton.click();
    // Search can end with either "Results:" or an empty-state message; reset button confirms filter applied.
    await expect(this.resetFilterButton).toBeVisible();
    await expect(this.resultsCount.or(this.emptyDatabasePanel).first()).toBeVisible();
  }

  /**
   * Clear search by clicking the reset filter button
   */
  async clearSearch(): Promise<void> {
    await this.resetFilterButton.click();
    // Wait for reset button to disappear (indicates filter is cleared)
    await expect(this.resetFilterButton).toBeHidden();
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
    return this.scanMoreButton.isVisible();
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
    await this.waitForKeysLoaded();
  }

  /**
   * Switch to tree view
   */
  async switchToTreeView(): Promise<void> {
    await this.treeViewButton.click();
    await this.waitForKeysLoaded();
  }

  /**
   * Click on a key by name
   */
  async clickKey(keyName: string): Promise<void> {
    const keyEl = this.getKeyRow(keyName);
    const isListRowVisible = await keyEl.isVisible();
    if (isListRowVisible) {
      await keyEl.scrollIntoViewIfNeeded();
      await keyEl.click();
      return;
    }
    await this.selectKeyInTree(keyName);
  }

  /**
   * Select a key in tree view by expanding its folder and clicking the leaf.
   * @param keyName full key name (e.g. `prefix:key1`)
   * @param delimiter tree delimiter (default `:`)
   */
  async selectKeyInTree(keyName: string, delimiter = ':'): Promise<void> {
    // browserViewType persists in localStorage across specs in the same Electron instance.
    // If list view leaked from a previous spec, switch to tree view here so the rest of this
    // helper (which only matches tree-view test ids) doesn't time out.
    if (await this.keyListTable.isVisible()) {
      await this.switchToTreeView();
    }

    const delimiterIndex = keyName.lastIndexOf(delimiter);
    const leafName = keyName.substring(delimiterIndex + delimiter.length) || keyName;
    const leafNode = this.keyListContainer.getByRole('treeitem').filter({ hasText: leafName });

    if (delimiterIndex !== -1) {
      const folder = keyName.substring(0, delimiterIndex);
      const collapsed = this.page.getByTestId(`node-item_${folder}`);
      const expanded = this.page.getByTestId(`node-item_${folder}--expanded`);

      await expanded.or(collapsed).waitFor({ state: 'visible' });

      // VirtualTree may auto-expand single-child folders while keeping
      // the collapsed testid. Only click to expand when the leaf is not
      // already visible.
      const leafAlreadyVisible = await leafNode.isVisible().catch(() => false);

      if (!leafAlreadyVisible && (await collapsed.isVisible())) {
        await collapsed.click();
      }
    }

    await leafNode.click();
  }

  /**
   * Check if key exists in list
   * Handles both List view (grid) and Tree view (treeitem)
   */
  async keyExists(keyName: string, timeout = 5000): Promise<boolean> {
    try {
      await this.getKeyLocator(keyName).waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get key row locator by name
   * Returns a locator that can be used for assertions (visible/not visible).
   * Uses .first() because tree view parent nodes can also match the regex
   * (their accessible name includes descendant text), which would otherwise
   * trigger a Playwright strict-mode violation.
   */
  getKeyRow(keyName: string): Locator {
    return this.getKeyLocator(keyName);
  }

  private getKeyLocator(keyName: string): Locator {
    const escapedKeyName = keyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return this.page
      .getByRole('gridcell', { name: keyName })
      .or(this.page.getByRole('treeitem', { name: new RegExp(escapedKeyName) }))
      .first();
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
   * Parsed integer from footer spans (handles thousand separators and leading ~).
   */
  private parseFormattedCount(text: string): number {
    const digitsOnly = text.replace(/\D/g, '');
    return digitsOnly ? parseInt(digitsOnly, 10) : 0;
  }

  /**
   * "Results" count from keys summary (tree view / search); matches `keys-number-of-results`.
   */
  async getFooterResultsCount(): Promise<number> {
    const el = this.keysSummary.getByTestId('keys-number-of-results');
    await el.waitFor({ state: 'visible' });
    return this.parseFormattedCount(await el.innerText());
  }

  /**
   * "Scanned" count from keys summary; matches `keys-number-of-scanned`.
   */
  async getFooterScannedCount(): Promise<number> {
    const el = this.keysSummary.getByTestId('keys-number-of-scanned');
    await el.waitFor({ state: 'visible' });
    return this.parseFormattedCount(await el.innerText());
  }

  /**
   * Refresh the key list
   */
  async refresh(): Promise<void> {
    await this.refreshButton.click();
  }

  /**
   * Open the Columns popover (TTL / Key size toggles)
   */
  async openColumnsPopover(): Promise<void> {
    await this.columnsButton.click();
    await expect(this.page.getByTestId('show-key-size')).toBeVisible();
  }

  /**
   * Open keys Auto Refresh configuration popover
   */
  async openKeysAutoRefreshPopover(): Promise<void> {
    await this.keysAutoRefreshConfigButton.click();
    await expect(this.keysAutoRefreshSwitch).toBeVisible();
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
   * Open tree view settings popover
   */
  async openTreeViewSettings(): Promise<void> {
    await this.treeSettingsButton.click();
    await expect(this.page.getByTestId('tree-view-apply-btn')).toBeVisible();
  }

  /**
   * Hover over a folder node in the tree view (expanded or collapsed)
   */
  async hoverFolderNode(folderName: string): Promise<void> {
    const folder = this.getFolderByName(folderName);
    await expect(folder).toBeVisible();

    // Move the mouse off any previously hovered element so the next hover always
    // dispatches a fresh `mouseenter` (Radix tooltips won't re-open otherwise,
    // e.g. when this is called right after a click on the same folder).
    await this.page.mouse.move(0, 0);
    await folder.locator('.node-folder-anchor').first().hover();
  }

  /**
   * Get the tree-view tooltip for a hovered folder.
   * Retries the hover until the tooltip is visible — a React re-render between
   * hover and tooltip open silently swallows the mouseenter event (Radix behaviour).
   */
  async namespaceTooltip(folderName: string): Promise<Locator> {
    const tooltip = this.page.getByRole('tooltip').filter({ hasText: folderName });
    await expect
      .poll(async () => {
        await this.hoverFolderNode(folderName);
        return tooltip.isVisible();
      })
      .toBe(true);
    return tooltip;
  }

  /**
   * Get folder treeitem by name in tree view.
   * Matches whether the folder is currently expanded or collapsed.
   */
  getFolderByName(folderName: string): Locator {
    const collapsed = this.page.getByTestId(`node-item_${folderName}`);
    const expanded = this.page.getByTestId(`node-item_${folderName}--expanded`);
    return expanded.or(collapsed).first();
  }

  /**
   * Ordered, lower-case folder labels currently visible in the tree.
   * Useful for asserting sort-order changes.
   */
  async getVisibleTreeFolderNames(): Promise<string[]> {
    const folderLabels = this.page.locator('[data-testid^="folder-"]');
    return folderLabels.allInnerTexts();
  }

  /**
   * Expand a folder in tree view so its direct child becomes visible.
   * Uses `childName` visibility as ground truth — the VirtualTree may auto-expand
   * single-child folders while keeping the collapsed `node-item_*` testid, so the
   * testid suffix alone is unreliable.
   */
  async expandFolder(folderName: string, childName: string): Promise<void> {
    const folder = this.getFolderByName(folderName);
    await expect(folder).toBeVisible();

    const isExpanded = await this.isFolderExpanded(folderName, childName);
    if (isExpanded) {
      return;
    }

    await folder.click();
    const child = this.getFolderByName(childName);
    await expect(child).toBeVisible();
  }

  /**
   * Collapse a folder in tree view so its direct child becomes hidden.
   */
  async collapseFolder(folderName: string, childName: string): Promise<void> {
    const folder = this.getFolderByName(folderName);
    await expect(folder).toBeVisible();

    const isExpanded = await this.isFolderExpanded(folderName, childName);
    if (!isExpanded) {
      return;
    }

    await folder.click();
    const child = this.getFolderByName(childName);
    await expect(child).toBeHidden();
  }

  /**
   * Whether a folder appears expanded (its direct child is rendered).
   */
  async isFolderExpanded(folderName: string, childName: string): Promise<boolean> {
    if (!(await this.getFolderByName(folderName).isVisible())) {
      return false;
    }
    return this.getFolderByName(childName).isVisible();
  }

  /**
   * Folder percentage text (e.g. `33%`, `<1%`).
   */
  async getFolderPercentage(folderName: string): Promise<string | null> {
    return this.page.getByTestId(`percentage_${folderName}`).textContent();
  }

  /**
   * Folder key count text (number of keys under the folder).
   */
  async getFolderCount(folderName: string): Promise<string | null> {
    return this.page.getByTestId(`count_${folderName}`).textContent();
  }

  /**
   * All currently visible delimiter chips inside the tree-view settings popover.
   */
  delimiterChips(): Locator {
    return this.page.locator('[data-testid="delimiter-combobox"] [data-test-subj="autoTagChip"]');
  }

  /**
   * Read all configured delimiter labels (chip titles) in order.
   */
  async getCurrentDelimiters(): Promise<string[]> {
    const chips = this.delimiterChips();
    const titles = await chips.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('title') ?? node.textContent ?? ''),
    );
    return titles.map((title) => title.trim()).filter(Boolean);
  }

  /**
   * Add a delimiter via the AutoTag input inside the tree-view settings popover.
   */
  async addDelimiter(delimiter: string): Promise<void> {
    const delimiterInput = this.page.locator('[data-testid="delimiter-combobox"] [data-test-subj="autoTagInput"]');
    await delimiterInput.fill(delimiter);
    await delimiterInput.press('Enter');
    await expect(
      this.page.locator(`[data-testid="delimiter-combobox"] [data-test-subj="autoTagChip"][title="${delimiter}"]`),
    ).toBeVisible();
  }

  /**
   * Remove a delimiter chip by its label.
   */
  async removeDelimiter(delimiter: string): Promise<void> {
    const chip = this.page.locator(
      `[data-testid="delimiter-combobox"] [data-test-subj="autoTagChip"][title="${delimiter}"]`,
    );
    await chip.locator('button').click();
    await expect(chip).toBeHidden();
  }

  /**
   * Apply tree view settings (closes popover).
   */
  async applyTreeViewSettings(): Promise<void> {
    const applyButton = this.page.getByTestId('tree-view-apply-btn');
    await applyButton.click();
    await expect(applyButton).toBeHidden();
  }

  /**
   * Cancel tree view settings (closes popover, discards changes).
   */
  async cancelTreeViewSettings(): Promise<void> {
    const cancelButton = this.page.getByTestId('tree-view-cancel-btn');
    await cancelButton.click();
    await expect(cancelButton).toBeHidden();
  }

  /**
   * Change sort order in tree view settings popover.
   */
  async changeSortBy(order: 'ASC' | 'DESC'): Promise<void> {
    await this.page.getByTestId('tree-view-sorting-select').click();
    await this.page.getByTestId(`tree-view-sorting-item-${order}`).click();
  }

  /**
   * Close columns popover by clicking outside (Escape)
   */
  async closeColumnsPopover(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.page.getByTestId('show-key-size')).toBeHidden();
  }

  /**
   * Scroll the keys browser panel (virtualized list/tree) with the mouse wheel.
   * Hovers the virtual table area — not the top of the panel (summary/header), so the wheel reaches the grid.
   */
  async scrollKeysPanelVertically(deltaY: number): Promise<void> {
    const grid = this.keyListTable.getByRole('grid').first();
    await grid.hover({ position: { x: 120, y: 160 } });
    await this.page.mouse.wheel(0, deltaY);
  }
}
