import { Page, Locator } from '@playwright/test';

export class SaveQueryModal {
  readonly page: Page;

  readonly body: Locator;
  readonly nameInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;

  readonly successToast: Locator;
  readonly successToastGoToLibrary: Locator;

  constructor(page: Page) {
    this.page = page;

    this.body = page.getByRole('dialog', { name: 'Save query' });
    this.nameInput = page.getByPlaceholder('Enter command name');
    this.saveButton = this.body.getByRole('button', { name: 'Save query' });
    this.cancelButton = this.body.getByRole('button', { name: 'Cancel' });
    this.closeButton = page.getByTestId('save-query-modal-close');

    this.successToast = page.getByText('Query saved to your library.');
    this.successToastGoToLibrary = page.getByRole('button', { name: 'Go to Query Library' });
  }
}
