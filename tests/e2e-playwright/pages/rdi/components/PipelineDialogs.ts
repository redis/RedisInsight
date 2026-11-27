import { Page, Locator } from '@playwright/test';

/**
 * rdi-ui's "Confirm navigation" prompt, shown when leaving a pipeline with
 * unsaved changes
 */
export class ConfirmNavigationDialog {
  readonly dialog: Locator;
  readonly stayButton: Locator;
  readonly leaveButton: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Confirm navigation' });
    this.stayButton = this.dialog.getByRole('button', { name: 'Stay on this page' });
    this.leaveButton = this.dialog.getByRole('button', { name: 'Leave this page' });
  }
}

/**
 * The confirmation rdi-ui asks for before a pipeline action, e.g.
 * "Stop pipeline?" with Cancel and "Stop pipeline"
 */
export class PipelineActionDialog {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * @param action - The action's name, e.g. "Stop pipeline"; the dialog is titled "<action>?"
   */
  getDialog(action: string): Locator {
    return this.page.getByRole('dialog', { name: `${action}?` });
  }

  getConfirmButton(action: string): Locator {
    return this.getDialog(action).getByRole('button', { name: action, exact: true });
  }

  getCancelButton(action: string): Locator {
    return this.getDialog(action).getByRole('button', { name: 'Cancel' });
  }
}
