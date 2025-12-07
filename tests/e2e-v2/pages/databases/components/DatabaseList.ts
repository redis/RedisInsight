import { Page, Locator, expect } from '@playwright/test';

/**
 * Component Page Object for the Database List
 * Handles interactions with the list of databases
 */
export class DatabaseList {
  readonly page: Page;
  readonly list: Locator;
  readonly searchInput: Locator;
  readonly columnsButton: Locator;
  readonly selectAllCheckbox: Locator;

  // Bulk selection elements
  readonly selectionCounter: Locator;
  readonly exportButton: Locator;
  readonly bulkDeleteButton: Locator;
  readonly cancelSelectingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.list = page.getByTestId('databases-list');
    this.searchInput = page.getByTestId('search-database-list');
    this.columnsButton = page.getByTestId('btn-columns-config');
    this.selectAllCheckbox = page.locator('table thead').getByRole('checkbox');

    // Bulk selection elements
    this.selectionCounter = page.getByText(/You selected: \d+ items?/);
    this.exportButton = page.getByRole('button', { name: 'Export' });
    this.bulkDeleteButton = page.getByRole('button', { name: 'Delete' });
    this.cancelSelectingButton = page.getByRole('button', { name: 'Cancel selecting' });
  }

  /**
   * Get a database row by name
   * Uses a strict text match in the database alias column (2nd column)
   */
  getRow(name: string): Locator {
    // Find the row where the 2nd cell (database alias) contains exactly this name
    // Note: The cell text may have trailing whitespace, so we use a regex that allows it
    return this.page
      .locator('table tbody tr')
      .filter({
        has: this.page.locator('td:nth-child(2)').filter({ hasText: new RegExp(`^${name}\\s*$`) }),
      })
      .first();
  }

  /**
   * Get row checkbox by database name
   * The checkbox is in the first cell of the row
   */
  getRowCheckbox(name: string): Locator {
    return this.getRow(name).getByRole('checkbox');
  }

  /**
   * Check if a database exists in the list
   */
  async exists(name: string): Promise<boolean> {
    const row = this.getRow(name);
    return await row.isVisible().catch(() => false);
  }

  /**
   * Click on a database to connect
   */
  async connect(name: string): Promise<void> {
    const row = this.getRow(name);
    await row.click();
  }

  /**
   * Open the context menu for a database
   */
  async openContextMenu(name: string): Promise<void> {
    const row = this.getRow(name);
    await row.click({ button: 'right' });
  }

  /**
   * Delete a database using the row controls dropdown
   */
  async delete(name: string): Promise<void> {
    const row = this.getRow(name);
    await row.hover();
    // Click the controls button to open dropdown
    await row.getByTestId(/controls-button/).click();
    // Click remove database option
    await this.page.getByRole('menuitem', { name: /remove database/i }).click();
    // Confirm deletion
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }

  /**
   * Edit a database using the row controls dropdown
   */
  async edit(name: string): Promise<void> {
    const row = this.getRow(name);
    await row.hover();
    await row.getByTestId(/controls-button/).click();
    await this.page.getByRole('menuitem', { name: /edit database/i }).click();
  }

  /**
   * Get the visible row count (may differ from total due to filtering)
   */
  async getVisibleRowCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr');
    return await rows.count();
  }

  /**
   * Get the total count from header if available
   */
  async getTotalCount(): Promise<number> {
    const rows = await this.page.locator('table tbody tr').all();
    return rows.length;
  }

  // ==================== SEARCH ====================

  /**
   * Search for databases
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  /**
   * Clear the search
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }

  /**
   * Get search input value
   */
  async getSearchValue(): Promise<string> {
    return (await this.searchInput.inputValue()) || '';
  }

  // ==================== COLUMN CONFIGURATION ====================

  /**
   * Open column configuration dropdown
   */
  async openColumnConfig(): Promise<void> {
    await this.columnsButton.click();
  }

  /**
   * Toggle column visibility
   */
  async toggleColumn(columnName: string): Promise<void> {
    await this.openColumnConfig();
    const checkbox = this.page.getByRole('checkbox', { name: new RegExp(columnName, 'i') });
    await checkbox.click();
    // Close dropdown by pressing Escape
    await this.page.keyboard.press('Escape');
  }

  /**
   * Check if column header is visible
   */
  async isColumnVisible(columnName: string): Promise<boolean> {
    const header = this.page.getByRole('columnheader', { name: new RegExp(columnName, 'i') });
    return await header.isVisible().catch(() => false);
  }

  // ==================== SELECTION ====================

  /**
   * Select a database row by checking its checkbox
   */
  async selectRow(name: string): Promise<void> {
    await this.getRowCheckbox(name).check();
  }

  /**
   * Unselect a database row
   */
  async unselectRow(name: string): Promise<void> {
    await this.getRowCheckbox(name).uncheck();
  }

  /**
   * Select all databases
   */
  async selectAll(): Promise<void> {
    await this.selectAllCheckbox.check();
  }

  /**
   * Unselect all databases
   */
  async unselectAll(): Promise<void> {
    if (await this.cancelSelectingButton.isVisible()) {
      await this.cancelSelectingButton.click();
    } else {
      await this.selectAllCheckbox.uncheck();
    }
  }

  /**
   * Check if row is selected
   */
  async isRowSelected(name: string): Promise<boolean> {
    return await this.getRowCheckbox(name).isChecked();
  }

  /**
   * Get selected count from counter text
   */
  async getSelectedCount(): Promise<number> {
    if (!(await this.selectionCounter.isVisible())) {
      return 0;
    }
    const text = (await this.selectionCounter.textContent()) || '';
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  // ==================== BULK ACTIONS ====================

  /**
   * Delete selected databases
   */
  async deleteSelected(): Promise<void> {
    await this.bulkDeleteButton.click();
    // Confirm in the dialog - use the dialog's delete button specifically
    await this.page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  }

  /**
   * Export selected databases
   */
  async exportSelected(): Promise<void> {
    await this.exportButton.click();
  }

  /**
   * Cancel current selection
   */
  async cancelSelection(): Promise<void> {
    await this.cancelSelectingButton.click();
  }

  // ==================== SORTING ====================

  /**
   * Sort by column
   */
  async sortByColumn(columnName: string): Promise<void> {
    const header = this.page.getByRole('columnheader', { name: new RegExp(columnName, 'i') });
    await header.getByRole('button').click();
  }

  /**
   * Get database names in order
   */
  async getDatabaseNames(): Promise<string[]> {
    const cells = this.page.locator('table tbody tr td:nth-child(2)');
    const names = await cells.allTextContents();
    return names.map((n) => n.trim()).filter((n) => n.length > 0);
  }

  // ==================== TAGS ====================

  /**
   * Open tags manager for a database
   */
  async openTagsManager(name: string): Promise<void> {
    const row = this.getRow(name);
    await row.getByTestId(/manage.*tags/i).click();
  }

  // ==================== ASSERTIONS ====================

  /**
   * Assert database is visible
   * Waits for the database to appear in the list (useful after API creation)
   * @param name - Database name to check
   * @param options - Options for the assertion
   * @param options.timeout - Timeout in milliseconds (default: 15000)
   * @param options.searchFirst - Whether to search for the database first (useful with pagination)
   */
  async expectDatabaseVisible(
    name: string,
    options: { timeout?: number; searchFirst?: boolean } = {},
  ): Promise<void> {
    const { timeout = 15000, searchFirst = false } = options;

    if (searchFirst) {
      // Use toPass() for retry logic - the database list may need to refresh
      // This handles race conditions when the database was just added
      await expect(async () => {
        // Clear any existing search first
        await this.clearSearch();
        // Small wait for UI to update
        await this.page.waitForTimeout(100);
        // Search for the database
        await this.search(name);
        // Check if the row is visible
        await expect(this.getRow(name)).toBeVisible({ timeout: 2000 });
      }).toPass({ timeout, intervals: [500, 1000, 2000] });
      return;
    }

    await expect(this.getRow(name)).toBeVisible({ timeout });
  }

  /**
   * Assert database is not visible
   */
  async expectDatabaseNotVisible(name: string): Promise<void> {
    await expect(this.getRow(name)).not.toBeVisible();
  }

  /**
   * Assert selection counter shows specific count
   */
  async expectSelectedCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.selectionCounter).not.toBeVisible();
    } else {
      await expect(this.selectionCounter).toContainText(count.toString());
    }
  }
}
