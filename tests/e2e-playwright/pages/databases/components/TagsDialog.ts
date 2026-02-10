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

  async waitForVisible(): Promise<void> {
    await this.dialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  async isVisible(): Promise<boolean> {
    return await this.dialog.isVisible().catch(() => false);
  }

  getTagRows(): Locator {
    return this.dialog.locator('[data-testid^="tag-row"]');
  }

  getKeyInput(index: number): Locator {
    return this.dialog.getByPlaceholder('Select a key or type your own').nth(index);
  }

  getValueInput(index: number): Locator {
    return this.dialog.getByPlaceholder('Select a value or type your own').nth(index);
  }

  getDeleteButton(index: number): Locator {
    return this.dialog.getByRole('img', { name: 'Delete' }).nth(index);
  }

  async addTag(key: string, value: string): Promise<void> {
    await this.addTagButton.click();

    const keyInputs = this.dialog.getByPlaceholder('Select a key or type your own');
    const count = await keyInputs.count();
    const newIndex = count - 1;

    const keyInput = this.getKeyInput(newIndex);
    await keyInput.fill(key);
    await keyInput.press('Tab');

    const valueInput = this.getValueInput(newIndex);
    await valueInput.fill(value);
  }

  async deleteTag(index: number): Promise<void> {
    await this.getDeleteButton(index).click();
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    await this.dialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.dialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.dialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async getTagCount(): Promise<number> {
    return await this.dialog.getByPlaceholder('Select a key or type your own').count();
  }

  async isSaveEnabled(): Promise<boolean> {
    return await this.saveButton.isEnabled();
  }

  async expectVisible(): Promise<void> {
    await expect(this.dialog).toBeVisible();
  }

  async expectHidden(): Promise<void> {
    await expect(this.dialog).not.toBeVisible();
  }
}
