import { Page, Locator, expect } from '@playwright/test';

/**
 * Component Page Object for the Tags Dialog
 * Handles adding, editing, and removing tags on databases
 */
export class TagsDialog {
  readonly page: Page;
  readonly dialog: Locator;
  readonly title: Locator;
  readonly addTagButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog', { name: /manage tags/i });
    this.title = this.dialog.locator('[class*="title"], h1, h2').first();
    this.addTagButton = page.getByTestId('add-tag-button');
    this.saveButton = this.dialog.getByRole('button', { name: 'Save tags' });
    this.cancelButton = page.getByTestId('close-button');
    this.closeButton = this.dialog.getByRole('button', { name: 'close' });
  }

  /**
   * Wait for the dialog to be visible
   */
  async waitForVisible(): Promise<void> {
    await this.dialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Check if dialog is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.dialog.isVisible().catch(() => false);
  }

  /**
   * Get all tag rows
   */
  getTagRows(): Locator {
    return this.dialog.locator('[data-testid^="tag-row"]');
  }

  /**
   * Get the key input for a tag row (by index, 0-based)
   */
  getKeyInput(index: number): Locator {
    return this.dialog.getByPlaceholder('Select a key or type your own').nth(index);
  }

  /**
   * Get the value input for a tag row (by index, 0-based)
   */
  getValueInput(index: number): Locator {
    return this.dialog.getByPlaceholder('Select a value or type your own').nth(index);
  }

  /**
   * Get the delete button for a tag row (by index)
   */
  getDeleteButton(index: number): Locator {
    return this.dialog.getByRole('img', { name: 'Delete' }).nth(index);
  }

  /**
   * Add a tag with key and value
   */
  async addTag(key: string, value: string): Promise<void> {
    // Click add tag button
    await this.addTagButton.click();

    // Get the index of the new tag (count existing key inputs)
    const keyInputs = this.dialog.getByPlaceholder('Select a key or type your own');
    const count = await keyInputs.count();
    const newIndex = count - 1;

    // Fill in the key
    const keyInput = this.getKeyInput(newIndex);
    await keyInput.fill(key);
    await keyInput.press('Tab');

    // Fill in the value
    const valueInput = this.getValueInput(newIndex);
    await valueInput.fill(value);
  }

  /**
   * Delete a tag by index
   */
  async deleteTag(index: number): Promise<void> {
    await this.getDeleteButton(index).click();
  }

  /**
   * Save the tags
   */
  async save(): Promise<void> {
    await this.saveButton.click();
    // Wait for dialog to close
    await this.dialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Cancel and close the dialog
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.dialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Close the dialog using the X button
   */
  async close(): Promise<void> {
    await this.closeButton.click();
    await this.dialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Get the count of tag rows
   */
  async getTagCount(): Promise<number> {
    return await this.dialog.getByPlaceholder('Select a key or type your own').count();
  }

  /**
   * Check if save button is enabled
   */
  async isSaveEnabled(): Promise<boolean> {
    return await this.saveButton.isEnabled();
  }

  /**
   * Assert dialog is visible
   */
  async expectVisible(): Promise<void> {
    await expect(this.dialog).toBeVisible();
  }

  /**
   * Assert dialog is hidden
   */
  async expectHidden(): Promise<void> {
    await expect(this.dialog).not.toBeVisible();
  }
}

