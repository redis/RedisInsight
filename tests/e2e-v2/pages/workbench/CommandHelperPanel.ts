import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Command Helper panel (bottom panel)
 * Note: This is a component, not a standalone page
 */
export class CommandHelperPanel {
  readonly page: Page;
  readonly expandButton: Locator;
  readonly panelContainer: Locator;
  readonly panelTitle: Locator;
  readonly hideButton: Locator;
  readonly closeButton: Locator;
  readonly searchInput: Locator;
  readonly filterDropdown: Locator;
  readonly commandList: Locator;
  readonly commandDetails: Locator;

  constructor(page: Page) {
    this.page = page;

    this.expandButton = page.getByTestId('expand-command-helper');
    this.panelContainer = page.locator('[class*="command-helper"]').filter({ hasText: 'Command Helper' });
    this.panelTitle = page.getByText('Command Helper').first();
    this.hideButton = page.getByRole('button', { name: 'hide Command Helper' });
    this.closeButton = page.getByRole('button', { name: 'close Command Helper' });
    this.searchInput = page.getByPlaceholder('Search for a command');
    this.filterDropdown = page.getByRole('combobox').filter({ has: page.getByRole('img', { name: 'Filter' }) });
    this.commandList = page.locator('[class*="command-helper"] [class*="list"]');
    this.commandDetails = page.locator('[class*="command-helper"] [class*="details"]');
  }

  /**
   * Open Command Helper panel
   */
  async open(): Promise<void> {
    await this.expandButton.click();
    await this.panelTitle.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Hide Command Helper panel (minimize)
   */
  async hide(): Promise<void> {
    await this.hideButton.click();
    await this.searchInput.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Close Command Helper panel
   */
  async close(): Promise<void> {
    await this.closeButton.click();
    await this.searchInput.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Check if Command Helper panel is open
   */
  async isOpen(): Promise<boolean> {
    return this.searchInput.isVisible();
  }

  /**
   * Search for a command
   */
  async searchCommand(command: string): Promise<void> {
    await this.searchInput.fill(command);
  }

  /**
   * Clear search
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }
}

