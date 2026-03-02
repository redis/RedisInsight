import { Page, Locator } from '@playwright/test';

/**
 * Command Helper Panel component
 * Handles the Command Helper panel at the bottom of the page
 */
export class CommandHelperPanel {
  readonly page: Page;
  readonly container: Locator;
  readonly innerContainer: Locator;
  readonly expandButton: Locator;
  readonly hideButton: Locator;
  readonly closeButton: Locator;
  readonly searchInput: Locator;
  readonly filterDropdown: Locator;
  readonly defaultText: Locator;
  readonly commandTitle: Locator;
  readonly commandSummary: Locator;
  readonly searchResultTitles: Locator;
  readonly backToListButton: Locator;
  readonly readMoreLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('command-helper');
    this.innerContainer = page.getByTestId('cli-helper');
    this.expandButton = page.getByTestId('expand-command-helper');
    this.hideButton = page.getByTestId('hide-command-helper');
    this.closeButton = page.getByTestId('close-command-helper');
    this.searchInput = page.getByTestId('cli-helper-search');
    this.filterDropdown = page.getByTestId('select-filter-group-type');
    this.defaultText = page.getByTestId('cli-helper-default');
    this.commandTitle = page.getByTestId('cli-helper-title');
    this.commandSummary = page.getByTestId('cli-helper-summary');
    this.searchResultTitles = page.getByTestId(/cli-helper-output-title/);
    this.backToListButton = page.getByTestId('cli-helper-back-to-list-btn');
    this.readMoreLink = page.getByTestId('read-more');
  }

  /**
   * Open the Command Helper panel
   */
  async open(): Promise<void> {
    const isVisible = await this.hideButton.isVisible();
    if (!isVisible) {
      await this.expandButton.click();
      await this.hideButton.waitFor({ state: 'visible' });
    }
  }

  /**
   * Close the Command Helper panel (removes it completely)
   */
  async close(): Promise<void> {
    const isVisible = await this.closeButton.isVisible();
    if (isVisible) {
      await this.closeButton.click();
    }
  }

  /**
   * Hide the Command Helper panel (minimize)
   */
  async hide(): Promise<void> {
    const isVisible = await this.hideButton.isVisible();
    if (isVisible) {
      await this.hideButton.click();
    }
  }

  /**
   * Check if Command Helper panel is open
   */
  async isOpen(): Promise<boolean> {
    return this.hideButton.isVisible();
  }

  /**
   * Search for a command
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  /**
   * Clear the search input
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }

  /**
   * Filter commands by category/group type
   */
  async filterByCategory(category: string): Promise<void> {
    await this.filterDropdown.click();
    // Click on the filter option with the category value
    await this.page.getByText(category, { exact: false }).first().click();
  }

  /**
   * Select a command from search results
   */
  async selectCommand(commandName: string): Promise<void> {
    await this.page.getByTestId(`cli-helper-output-title-${commandName}`).click();
  }

  /**
   * Go back to search results list from command details
   */
  async backToList(): Promise<void> {
    await this.backToListButton.click();
  }

  /**
   * Get search result count
   */
  async getSearchResultCount(): Promise<number> {
    return this.searchResultTitles.count();
  }

  /**
   * Get the command title text
   */
  async getCommandTitle(): Promise<string> {
    return this.commandTitle.innerText();
  }

  /**
   * Get the command summary text
   */
  async getCommandSummary(): Promise<string> {
    return this.commandSummary.innerText();
  }
}
