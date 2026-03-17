import { Page, Locator } from '@playwright/test';

export class DeleteIndexModal {
  readonly page: Page;

  readonly dialog: Locator;
  readonly message: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dialog = page.getByRole('dialog', { name: 'Delete index' });
    this.message = this.dialog.getByTestId('delete-index-modal-message');
    this.confirmButton = this.dialog.getByRole('button', { name: 'Delete index' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Keep index' });
    this.closeButton = this.dialog.getByTestId('delete-index-modal-close');
  }
}

export class DeleteQueryModal {
  readonly page: Page;

  readonly dialog: Locator;
  readonly message: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dialog = page.getByRole('dialog', { name: 'Delete query' });
    this.message = this.dialog.getByTestId('query-library-delete-modal-message');
    this.confirmButton = this.dialog.getByRole('button', { name: 'Delete query' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Keep query' });
    this.closeButton = this.dialog.getByTestId('query-library-delete-modal-close');
  }
}
