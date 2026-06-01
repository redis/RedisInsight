import { Page, Locator, expect } from '@playwright/test';
import { KeyType } from '../../../types';

/**
 * Add Key Dialog component
 */
export class AddKeyDialog {
  readonly page: Page;

  // Dialog container
  readonly container: Locator;
  readonly title: Locator;

  // Form fields
  readonly keyTypeSelect: Locator;
  readonly keyTypeDropdown: Locator;
  readonly keyNameInput: Locator;
  readonly ttlInput: Locator;

  // Hash-specific fields (Field, Value, TTL per field)
  readonly hashFieldInput: Locator;
  readonly hashValueInput: Locator;
  readonly hashTtlInput: Locator;

  // String-specific fields (single Value input)
  readonly stringValueInput: Locator;

  // List-specific fields (Element input)
  readonly listElementInput: Locator;

  // Set-specific fields (Member input)
  readonly setMemberInput: Locator;

  // ZSet-specific fields (Member + Score)
  readonly zsetMemberInput: Locator;
  readonly zsetScoreInput: Locator;

  // Stream-specific fields (Entry ID, Field, Value)
  readonly streamEntryIdInput: Locator;
  readonly streamFieldInput: Locator;
  readonly streamValueInput: Locator;

  // JSON-specific fields (Monaco editor)
  readonly jsonValueInput: Locator;

  // Vector Set–specific fields
  readonly vectorSetPopulateRadio: Locator;
  readonly vectorSetPopulateManual: Locator;
  readonly vectorSetPopulateSample: Locator;
  readonly vectorSetSampleDatasetPreview: Locator;
  readonly vectorSetElementNameInput: Locator;
  readonly vectorSetElementVectorInput: Locator;

  // Action buttons
  readonly addItemButton: Locator;
  readonly removeItemButton: Locator;
  readonly cancelButton: Locator;
  readonly addKeyButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Dialog container (the add key panel)
    this.container = page.getByText('New Key').locator('..');
    this.title = page.getByText('New Key');

    // Form fields - common
    this.keyTypeSelect = page.getByTestId('select-key-type');
    this.keyTypeDropdown = page.locator('[role="listbox"]');
    this.keyNameInput = page.getByPlaceholder('Enter Key Name');
    this.ttlInput = page.getByPlaceholder('No limit');

    // Hash fields - has Field, Value, TTL per field
    this.hashFieldInput = page.getByPlaceholder('Enter Field').first();
    this.hashValueInput = page.getByPlaceholder('Enter Value').first();
    this.hashTtlInput = page.getByPlaceholder('Enter TTL');

    // String fields - single Value textbox (use testid for specificity)
    this.stringValueInput = page.getByTestId('string-value');

    // List fields - Element input
    this.listElementInput = page.getByPlaceholder('Enter Element');

    // Set fields - Member input
    this.setMemberInput = page.getByPlaceholder('Enter Member');

    // ZSet fields - Member + Score
    this.zsetMemberInput = page.getByPlaceholder('Enter Member');
    this.zsetScoreInput = page.getByPlaceholder('Enter Score');

    // Stream fields - Entry ID, Field, Value
    this.streamEntryIdInput = page.getByPlaceholder('Enter Entry ID');
    this.streamFieldInput = page.getByPlaceholder('Enter Field').first();
    this.streamValueInput = page.getByPlaceholder('Enter Value').first();

    // JSON fields - Monaco editor
    this.jsonValueInput = page.locator('[data-testid="json-value"] textarea, .monaco-editor textarea').first();

    // Vector Set fields
    this.vectorSetPopulateRadio = page.getByTestId('add-key-vector-set-populate');
    this.vectorSetPopulateManual = page.getByTestId('add-key-vector-set-populate-manual');
    this.vectorSetPopulateSample = page.getByTestId('add-key-vector-set-populate-sample');
    this.vectorSetSampleDatasetPreview = page.getByTestId('add-key-vector-set-load-sample-dataset');
    // Use .first() — the form renders one row per element and these testids are reused.
    this.vectorSetElementNameInput = page.getByTestId('element-name').first();
    this.vectorSetElementVectorInput = page.getByTestId('element-vector').first();

    // Action buttons - use testid for specificity
    this.addItemButton = page.getByRole('button', { name: /add new item/i });
    this.removeItemButton = page.getByRole('button', { name: /remove item/i });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    // Add Key button has different testids per key type, use submit button type
    this.addKeyButton = page.locator('button[type="submit"][data-testid*="add-key"]');
    this.backButton = page.getByRole('button', { name: 'Back' });
  }

  async isVisible(): Promise<boolean> {
    try {
      await expect(this.title).toBeVisible({ timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  async selectKeyType(type: KeyType): Promise<void> {
    await this.keyTypeSelect.click();
    await this.page.getByRole('option', { name: type, exact: true }).click();
  }

  async fillKeyName(name: string): Promise<void> {
    await this.keyNameInput.fill(name);
  }

  async fillTtl(ttl: string): Promise<void> {
    await this.ttlInput.fill(ttl);
  }

  async clickAddKey(): Promise<void> {
    await expect(this.addKeyButton).toBeEnabled();
    await this.addKeyButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  // Type-specific fill methods
  async fillStringValue(value: string): Promise<void> {
    await this.stringValueInput.fill(value);
  }

  async fillHashField(field: string, value: string): Promise<void> {
    await this.hashFieldInput.fill(field);
    await this.hashValueInput.fill(value);
  }

  async fillListElement(element: string): Promise<void> {
    await this.listElementInput.fill(element);
  }

  async fillSetMember(member: string): Promise<void> {
    await this.setMemberInput.fill(member);
  }

  async fillZSetMember(member: string, score: string): Promise<void> {
    await this.zsetMemberInput.fill(member);
    await this.zsetScoreInput.fill(score);
  }

  async fillStreamField(field: string, value: string): Promise<void> {
    await this.streamFieldInput.fill(field);
    await this.streamValueInput.fill(value);
  }

  async fillJsonValue(value: string): Promise<void> {
    await this.jsonValueInput.fill(value);
  }

  /**
   * Choose Vector Set populate mode. Manual is the default render — toggling
   * to Sample swaps the form for the bundled-dataset preview.
   */
  async selectVectorSetPopulateMode(mode: 'manual' | 'sample'): Promise<void> {
    const target = mode === 'sample' ? this.vectorSetPopulateSample : this.vectorSetPopulateManual;
    await target.click();
  }

  /**
   * Assert that the given Vector Set populate mode is the currently-selected
   * radio option. The card testid wraps a Radix radio control; the active
   * control carries `aria-checked="true"`, so we drill into the role
   * locator and use Playwright's `toBeChecked()`.
   */
  async expectVectorSetPopulateModeSelected(mode: 'manual' | 'sample'): Promise<void> {
    const card = mode === 'sample' ? this.vectorSetPopulateSample : this.vectorSetPopulateManual;
    await expect(card.getByRole('radio')).toBeChecked();
  }

  async fillVectorSetElement(name: string, vector: string): Promise<void> {
    await this.vectorSetElementNameInput.fill(name);
    await this.vectorSetElementVectorInput.fill(vector);
  }

  async clickBack(): Promise<void> {
    await this.backButton.click();
  }

  async expectAddKeyEnabled(): Promise<void> {
    await expect(this.addKeyButton).toBeEnabled();
  }

  async expectAddKeyDisabled(): Promise<void> {
    await expect(this.addKeyButton).toBeDisabled();
  }
}
