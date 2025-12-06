import { Page, Locator, expect } from '@playwright/test';

/**
 * Component Page Object for the Import Database Dialog
 * Handles importing databases from JSON file
 */
export class ImportDatabaseDialog {
  readonly page: Page;
  readonly dialog: Locator;
  readonly filePicker: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly backButton: Locator;
  readonly okButton: Locator;
  readonly successAccordion: Locator;
  readonly failedAccordion: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog', { name: /import from file/i });
    this.filePicker = page.getByTestId('import-file-modal-filepicker');
    this.submitButton = page.getByTestId('btn-submit');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.closeButton = page.getByTestId('btn-close');
    this.backButton = page.getByRole('button', { name: 'back' });
    this.okButton = page.getByRole('button', { name: 'OK' });
    this.successAccordion = page.getByTestId(/ri-accordion-header-success-results/);
    this.failedAccordion = page.getByTestId(/ri-accordion-header-failed-results/);
  }

  /**
   * Check if dialog is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.dialog.isVisible();
  }

  /**
   * Upload a file to the import dialog
   */
  async uploadFile(filePath: string): Promise<void> {
    // Click to open file chooser
    const [fileChooser] = await Promise.all([this.page.waitForEvent('filechooser'), this.filePicker.click()]);
    await fileChooser.setFiles(filePath);
  }

  /**
   * Submit the import
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Cancel the import
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Close the dialog
   */
  async close(): Promise<void> {
    if (await this.okButton.isVisible()) {
      await this.okButton.click();
    } else if (await this.closeButton.isVisible()) {
      await this.closeButton.click();
    }
  }

  /**
   * Go back to main add database dialog
   */
  async goBack(): Promise<void> {
    await this.backButton.click();
  }

  /**
   * Get the number of successfully imported databases
   */
  async getSuccessCount(): Promise<number> {
    if (!(await this.successAccordion.isVisible())) {
      return 0;
    }
    const text = (await this.successAccordion.textContent()) || '';
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get the number of failed imports
   */
  async getFailedCount(): Promise<number> {
    if (!(await this.failedAccordion.isVisible())) {
      return 0;
    }
    const text = (await this.failedAccordion.textContent()) || '';
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Expand success results
   */
  async expandSuccessResults(): Promise<void> {
    await this.successAccordion.click();
  }

  /**
   * Expand failed results
   */
  async expandFailedResults(): Promise<void> {
    await this.failedAccordion.click();
  }

  /**
   * Import a file - full flow
   */
  async importFile(filePath: string): Promise<{ success: number; failed: number }> {
    await this.uploadFile(filePath);
    await this.submit();
    // Wait for results
    await expect(this.okButton).toBeVisible({ timeout: 30000 });
    const success = await this.getSuccessCount();
    const failed = await this.getFailedCount();
    await this.close();
    return { success, failed };
  }
}
