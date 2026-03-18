import { Page, Locator } from '@playwright/test';

/**
 * Index List component
 * Table of existing search indexes on the list page
 */
export class IndexList {
  readonly page: Page;

  readonly container: Locator;
  readonly table: Locator;
  readonly createIndexButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.container = page.getByTestId('vector-search-page--list');
    this.table = page.getByTestId('vector-search--list--table');
    this.createIndexButton = page.getByRole('button', { name: '+ Create search index' });
  }

  getIndexName(indexName: string): Locator {
    return this.page.getByTestId(`index-name-${indexName}`);
  }

  getCreateIndexMenuItem(option: 'sample-data' | 'existing-data'): Locator {
    const text = option === 'sample-data' ? 'Use sample data' : 'Use existing data';
    return this.page.getByRole('menuitem', { name: text });
  }

  /**
   * Open the "Create index" menu and click the given option
   */
  async openCreateIndex(option: 'sample-data' | 'existing-data'): Promise<void> {
    await this.createIndexButton.click();
    await this.getCreateIndexMenuItem(option).click();
  }

  /**
   * Get the query button for a specific index row
   */
  getQueryButton(indexId: string): Locator {
    return this.page.getByTestId(`index-query-btn-${indexId}`);
  }

  /**
   * Click the query button for a specific index to navigate to the query page
   */
  async openQuery(indexName: string): Promise<void> {
    await this.getQueryButton(indexName).click();
  }

  /**
   * Get the actions menu trigger for a specific index row
   */
  getActionsMenuTrigger(indexId: string): Locator {
    return this.page.getByTestId(`index-actions-menu-trigger-${indexId}`);
  }

  /**
   * Get a menu action item (e.g. "Browse", "View", "Delete") from the actions menu
   */
  getActionMenuItem(name: string): Locator {
    return this.page.getByRole('menuitem', { name });
  }
}
