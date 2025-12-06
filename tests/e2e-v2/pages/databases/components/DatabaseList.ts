import { Page, Locator } from '@playwright/test';

/**
 * Component Page Object for the Database List
 * Handles interactions with the list of databases
 */
export class DatabaseList {
  readonly page: Page;
  readonly list: Locator;

  constructor(page: Page) {
    this.page = page;
    this.list = page.getByTestId('databases-list');
  }

  /**
   * Get a database row by name
   * Uses partial match on first 20 chars for long names
   */
  getRow(name: string): Locator {
    return this.page.getByRole('row', {
      name: new RegExp(name.substring(0, 20), 'i'),
    });
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
   * Delete a database using the UI
   */
  async delete(name: string): Promise<void> {
    const row = this.getRow(name);
    await row.hover();
    await row.getByTestId('delete-instance-btn').click();
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }

  /**
   * Get the count of databases in the list
   */
  async getCount(): Promise<number> {
    const rows = this.page.locator('[data-testid="databases-list"] [role="row"]');
    return await rows.count();
  }

  /**
   * Search for databases
   */
  async search(query: string): Promise<void> {
    const searchInput = this.page.getByPlaceholder(/search/i);
    await searchInput.fill(query);
  }

  /**
   * Clear the search
   */
  async clearSearch(): Promise<void> {
    const searchInput = this.page.getByPlaceholder(/search/i);
    await searchInput.clear();
  }
}
