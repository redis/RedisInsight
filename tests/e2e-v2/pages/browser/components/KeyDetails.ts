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
  readonly stringEditTextbox: Locator;
  readonly applyEditButton: Locator;
  readonly cancelEditButton: Locator;

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
    this.stringEditTextbox = page.getByPlaceholder('Enter Value');
    this.applyEditButton = page.getByTestId('apply-btn');
    this.cancelEditButton = page.getByTestId('cancel-btn');

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
    // Wait for confirmation dialog and confirm
    await this.page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 });
    await this.page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    // Wait for the key details to close (key was deleted)
    await this.page.getByTestId('key-details-header').waitFor({ state: 'hidden', timeout: 10000 });
  }

  // String methods
  async getStringValue(): Promise<string> {
    await this.stringValue.waitFor({ state: 'visible' });
    return await this.stringValue.innerText();
  }

  async clickEditValue(): Promise<void> {
    await this.editValueButton.click();
  }

  async editStringValue(newValue: string): Promise<void> {
    // Click edit button to enter edit mode
    await this.editValueButton.click();
    // Wait for textbox to appear
    await this.stringEditTextbox.waitFor({ state: 'visible' });
    // Clear and fill new value
    await this.stringEditTextbox.fill(newValue);
    // Click apply
    await this.applyEditButton.click();
    // Wait for edit mode to close (textbox disappears)
    await this.stringEditTextbox.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async cancelStringEdit(): Promise<void> {
    await this.cancelEditButton.click();
    await this.stringEditTextbox.waitFor({ state: 'hidden', timeout: 5000 });
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

  async addHashField(fieldName: string, fieldValue: string): Promise<void> {
    // Click Add Fields button
    await this.page.getByRole('button', { name: 'Add Fields' }).click();
    // Fill in field name and value
    await this.page.getByPlaceholder('Enter Field').fill(fieldName);
    await this.page.getByPlaceholder('Enter Value').fill(fieldValue);
    // Click Save
    await this.page.getByRole('button', { name: 'Save' }).click();
    // Wait for the form to close
    await this.page.getByPlaceholder('Enter Field').waitFor({ state: 'hidden', timeout: 5000 });
  }

  async editHashField(fieldName: string, newValue: string): Promise<void> {
    // Click on the row to show edit button
    const row = this.hashFieldsGrid.locator('[role="row"]').filter({ hasText: fieldName });
    await row.click();
    // Click edit button
    await this.page.getByTestId(`hash_edit-btn-${fieldName}`).click();
    // Fill new value
    await this.page.getByPlaceholder('Enter Value').fill(newValue);
    // Click apply
    await this.page.getByTestId('apply-btn').click();
    // Wait for edit mode to close
    await this.page.getByPlaceholder('Enter Value').waitFor({ state: 'hidden', timeout: 5000 });
  }

  async deleteHashField(fieldName: string): Promise<void> {
    // Find the row with the field name
    const row = this.hashFieldsGrid.locator('[role="row"]').filter({ hasText: fieldName });
    // Click the remove field button in that row
    const removeButton = row.getByRole('button', { name: 'Remove field' });
    await removeButton.click();
    // Confirm deletion in the dialog - use testid for the confirmation button
    await this.page.getByTestId(`remove-hash-button-${fieldName}`).click();
    // Wait for the field to be removed
    await row.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async getHashFieldValue(fieldName: string): Promise<string> {
    const row = this.hashFieldsGrid.locator('[role="row"]').filter({ hasText: fieldName });
    // Value is in the second gridcell
    const valueCell = row.locator('[role="gridcell"]').nth(1);
    return await valueCell.innerText();
  }

  async hashFieldExists(fieldName: string): Promise<boolean> {
    const row = this.hashFieldsGrid.locator('[role="row"]').filter({ hasText: fieldName });
    return (await row.count()) > 0;
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

  async addListElement(element: string, position: 'head' | 'tail' = 'tail'): Promise<void> {
    await this.addElementButton.click();
    // Select position if not default
    if (position === 'head') {
      await this.page.getByRole('combobox').filter({ hasText: 'Push to' }).click();
      await this.page.getByRole('option', { name: 'Push to head' }).click();
    }
    await this.page.getByPlaceholder('Enter Element').fill(element);
    await this.page.getByRole('button', { name: 'Save' }).click();
    // Wait for the form to close
    await this.page.getByPlaceholder('Enter Element').waitFor({ state: 'hidden', timeout: 5000 });
  }

  async editListElement(index: number, newValue: string): Promise<void> {
    // Click on the row to show edit button
    const row = this.listGrid.locator('[role="row"]').filter({ hasText: new RegExp(`^${index}`) });
    await row.click();
    // Click edit button using testid pattern: list_edit-btn-{index}
    await this.page.getByTestId(`list_edit-btn-${index}`).click();
    // Clear and fill new value using testid pattern: list_value-editor-{index}
    const textbox = this.page.getByTestId(`list_value-editor-${index}`);
    await textbox.clear();
    await textbox.fill(newValue);
    // Apply changes using testid: apply-btn
    await this.page.getByTestId('apply-btn').click();
    // Wait for edit mode to close
    await textbox.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async removeListElements(count: number, position: 'head' | 'tail' = 'tail'): Promise<void> {
    await this.removeElementButton.click();
    // Select position if not default
    if (position === 'head') {
      await this.page.getByRole('combobox').filter({ hasText: 'Remove from' }).click();
      await this.page.getByRole('option', { name: 'Remove from head' }).click();
    }
    const countInput = this.page.getByPlaceholder('Enter Count*');
    await countInput.fill(count.toString());
    // Wait for the Remove button to be enabled and click it
    const removeBtn = this.page.getByTestId('remove-elements-btn');
    await removeBtn.waitFor({ state: 'visible' });
    await expect(removeBtn).toBeEnabled({ timeout: 5000 });
    await removeBtn.click();
    // Confirm in the dialog
    const confirmBtn = this.page.getByTestId('remove-submit');
    await confirmBtn.waitFor({ state: 'visible' });
    await confirmBtn.click();
    // Wait for the form to close
    await countInput.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async getListElementByIndex(index: number): Promise<string> {
    const row = this.listGrid.locator('[role="row"]').filter({ hasText: new RegExp(`^${index}`) });
    const valueCell = row.locator('[role="gridcell"]').nth(1);
    return await valueCell.innerText();
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

  async addSetMember(member: string): Promise<void> {
    await this.addMembersButton.click();
    const memberInput = this.page.getByTestId('member-name');
    await memberInput.fill(member);
    await this.page.getByTestId('save-members-btn').click();
    // Wait for the form to close
    await memberInput.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async removeSetMember(member: string): Promise<void> {
    const removeBtn = this.page.getByTestId(`set-remove-btn-${member}-icon`);
    await removeBtn.click();
    // Confirm in the dialog - the confirm button has the same testid without -icon
    const confirmBtn = this.page.getByTestId(`set-remove-btn-${member}`);
    await confirmBtn.waitFor({ state: 'visible' });
    await confirmBtn.click();
    // Wait for the dialog to close
    await confirmBtn.waitFor({ state: 'hidden', timeout: 5000 });
    // Wait for the row to be removed from the grid
    await this.page.getByTestId(`set-remove-btn-${member}-icon`).waitFor({ state: 'hidden', timeout: 5000 });
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

  async addZSetMember(member: string, score: string): Promise<void> {
    await this.addMembersButton.click();
    const memberInput = this.page.getByTestId('member-name');
    const scoreInput = this.page.getByTestId('member-score');
    await memberInput.fill(member);
    await scoreInput.fill(score);
    await this.page.getByTestId('save-members-btn').click();
    // Wait for the form to close
    await memberInput.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async removeZSetMember(member: string): Promise<void> {
    const removeBtn = this.page.getByTestId(`zset-remove-button-${member}-icon`);
    await removeBtn.click();
    // Confirm in the dialog - the confirm button has the same testid without -icon
    const confirmBtn = this.page.getByTestId(`zset-remove-button-${member}`);
    await confirmBtn.waitFor({ state: 'visible' });
    await confirmBtn.click();
    // Wait for the dialog to close
    await confirmBtn.waitFor({ state: 'hidden', timeout: 5000 });
    // Wait for the row to be removed from the grid
    await this.page.getByTestId(`zset-remove-button-${member}-icon`).waitFor({ state: 'hidden', timeout: 5000 });
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

  async addStreamEntry(fieldName: string, fieldValue: string): Promise<string> {
    await this.newEntryButton.click();
    // Entry ID is auto-generated with '*', just fill field and value
    const fieldInput = this.page.getByTestId('field-name');
    const valueInput = this.page.getByTestId('field-value');
    await fieldInput.fill(fieldName);
    await valueInput.fill(fieldValue);
    await this.page.getByTestId('save-elements-btn').click();
    // Wait for the form to close
    await fieldInput.waitFor({ state: 'hidden', timeout: 5000 });
    // Return the entry ID (we can't know it in advance since it's auto-generated)
    return '*';
  }

  async removeStreamEntry(entryId: string): Promise<void> {
    const removeBtn = this.page.getByTestId(`remove-entry-button-${entryId}-icon`);
    await removeBtn.click();
    // Confirm in the dialog
    const confirmBtn = this.page.getByTestId(`remove-entry-button-${entryId}`);
    await confirmBtn.waitFor({ state: 'visible' });
    await confirmBtn.click();
    // Wait for the dialog to close
    await confirmBtn.waitFor({ state: 'hidden', timeout: 5000 });
    // Wait for the entry to be removed
    await this.page.getByTestId(`remove-entry-button-${entryId}-icon`).waitFor({ state: 'hidden', timeout: 5000 });
  }

  async getStreamEntryIds(): Promise<string[]> {
    // Get all entry IDs from the stream
    const entries = this.page.locator('[data-testid^="stream-entry-"][data-testid$="-date"]');
    const count = await entries.count();
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      const testid = await entries.nth(i).getAttribute('data-testid');
      if (testid) {
        // Extract entry ID from testid like "stream-entry-1747742800051-0-date"
        const match = testid.match(/stream-entry-(.+)-date/);
        if (match) {
          ids.push(match[1]);
        }
      }
    }
    return ids;
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

  async addJsonField(key: string, value: string): Promise<void> {
    // Get initial count before adding
    const initialCount = await this.page.getByTestId('json-scalar-value').count();

    await this.addJsonFieldButton.click();
    const keyInput = this.page.getByTestId('json-key');
    const valueInput = this.page.getByTestId('json-value');
    await keyInput.waitFor({ state: 'visible' });
    await keyInput.fill(key);
    await valueInput.fill(value);
    await this.page.getByTestId('apply-btn').click();

    // Wait for the new field to appear (count should increase)
    await this.page.waitForFunction(
      (expectedCount) => {
        const elements = document.querySelectorAll('[data-testid="json-scalar-value"]');
        return elements.length > expectedCount;
      },
      initialCount,
      { timeout: 5000 },
    );
  }

  async removeJsonField(): Promise<void> {
    // Click the first remove button
    const removeBtn = this.page.getByTestId('remove-icon').first();
    await removeBtn.click();
    // Confirm in the dialog
    const confirmBtn = this.page.getByTestId('json-remove-btn');
    await confirmBtn.waitFor({ state: 'visible' });
    await confirmBtn.click();
    // Wait for the dialog to close
    await confirmBtn.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async getJsonFieldCount(): Promise<number> {
    // Count the number of JSON scalar values
    const fields = this.page.getByTestId('json-scalar-value');
    return await fields.count();
  }
}

