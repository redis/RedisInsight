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

  // Pagination elements
  readonly paginationNav: Locator;
  readonly paginationFirstPageButton: Locator;
  readonly paginationLastPageButton: Locator;
  readonly paginationPreviousButton: Locator;
  readonly paginationNextButton: Locator;
  readonly paginationPageInfo: Locator;
  readonly paginationRowCount: Locator;
  readonly paginationItemsPerPage: Locator;
  readonly paginationPageSelect: Locator;

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

    // Pagination elements
    this.paginationNav = page.getByRole('navigation', { name: 'Pagination' });
    this.paginationFirstPageButton = this.paginationNav.getByRole('button', { name: 'first page' });
    this.paginationLastPageButton = this.paginationNav.getByRole('button', { name: 'last page' });
    this.paginationPreviousButton = this.paginationNav.getByRole('button', { name: 'previous page' });
    this.paginationNextButton = this.paginationNav.getByRole('button', { name: 'next page' });
    this.paginationPageInfo = this.paginationNav.locator('p').filter({ hasText: /\d+ of \d+/ });
    this.paginationRowCount = this.paginationNav.locator('p').filter({ hasText: /Showing \d+ out of \d+ rows/ });
    this.paginationItemsPerPage = this.paginationNav.getByRole('combobox', { name: 'Items per page:' });
    this.paginationPageSelect = this.paginationNav.getByRole('combobox', { name: 'Page', exact: true });
  }

  /**
   * Escape special regex characters in a string
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get a database row by name
   * Uses a strict text match in the database alias column (2nd column)
   */
  getRow(name: string): Locator {
    const escapedName = this.escapeRegex(name);
    return this.page
      .locator('table tbody tr')
      .filter({
        has: this.page.locator('td:nth-child(2)').filter({ hasText: new RegExp(`^${escapedName}\\s*$`) }),
      })
      .first();
  }

  /**
   * Get row checkbox by database name
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
    await row.getByTestId(/controls-button/).click();
    await this.page.getByRole('button', { name: 'Remove field' }).click();
    await this.page.getByRole('button', { name: 'Remove' }).click();
  }

  /**
   * Edit a database using the row controls dropdown
   */
  async edit(name: string): Promise<void> {
    const row = this.getRow(name);
    await row.hover();
    await row.getByTestId(/controls-button/).click();
    await this.page.getByRole('button', { name: /edit instance/i }).click();
  }

  /**
   * Open the clone database dialog for a database
   */
  async openCloneDialog(name: string): Promise<void> {
    await this.edit(name);
    await this.page.getByRole('dialog', { name: /edit database/i }).waitFor({ state: 'visible' });
    await this.page.getByTestId('clone-db-btn').click();
    await this.page.getByRole('dialog', { name: /clone database/i }).waitFor({ state: 'visible' });
  }

  /**
   * Get the visible row count in the current page
   */
  async getVisibleRowCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr');
    return await rows.count();
  }

  /**
   * Get the total count from the pagination info (e.g., "Showing X out of Y rows")
   * Returns the total number of databases, not just visible rows
   */
  async getTotalCount(): Promise<number> {
    const text = await this.paginationRowCount.textContent();
    const match = text?.match(/out of (\d+) rows/);
    return match ? parseInt(match[1], 10) : await this.getVisibleRowCount();
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
   */
  async expectDatabaseVisible(name: string, options: { timeout?: number; searchFirst?: boolean } = {}): Promise<void> {
    const { timeout = 15000, searchFirst = false } = options;

    if (searchFirst) {
      await expect(async () => {
        await this.clearSearch();
        await this.page.waitForTimeout(100);
        await this.search(name);
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

  // ==================== PAGINATION ====================

  /**
   * Check if pagination is visible
   */
  async isPaginationVisible(): Promise<boolean> {
    return await this.paginationNav.isVisible().catch(() => false);
  }

  /**
   * Go to first page
   */
  async goToFirstPage(): Promise<void> {
    await this.paginationFirstPageButton.click();
  }

  /**
   * Go to last page
   */
  async goToLastPage(): Promise<void> {
    await this.paginationLastPageButton.click();
  }

  /**
   * Go to next page
   */
  async goToNextPage(): Promise<void> {
    await this.paginationNextButton.click();
  }

  /**
   * Go to previous page
   */
  async goToPreviousPage(): Promise<void> {
    await this.paginationPreviousButton.click();
  }

  /**
   * Check if next page button is enabled
   */
  async isNextPageEnabled(): Promise<boolean> {
    return await this.paginationNextButton.isEnabled().catch(() => false);
  }

  /**
   * Check if previous page button is enabled
   */
  async isPreviousPageEnabled(): Promise<boolean> {
    return await this.paginationPreviousButton.isEnabled().catch(() => false);
  }

  /**
   * Check if first page button is enabled
   */
  async isFirstPageEnabled(): Promise<boolean> {
    return await this.paginationFirstPageButton.isEnabled().catch(() => false);
  }

  /**
   * Check if last page button is enabled
   */
  async isLastPageEnabled(): Promise<boolean> {
    return await this.paginationLastPageButton.isEnabled().catch(() => false);
  }

  /**
   * Get the row count text (e.g., "Showing 10 out of 20 rows")
   */
  async getRowCountText(): Promise<string> {
    return (await this.paginationRowCount.textContent()) || '';
  }

  /**
   * Get current items per page value
   */
  async getItemsPerPage(): Promise<string> {
    return (await this.paginationItemsPerPage.textContent()) || '';
  }

  /**
   * Set items per page
   */
  async setItemsPerPage(value: '10' | '25' | '50' | '100'): Promise<void> {
    await this.paginationItemsPerPage.click();
    await this.page.getByRole('option', { name: value }).click();
  }

  /**
   * Get current page number from page select
   */
  async getCurrentPage(): Promise<string> {
    return (await this.paginationPageSelect.textContent()) || '';
  }

  /**
   * Select a specific page from dropdown
   */
  async selectPage(pageNumber: string): Promise<void> {
    await this.paginationPageSelect.click();
    await this.page.getByRole('option', { name: pageNumber }).click();
  }
}
