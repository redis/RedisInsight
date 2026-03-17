import { Page, Locator } from '@playwright/test';

/**
 * Field Type Modal (Add / Edit field)
 *
 * Shown when the user clicks "+ Add field" or edits an existing field
 * in the create-index schema table.
 */
export class FieldTypeModal {
  readonly page: Page;

  readonly dialog: Locator;
  readonly form: Locator;
  readonly fieldNameInput: Locator;
  readonly fieldTypeSelect: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dialog = page.getByRole('dialog', { name: /Add field|Edit field/ });
    this.form = page.getByTestId('field-type-modal-form');
    this.fieldNameInput = page.getByTestId('field-type-modal-field-name');
    this.fieldTypeSelect = page.getByTestId('field-type-modal-field-type');
    this.saveButton = this.dialog.getByRole('button', { name: /^(Save|Add)$/ });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
  }
}
