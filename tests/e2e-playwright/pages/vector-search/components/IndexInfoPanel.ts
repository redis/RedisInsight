import { Page, Locator } from '@playwright/test';

/**
 * Index Info Panel component
 * Side panel showing index details (title displays the index name)
 */
export class IndexInfoPanel {
  readonly page: Page;

  readonly container: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.container = page.getByTestId('view-index-panel');
    this.closeButton = page.getByRole('button', { name: 'Close panel' });
  }

  getTitle(indexName: string): Locator {
    return this.container.getByText(indexName, { exact: true });
  }
}
