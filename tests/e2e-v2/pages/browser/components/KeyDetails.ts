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
  readonly removeElementButton: Locator;
  readonly listGrid: Locator;

  // Set-specific
  readonly addMembersButton: Locator;
  readonly setGrid: Locator;

  // ZSet-specific (Sorted Set)
  readonly zsetGrid: Locator;
  readonly scoreSortButton: Locator;

  // Stream-specific
  readonly newEntryButton: Locator;
  readonly streamDataTab: Locator;
  readonly consumerGroupsTab: Locator;
  readonly streamEntries: Locator;

  // JSON-specific
  readonly jsonContent: Locator;
  readonly addJsonFieldButton: Locator;
  readonly changeEditorTypeButton: Locator;

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
    this.removeElementButton = page.getByRole('button', { name: 'Remove Elements' });
    this.listGrid = page.getByTestId('list-details');

    // Set-specific
    this.addMembersButton = page.getByRole('button', { name: 'Add Members' });
    this.setGrid = page.getByTestId('set-details');

    // ZSet-specific (Sorted Set)
    this.zsetGrid = page.getByTestId('zset-details');
    this.scoreSortButton = page.getByRole('button', { name: /Score/ });

    // Stream-specific
    this.newEntryButton = page.getByRole('button', { name: 'New Entry' });
    this.streamDataTab = page.getByRole('tab', { name: 'Stream Data' });
    this.consumerGroupsTab = page.getByRole('tab', { name: 'Consumer Groups' });
    this.streamEntries = page.locator('[data-testid="stream-entries-container"]');

    // JSON-specific
    this.jsonContent = page.getByTestId('json-details');
    this.addJsonFieldButton = page.getByRole('button', { name: 'Add field' });
    this.changeEditorTypeButton = page.getByRole('button', { name: 'Change editor type' });
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

  // List methods
  async getListElementCount(): Promise<number> {
    // Wait for the grid to be visible
    await this.listGrid.waitFor({ state: 'visible' });
    // Get rows from the data rowgroup (not header)
    const rows = this.listGrid.locator('[role="row"]').filter({ hasNot: this.page.locator('[role="columnheader"]') });
    return await rows.count();
  }

  async getListElements(): Promise<string[]> {
    await this.listGrid.waitFor({ state: 'visible' });
    const rows = this.listGrid.locator('[role="row"]').filter({ hasNot: this.page.locator('[role="columnheader"]') });
    const count = await rows.count();
    const elements: string[] = [];
    for (let i = 0; i < count; i++) {
      const element = await rows.nth(i).locator('[role="gridcell"]').nth(1).innerText();
      elements.push(element);
    }
    return elements;
  }

  async clickAddElements(): Promise<void> {
    await this.addElementButton.click();
  }

  async clickRemoveElements(): Promise<void> {
    await this.removeElementButton.click();
  }

  // Set methods
  async getSetMemberCount(): Promise<number> {
    await this.setGrid.waitFor({ state: 'visible' });
    const rows = this.setGrid.locator('[role="row"]').filter({ hasNot: this.page.locator('[role="columnheader"]') });
    return await rows.count();
  }

  async getSetMembers(): Promise<string[]> {
    await this.setGrid.waitFor({ state: 'visible' });
    const rows = this.setGrid.locator('[role="row"]').filter({ hasNot: this.page.locator('[role="columnheader"]') });
    const count = await rows.count();
    const members: string[] = [];
    for (let i = 0; i < count; i++) {
      const member = await rows.nth(i).locator('[role="gridcell"]').first().innerText();
      members.push(member);
    }
    return members;
  }

  async clickAddMembers(): Promise<void> {
    await this.addMembersButton.click();
  }

  // ZSet (Sorted Set) methods
  async getZSetMemberCount(): Promise<number> {
    await this.zsetGrid.waitFor({ state: 'visible' });
    const rows = this.zsetGrid.locator('[role="row"]').filter({ hasNot: this.page.locator('[role="columnheader"]') });
    return await rows.count();
  }

  async getZSetMembers(): Promise<Array<{ member: string; score: string }>> {
    await this.zsetGrid.waitFor({ state: 'visible' });
    const rows = this.zsetGrid.locator('[role="row"]').filter({ hasNot: this.page.locator('[role="columnheader"]') });
    const count = await rows.count();
    const members: Array<{ member: string; score: string }> = [];
    for (let i = 0; i < count; i++) {
      const member = await rows.nth(i).locator('[role="gridcell"]').nth(0).innerText();
      const score = await rows.nth(i).locator('[role="gridcell"]').nth(1).innerText();
      members.push({ member, score });
    }
    return members;
  }

  async clickSortByScore(): Promise<void> {
    await this.scoreSortButton.click();
  }

  // Stream methods
  async getStreamEntryCount(): Promise<number> {
    // Stream entries are displayed differently - look for entry ID elements
    const entries = this.page.locator('[role="button"]').filter({ hasText: /Entry ID/ });
    return await entries.count();
  }

  async clickNewEntry(): Promise<void> {
    await this.newEntryButton.click();
  }

  async clickStreamDataTab(): Promise<void> {
    await this.streamDataTab.click();
  }

  async clickConsumerGroupsTab(): Promise<void> {
    await this.consumerGroupsTab.click();
  }

  async isStreamDataTabSelected(): Promise<boolean> {
    const selected = await this.streamDataTab.getAttribute('aria-selected');
    return selected === 'true';
  }

  async isConsumerGroupsTabSelected(): Promise<boolean> {
    const selected = await this.consumerGroupsTab.getAttribute('aria-selected');
    return selected === 'true';
  }

  // JSON methods
  async isJsonContentVisible(): Promise<boolean> {
    // JSON content is displayed in the json-details container
    try {
      await this.jsonContent.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickAddJsonField(): Promise<void> {
    await this.addJsonFieldButton.click();
  }

  async clickChangeEditorType(): Promise<void> {
    await this.changeEditorTypeButton.click();
  }

  async getJsonEditButtons(): Promise<number> {
    const editButtons = this.page.getByRole('button', { name: 'Edit field' });
    return await editButtons.count();
  }

  async getJsonRemoveButtons(): Promise<number> {
    const removeButtons = this.page.getByRole('button', { name: 'Remove field' });
    return await removeButtons.count();
  }
}

