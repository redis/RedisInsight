import { Page, Locator } from '@playwright/test';

/**
 * Index Info Panel component
 * Side panel showing index details
 */
export class IndexInfoPanel {
  readonly page: Page;

  readonly container: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.container = page.getByTestId('view-index-panel');
    this.title = page.getByText('View index');
    this.closeButton = page.getByRole('button', { name: 'Close panel' });
  }
}
