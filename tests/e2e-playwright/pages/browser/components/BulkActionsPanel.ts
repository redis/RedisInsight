import { Page, Locator, expect } from '@playwright/test';

/**
 * Bulk Actions Panel component - for bulk delete and upload operations
 */
export class BulkActionsPanel {
  readonly page: Page;

  // Panel elements
  readonly openButton: Locator;
  readonly closeButton: Locator;
  readonly content: Locator;

  // Tabs
  readonly deleteKeysTab: Locator;
  readonly uploadDataTab: Locator;

  // Delete Keys elements
  readonly deleteButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelButton: Locator;
  readonly deleteSummary: Locator;
  readonly deleteCompletedSummary: Locator;
  readonly deleteInfo: Locator;
  readonly downloadReportCheckbox: Locator;
  readonly statusCompleted: Locator;

  // Upload Data elements
  readonly fileInput: Locator;
  readonly uploadContainer: Locator;
  readonly uploadButton: Locator;
  readonly uploadStatusCompleted: Locator;
  readonly uploadSummary: Locator;

  constructor(page: Page) {
    this.page = page;

    // Panel elements
    this.openButton = page.getByTestId('btn-bulk-actions');
    this.closeButton = page.getByTestId('bulk-close-panel');
    this.content = page.getByTestId('bulk-actions-content');

    // Tabs
    this.deleteKeysTab = page.getByRole('tab', { name: 'Delete Keys' });
    this.uploadDataTab = page.getByRole('tab', { name: 'Upload Data' });

    // Delete Keys elements
    this.deleteButton = page.getByTestId('bulk-action-warning-btn');
    this.confirmDeleteButton = page.getByTestId('bulk-action-apply-btn');
    this.cancelButton = page.getByTestId('bulk-action-cancel-btn');
    this.deleteSummary = page.getByTestId('bulk-delete-summary');
    this.deleteCompletedSummary = page.getByTestId('bulk-delete-completed-summary');
    this.deleteInfo = page.getByTestId('bulk-actions-info');
    this.downloadReportCheckbox = page.getByRole('checkbox', { name: 'Download report' });
    this.statusCompleted = page.getByTestId('bulk-status-completed');

    // Upload Data elements
    this.fileInput = page.getByTestId('bulk-upload-file-input');
    this.uploadContainer = page.getByTestId('bulk-upload-container');
    this.uploadButton = page.getByTestId('bulk-action-warning-btn');
    this.uploadStatusCompleted = page.getByTestId('bulk-status-completed');
    this.uploadSummary = page.getByTestId('bulk-upload-completed-summary');
  }

  async open(): Promise<void> {
    await this.openButton.click();
    await this.content.waitFor({ state: 'visible', timeout: 5000 });
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.content.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async isOpen(): Promise<boolean> {
    try {
      await this.content.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  async selectDeleteKeysTab(): Promise<void> {
    await this.deleteKeysTab.click();
    await expect(this.deleteKeysTab).toHaveAttribute('aria-selected', 'true');
  }

  async selectUploadDataTab(): Promise<void> {
    await this.uploadDataTab.click();
    await expect(this.uploadDataTab).toHaveAttribute('aria-selected', 'true');
  }

  async getDeleteSummary(): Promise<string> {
    return await this.deleteSummary.innerText();
  }

  async clickDelete(): Promise<void> {
    await this.deleteButton.click();
  }

  async confirmDelete(): Promise<void> {
    await this.confirmDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.confirmDeleteButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async waitForDeleteComplete(): Promise<void> {
    // Wait for the status completed message to appear
    await this.statusCompleted.waitFor({ state: 'visible', timeout: 30000 });
  }

  async performBulkDelete(): Promise<void> {
    await this.clickDelete();
    await this.confirmDelete();
    await this.waitForDeleteComplete();
  }

  async getExpectedKeyCount(): Promise<number> {
    // The expected key count is shown in the bulk delete summary area
    // Format: "Expected amount: X keys" or "Expected amount: ~X keys"
    const expectedText = await this.page.getByText(/Expected amount:/i).textContent();
    if (!expectedText) return 0;
    const match = expectedText.match(/Expected amount:\s*~?(\d[\d\s]*)\s*keys/i);
    if (!match) return 0;
    // Remove spaces from number (e.g., "1 000" -> "1000")
    return parseInt(match[1].replace(/\s/g, ''), 10);
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.selectUploadDataTab();
    await this.fileInput.setInputFiles(filePath);
  }

  async clickUpload(): Promise<void> {
    await this.uploadButton.click();
  }

  async confirmUpload(): Promise<void> {
    // Same confirmation button as delete
    await this.confirmDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.confirmDeleteButton.click();
  }

  async waitForUploadComplete(): Promise<void> {
    // Wait for the "Action completed" message to appear
    await this.page.getByText('Action completed').waitFor({ state: 'visible', timeout: 30000 });
  }

  async performBulkUpload(filePath: string): Promise<void> {
    // Select upload tab and upload file
    await this.uploadFile(filePath);
    await this.clickUpload();
    await this.confirmUpload();
    await this.waitForUploadComplete();
  }
}

