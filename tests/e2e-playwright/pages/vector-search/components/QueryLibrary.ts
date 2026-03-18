import { Page, Locator } from '@playwright/test';

/**
 * Query Library component
 * Panel for managing saved queries
 */
export class QueryLibrary {
  readonly page: Page;

  readonly container: Locator;
  readonly searchInput: Locator;
  readonly emptyMessage: Locator;
  readonly errorMessage: Locator;
  readonly deleteSuccessToast: Locator;
  readonly allItems: Locator;

  constructor(page: Page) {
    this.page = page;

    this.container = page.getByTestId('query-library-view');
    this.searchInput = page.getByPlaceholder('Search query');
    this.emptyMessage = this.container.getByText('No saved queries yet');
    this.errorMessage = this.container.getByText('Failed to load');
    this.deleteSuccessToast = page.getByText('Query has been deleted.');
    this.allItems = this.container.locator('[data-testid^="query-library-item-"][data-testid$="-header"]');
  }

  getItem(id: string): Locator {
    return this.page.getByTestId(`query-library-item-${id}`);
  }

  getItemHeader(id: string): Locator {
    return this.page.getByTestId(`query-library-item-${id}-header`);
  }

  getItemBody(id: string): Locator {
    return this.page.getByTestId(`query-library-item-${id}-body`);
  }

  getItemByName(name: string): Locator {
    return this.allItems.filter({ hasText: name });
  }

  getItemRunButton(id: string): Locator {
    return this.getItem(id).getByRole('button', { name: 'Run' });
  }

  getItemLoadButton(id: string): Locator {
    return this.getItem(id).getByRole('button', { name: 'Load' });
  }

  getItemDeleteButton(id: string): Locator {
    return this.getItem(id).getByRole('button', { name: 'Delete query' });
  }
}
