import { Page, Locator, expect } from '@playwright/test';

/**
 * Type-to-confirm modal — gates dangerous actions on Production databases.
 *
 * Two variants (per RI-8201):
 *  - **Input required** (CLI, Workbench dangerous commands, Bulk delete): user
 *    must type the DB name before Confirm enables.
 *  - **Input disabled** (Browser writes — rename, TTL, edit value, add hash
 *    field, etc.): no input rendered; Confirm is enabled immediately.
 */
export class TypeToConfirmModal {
  readonly page: Page;
  readonly title: Locator;
  readonly description: Locator;
  readonly input: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly skipForSessionCheckbox: Locator;
  readonly tip: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('type-to-confirm-modal-title');
    this.description = page.getByTestId('type-to-confirm-modal-description');
    this.input = page.getByTestId('type-to-confirm-modal-input');
    this.confirmButton = page.getByTestId('type-to-confirm-modal-confirm-btn');
    this.cancelButton = page.getByTestId('type-to-confirm-modal-cancel-btn');
    this.closeButton = page.getByTestId('type-to-confirm-modal-close-btn');
    this.skipForSessionCheckbox = page.getByTestId('type-to-confirm-modal-skip-checkbox');
    this.tip = page.getByTestId('type-to-confirm-modal-tip');
  }

  /** Wait for the modal to be visible (description always renders). */
  async waitForOpen(): Promise<void> {
    await this.description.waitFor({ state: 'visible', timeout: 5000 });
  }

  /** Wait for the modal to close. */
  async waitForClose(): Promise<void> {
    await this.description.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /** Returns true if the modal is currently visible. */
  async isOpen(): Promise<boolean> {
    return this.description.isVisible().catch(() => false);
  }

  async typeText(text: string): Promise<void> {
    await this.input.fill(text);
  }

  /**
   * Type the confirmation text and click Confirm. Use this for the
   * **input-required** variant (CLI / Workbench dangerous commands / Bulk
   * delete). Asserts the button becomes enabled once the text matches.
   */
  async confirm(text: string, options: { skipForSession?: boolean } = {}): Promise<void> {
    await this.waitForOpen();
    await this.typeText(text);
    if (options.skipForSession) {
      await this.skipForSessionCheckbox.check();
    }
    await expect(this.confirmButton).toBeEnabled();
    await this.confirmButton.click();
    await this.waitForClose();
  }

  /**
   * Click Confirm directly. Use this for the **input-disabled** variant
   * (Browser writes after RI-8201): no input rendered; Confirm is enabled on
   * first paint.
   */
  async confirmWithoutInput(options: { skipForSession?: boolean } = {}): Promise<void> {
    await this.waitForOpen();
    await expect(this.input).toHaveCount(0);
    if (options.skipForSession) {
      await this.skipForSessionCheckbox.check();
    }
    await expect(this.confirmButton).toBeEnabled();
    await this.confirmButton.click();
    await this.waitForClose();
  }

  async cancel(): Promise<void> {
    await this.waitForOpen();
    await this.cancelButton.click();
    await this.waitForClose();
  }

  /** Assert Confirm stays disabled when the wrong text is typed (input variant). */
  async expectConfirmDisabledWhen(mistypedText: string): Promise<void> {
    await this.waitForOpen();
    await this.typeText(mistypedText);
    await expect(this.confirmButton).toBeDisabled();
  }
}
