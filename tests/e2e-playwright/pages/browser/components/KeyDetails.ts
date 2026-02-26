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
  readonly ttlValue: Locator;
  readonly ttlEditInput: Locator;
  readonly ttlApplyButton: Locator;
  readonly ttlCancelButton: Locator;

  // Actions
  readonly deleteKeyButton: Locator;
  readonly autoRefreshButton: Locator;
  readonly backButton: Locator;
  readonly closeKeyButton: Locator;
  readonly copyKeyNameButton: Locator;

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
  readonly newGroupButton: Locator;
  readonly consumerGroupsGrid: Locator;
  readonly noConsumerGroupsMessage: Locator;

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
    // TTL value - displayed as "TTL:No limit" or "TTL:60" etc.
    this.ttlValue = page.getByTestId('key-ttl-text');
    // TTL edit controls
    this.ttlEditInput = page.getByRole('textbox', { name: /no limit/i });
    this.ttlApplyButton = page.getByRole('button', { name: 'Apply' });
    this.ttlCancelButton = page.getByRole('button', { name: 'Cancel editing' });

    // Actions - Back button closes the panel (when key list is collapsed)
    // Close key button closes the panel (when key list is visible)
    this.deleteKeyButton = page.getByTestId('delete-key-btn');
    this.autoRefreshButton = page.getByTestId('key-auto-refresh-config-btn');
    this.backButton = page.getByTestId('back-right-panel-btn');
    this.closeKeyButton = page.getByTestId('close-key-btn');
    this.copyKeyNameButton = page.getByRole('button', { name: 'Copy Key Name' });

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
    this.newGroupButton = page.getByRole('button', { name: 'New Group' });
    this.consumerGroupsGrid = page.locator('grid').filter({ hasText: /Group Name/ });
    this.noConsumerGroupsMessage = page.getByText('Your Key has no Consumer Groups available.');

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

  async renameKey(newKeyName: string): Promise<void> {
    // Click on the key name to enter edit mode
    await this.keyName.click();
    // Wait for the edit input to appear
    const keyNameInput = this.page.getByRole('textbox', { name: 'Enter Key Name' });
    await keyNameInput.waitFor({ state: 'visible' });
    // Clear and fill the new key name
    await keyNameInput.clear();
    await keyNameInput.fill(newKeyName);
    // Click Apply button
    const applyButton = this.page.getByRole('button', { name: 'Apply' });
    await applyButton.click();
    // Wait for the edit mode to close
    await keyNameInput.waitFor({ state: 'hidden', timeout: 5000 });
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

  async copyKeyName(): Promise<void> {
    // Hover over the key name to reveal the copy button
    await this.keyName.hover();
    // Wait for the copy button to appear and click it
    await this.copyKeyNameButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.copyKeyNameButton.click();
  }

  async isCopyKeyNameButtonVisible(): Promise<boolean> {
    // Hover over the key name to reveal the copy button
    await this.keyName.hover();
    try {
      await this.copyKeyNameButton.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  async getTtlValue(): Promise<string> {
    await this.ttlValue.waitFor({ state: 'visible' });
    return await this.ttlValue.innerText();
  }

  async editTtl(ttlSeconds: string): Promise<void> {
    // Click on TTL to open edit mode
    await this.ttlValue.click();
    // Wait for the edit input to appear - use the textbox with "No limit" placeholder
    const ttlInput = this.page.getByRole('textbox', { name: /no limit/i });
    await ttlInput.waitFor({ state: 'visible' });
    // Clear and fill the new TTL value
    await ttlInput.clear();
    await ttlInput.fill(ttlSeconds);
    // Click Apply button
    await this.ttlApplyButton.click();
    // Wait for the edit mode to close
    await ttlInput.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async getValueFormat(): Promise<string> {
    await this.formatDropdown.waitFor({ state: 'visible', timeout: 10000 });
    // Click on format dropdown to open it and see the selected value
    await this.formatDropdown.click();
    // Find the selected option (it will have aria-selected="true")
    const selectedOption = this.page.locator('[role="option"][aria-selected="true"]');
    await selectedOption.waitFor({ state: 'visible' });
    const format = await selectedOption.innerText();
    // Close the dropdown by pressing Escape
    await this.page.keyboard.press('Escape');
    return format;
  }

  async changeValueFormat(format: string): Promise<void> {
    // Click on format dropdown to open it
    await this.formatDropdown.click();
    // Wait for dropdown options to appear and click the desired format
    const option = this.page.getByRole('option', { name: format });
    await option.waitFor({ state: 'visible' });
    await option.click();
    // Wait for dropdown to close
    await option.waitFor({ state: 'hidden', timeout: 5000 });
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
    // Look for the field in gridcells (data cells), not in header rows
    const fieldCell = this.hashFieldsGrid.locator('[role="gridcell"]').filter({ hasText: fieldName });
    return (await fieldCell.count()) > 0;
  }

  async searchHashFields(searchTerm: string): Promise<void> {
    // Click the search button to open search input
    await this.page.getByTestId('search-button').click();
    // Fill the search input
    const searchInput = this.page.getByTestId('search');
    await searchInput.fill(searchTerm);
    await searchInput.press('Enter');
  }

  async clearHashFieldSearch(): Promise<void> {
    // Click the reset button inside the hash details grid to clear search
    // The reset button is inside the search input container in the grid header
    const resetButton = this.hashFieldsGrid.locator('button[title="Reset"]');
    if (await resetButton.isVisible()) {
      await resetButton.click();
    }
  }

  async isNoResultsMessageVisible(): Promise<boolean> {
    const noResults = this.page.getByText('No results found.');
    return await noResults.isVisible();
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

  async listElementExists(elementValue: string): Promise<boolean> {
    // Look for the element in gridcells (data cells), not in header rows
    const elementCell = this.listGrid.locator('[role="gridcell"]').filter({ hasText: elementValue });
    return (await elementCell.count()) > 0;
  }

  async searchListByIndex(index: string): Promise<void> {
    // Click the search button to open search input
    const searchButton = this.listGrid.getByRole('button', { name: 'Search index' });
    await searchButton.click();
    // Fill the search input
    const searchInput = this.listGrid.getByPlaceholder('Search');
    await searchInput.fill(index);
    await searchInput.press('Enter');
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

  async setMemberExists(memberName: string): Promise<boolean> {
    // Look for the member in gridcells (data cells), not in header rows
    const memberCell = this.setGrid.locator('[role="gridcell"]').filter({ hasText: memberName });
    return (await memberCell.count()) > 0;
  }

  async searchSetMembers(searchTerm: string): Promise<void> {
    // For Set, the search input is always visible in the header
    const searchInput = this.setGrid.getByPlaceholder('Search');
    await searchInput.fill(searchTerm);
    await searchInput.press('Enter');
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

  async editZSetMemberScore(rowIndex: number, newScore: string): Promise<void> {
    // Click on the score cell to show edit button
    const rows = this.zsetGrid.locator('[role="row"]').filter({ hasNot: this.page.locator('[role="columnheader"]') });
    const row = rows.nth(rowIndex);
    const scoreCell = row.locator('[role="gridcell"]').nth(1);
    await scoreCell.click();
    // Wait for edit button to appear and click it
    const editButton = this.page.getByRole('button', { name: 'Edit field' });
    await editButton.waitFor({ state: 'visible', timeout: 5000 });
    await editButton.click();
    // Fill new score in the textbox
    const scoreInput = this.page.getByPlaceholder('Enter Score');
    await scoreInput.waitFor({ state: 'visible', timeout: 5000 });
    await scoreInput.clear();
    await scoreInput.fill(newScore);
    // Apply changes
    await this.page.getByTestId('apply-btn').click();
    // Wait for edit mode to close
    await scoreInput.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async getZSetMemberScore(rowIndex: number): Promise<string> {
    const rows = this.zsetGrid.locator('[role="row"]').filter({ hasNot: this.page.locator('[role="columnheader"]') });
    const row = rows.nth(rowIndex);
    const scoreCell = row.locator('[role="gridcell"]').nth(1);
    return await scoreCell.innerText();
  }

  async zsetMemberExists(memberName: string): Promise<boolean> {
    // Look for the member in gridcells (data cells), not in header rows
    const memberCell = this.zsetGrid.locator('[role="gridcell"]').filter({ hasText: memberName });
    return (await memberCell.count()) > 0;
  }

  async searchZSetMembers(searchTerm: string): Promise<void> {
    // Click the search button to open search input
    const searchButton = this.zsetGrid.getByRole('button', { name: 'Search name' });
    await searchButton.click();
    // Fill the search input
    const searchInput = this.zsetGrid.getByPlaceholder('Search');
    await searchInput.fill(searchTerm);
    await searchInput.press('Enter');
  }

  async toggleZSetSortOrder(): Promise<void> {
    // Click the sort button in the Score column header
    const sortButton = this.page.getByTestId('header-sorting-button');
    await sortButton.click();
  }

  async getZSetSortOrder(): Promise<'asc' | 'desc'> {
    // Check if the sort button shows Arrow Up (ascending) or Arrow Down (descending)
    const arrowUp = this.zsetGrid.getByRole('button', { name: 'Arrow Up' });
    if (await arrowUp.isVisible()) {
      return 'asc';
    }
    return 'desc';
  }

  async getZSetScores(): Promise<string[]> {
    await this.zsetGrid.waitFor({ state: 'visible' });
    const rows = this.zsetGrid.locator('[role="row"]').filter({ hasNot: this.page.locator('[role="columnheader"]') });
    const count = await rows.count();
    const scores: string[] = [];
    for (let i = 0; i < count; i++) {
      const score = await rows.nth(i).locator('[role="gridcell"]').nth(1).innerText();
      scores.push(score);
    }
    return scores;
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

  // Consumer Group methods
  async clickNewGroup(): Promise<void> {
    await this.newGroupButton.click();
  }

  async addConsumerGroup(groupName: string, id: string = '$'): Promise<void> {
    await this.consumerGroupsTab.click();
    await this.newGroupButton.click();
    // Fill in the group name
    const groupNameInput = this.page.getByPlaceholder('Enter Group Name*');
    await groupNameInput.waitFor({ state: 'visible' });
    await groupNameInput.fill(groupName);
    // Fill in the ID (default is $)
    const idInput = this.page.getByPlaceholder('ID*');
    await idInput.clear();
    await idInput.fill(id);
    // Click Save
    await this.page.getByRole('button', { name: 'Save' }).click();
    // Wait for the form to close
    await groupNameInput.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async getConsumerGroupCount(): Promise<number> {
    // Count rows in the consumer groups grid (excluding header)
    const rows = this.page.locator('[role="row"]').filter({ hasText: /^\d+$/ });
    return await rows.count();
  }

  async isConsumerGroupVisible(groupName: string): Promise<boolean> {
    // Look for the group name in a gridcell
    const groupCell = this.page.getByRole('gridcell', { name: groupName });
    try {
      await groupCell.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async isNoConsumerGroupsMessageVisible(): Promise<boolean> {
    try {
      await this.noConsumerGroupsMessage.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickConsumerGroup(groupName: string): Promise<void> {
    const groupRow = this.page.getByRole('row', { name: new RegExp(groupName) });
    await groupRow.click();
  }

  async getConsumerGroupNames(): Promise<string[]> {
    // Get all group names from the consumer groups grid
    const groupCells = this.page.locator('[role="gridcell"]').filter({ hasText: /^[a-zA-Z0-9_-]+$/ });
    const count = await groupCells.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await groupCells.nth(i).innerText();
      if (text && !text.match(/^\d+$/)) {
        names.push(text);
      }
    }
    return names;
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
    const removeBtn = this.page.getByRole('button', { name: 'Remove field' }).first();
    await removeBtn.click();
    // Confirm in the dialog - the button is labeled "Remove"
    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    const confirmBtn = dialog.getByRole('button', { name: 'Remove' });
    await confirmBtn.click();
    // Wait for the dialog to close
    await dialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async getJsonFieldCount(): Promise<number> {
    // Count the number of JSON scalar values
    const fields = this.page.getByTestId('json-scalar-value');
    return await fields.count();
  }

  async editJsonValue(fieldIndex: number, newValue: string): Promise<void> {
    // Click on the JSON scalar value to enter edit mode
    const scalarValues = this.page.getByTestId('json-scalar-value');
    const targetValue = scalarValues.nth(fieldIndex);
    await targetValue.click();
    // Fill new value in the textbox
    const valueInput = this.page.getByPlaceholder('Enter JSON value');
    await valueInput.waitFor({ state: 'visible', timeout: 5000 });
    await valueInput.clear();
    await valueInput.fill(newValue);
    // Apply changes
    await this.page.getByTestId('apply-btn').click();
    // Wait for edit mode to close
    await valueInput.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async getJsonValue(fieldIndex: number): Promise<string> {
    const scalarValues = this.page.getByTestId('json-scalar-value');
    const targetValue = scalarValues.nth(fieldIndex);
    return await targetValue.innerText();
  }
}
