import { Page, Locator, expect } from '@playwright/test';

/**
 * Key Details component - displays details for a selected key
 * Used for viewing/editing String, Hash, List, Set, ZSet, Stream, JSON keys
 */
export class KeyDetails {
  readonly page: Page;

  // Container - the right panel showing key details
  readonly container: Locator;

  // Header elements
  readonly keyType: Locator;
  readonly keyName: Locator;
  readonly keyInfo: Locator;

  // Actions
  readonly deleteKeyButton: Locator;
  readonly autoRefreshButton: Locator;
  readonly backButton: Locator;
  readonly closeKeyButton: Locator;

  // Format dropdown
  readonly formatDropdown: Locator;

  // String-specific
  readonly stringValue: Locator;
  readonly editValueButton: Locator;

  // Hash-specific
  readonly addFieldsButton: Locator;
  readonly hashFieldsGrid: Locator;

  // List-specific
  readonly addElementButton: Locator;

  // Set-specific
  readonly addMembersButton: Locator;

  // JSON-specific
  readonly jsonContent: Locator;

  constructor(page: Page) {
    this.page = page;

    // Container - the key details panel (right side)
    this.container = page.getByTestId('key-details-header').locator('..').locator('..');

    // Header - key info
    // Key type badge: data-testid="badge-string_" or "badge-hash_" etc.
    this.keyType = page.getByTestId('key-details-header').locator('p').first();
    // Key name is in the second paragraph in the header
    this.keyName = page.getByTestId('key-details-header').locator('p').nth(1);
    // Key info (size, length, ttl)
    this.keyInfo = page.getByTestId('key-size-text');

    // Actions - Back button closes the panel (when key list is collapsed)
    // Close key button closes the panel (when key list is visible)
    this.deleteKeyButton = page.getByTestId('delete-key-btn');
    this.autoRefreshButton = page.getByTestId('key-auto-refresh-config-btn');
    this.backButton = page.getByTestId('back-right-panel-btn');
    this.closeKeyButton = page.getByTestId('close-key-btn');

    // Format dropdown
    this.formatDropdown = page.getByTestId('select-format-key-value');

    // String-specific
    this.stringValue = page.getByTestId('string-value');
    this.editValueButton = page.getByTestId('edit-key-value-btn');

    // Hash-specific
    this.addFieldsButton = page.getByRole('button', { name: 'Add Fields' });
    this.hashFieldsGrid = page.getByTestId('hash-details');

    // List-specific
    this.addElementButton = page.getByRole('button', { name: 'Add Elements' });

    // Set-specific
    this.addMembersButton = page.getByRole('button', { name: 'Add Members' });

    // JSON-specific
    this.jsonContent = page.getByTestId('json-details');
  }

  async isVisible(): Promise<boolean> {
    try {
      // Check if key details panel is visible by looking for key name
      await this.page.getByTestId('key-details-header').waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async waitForKeyDetails(): Promise<void> {
    await this.page.getByTestId('key-details-header').waitFor({ state: 'visible' });
  }

  async getKeyType(): Promise<string> {
    return await this.keyType.innerText();
  }

  async getKeyName(): Promise<string> {
    return await this.keyName.innerText();
  }

  async close(): Promise<void> {
    // Try to click the back button first (when key list is collapsed)
    // If not visible, click the close key button (when key list is visible)
    const backButtonVisible = await this.backButton.isVisible();
    if (backButtonVisible) {
      await this.backButton.click();
    } else {
      await this.closeKeyButton.click();
    }
  }

  async deleteKey(): Promise<void> {
    await this.deleteKeyButton.click();
  }

  // String methods
  async getStringValue(): Promise<string> {
    await this.stringValue.waitFor({ state: 'visible' });
    return await this.stringValue.innerText();
  }

  async clickEditValue(): Promise<void> {
    await this.editValueButton.click();
  }

  // Hash methods
  async getHashFieldCount(): Promise<number> {
    const rows = this.hashFieldsGrid.locator('[role="row"]');
    // Subtract 1 for header row
    return (await rows.count()) - 1;
  }

  async clickAddFields(): Promise<void> {
    await this.addFieldsButton.click();
  }
}

