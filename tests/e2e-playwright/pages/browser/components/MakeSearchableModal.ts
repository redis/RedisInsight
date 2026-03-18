import { Page, Locator } from '@playwright/test';

/**
 * "Make this data searchable" modal
 *
 * Shown when the user clicks "Make searchable" on a key or
 * "Index" on a folder node in the browser tree.
 */
export class MakeSearchableModal {
  readonly page: Page;

  readonly container: Locator;
  readonly heading: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.container = page.getByRole('dialog');
    this.heading = this.container.getByText('Make this data searchable');
    this.continueButton = this.container.getByRole('button', { name: 'Continue' });
    this.cancelButton = this.container.getByRole('button', { name: 'Cancel' });
  }
}
