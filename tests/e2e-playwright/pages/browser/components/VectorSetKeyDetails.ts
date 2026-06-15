import { Page, Locator, expect } from '@playwright/test';

export class VectorSetKeyDetails {
  readonly page: Page;

  readonly elementsTable: Locator;
  readonly elementsTableInner: Locator;
  readonly previewSummary: Locator;

  readonly addElementsButton: Locator;
  readonly saveElementsButton: Locator;
  readonly cancelElementsButton: Locator;
  readonly elementNameInput: Locator;
  readonly elementVectorInput: Locator;

  readonly similaritySearchForm: Locator;
  readonly similarityModeVectorButton: Locator;
  readonly similarityModeElementButton: Locator;
  readonly similarityVectorInput: Locator;
  readonly similarityElementInput: Locator;
  readonly similaritySubmitButton: Locator;
  readonly similarityResetButton: Locator;

  readonly similarityResultsTable: Locator;
  readonly similarityResultsTableInner: Locator;

  readonly vectorValue: Locator;
  readonly copyVectorButton: Locator;
  readonly downloadVectorButton: Locator;
  readonly editAttributesButton: Locator;
  readonly saveAttributesButton: Locator;
  readonly cancelAttributesButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.elementsTable = page.getByTestId('vector-set-details');
    this.elementsTableInner = page.getByTestId('vector-set-details-table');
    this.previewSummary = page.getByTestId('vector-set-preview-summary');

    this.addElementsButton = page.getByRole('button', { name: 'Add Elements' });
    this.saveElementsButton = page.getByTestId('save-elements-btn');
    this.cancelElementsButton = page.getByTestId('cancel-elements-btn');
    this.elementNameInput = page.getByPlaceholder('Enter Element Name').first();
    this.elementVectorInput = page.getByPlaceholder(/^Enter Vector/).first();

    const similaritySearchForm = page.getByTestId('similarity-search-form');
    this.similaritySearchForm = similaritySearchForm;
    this.similarityModeVectorButton = similaritySearchForm.getByRole('button', { name: /^Vector/ });
    this.similarityModeElementButton = similaritySearchForm.getByRole('button', { name: /^Element/ });
    this.similarityVectorInput = similaritySearchForm.getByPlaceholder(/^Enter a vector/);
    this.similarityElementInput = similaritySearchForm.getByPlaceholder('Existing element name');
    this.similaritySubmitButton = similaritySearchForm.getByRole('button', { name: 'Find similar items' });
    this.similarityResetButton = similaritySearchForm.getByRole('button', { name: 'Reset similarity search form' });

    this.similarityResultsTable = page.getByTestId('vector-set-similarity-results');
    this.similarityResultsTableInner = page.getByTestId('vector-set-similarity-results-table');

    this.vectorValue = page.getByTestId('vector-set-vector-value');
    this.copyVectorButton = page.getByRole('button', { name: 'Copy vector' });
    this.downloadVectorButton = page.getByRole('button', { name: 'Download vector' });
    this.editAttributesButton = page.getByRole('button', { name: 'Edit attributes' });
    this.saveAttributesButton = page.getByTestId('vector-set-save-attributes-btn');
    this.cancelAttributesButton = page.getByTestId('vector-set-cancel-attributes-btn');
  }

  async waitForLoad(): Promise<void> {
    await expect(this.elementsTable).toBeVisible();
  }

  async addElement(name: string, vector: string): Promise<void> {
    await this.addElementsButton.click();
    await expect(this.elementNameInput).toBeVisible();
    await this.elementNameInput.fill(name);
    await this.elementVectorInput.fill(vector);
    await expect(this.saveElementsButton).toBeEnabled();
    await this.saveElementsButton.click();
    await expect(this.elementNameInput).toBeHidden();
  }

  viewElementButton(elementName: string): Locator {
    return this.page.getByTestId(`vector-set-view-btn-${elementName}`);
  }

  searchSimilarByElementButton(elementName: string): Locator {
    return this.page.getByTestId(`vector-set-search-similar-btn-${elementName}`);
  }

  // `-icon` suffix distinguishes the row trigger from the confirm button
  // inside the popover, which uses the same testid prefix without the suffix.
  removeElementButton(elementName: string): Locator {
    return this.page.getByTestId(`vector-set-remove-btn-${elementName}-icon`);
  }

  confirmRemoveElementButton(elementName: string): Locator {
    return this.page.getByTestId(`vector-set-remove-btn-${elementName}`);
  }

  elementValueCell(elementName: string): Locator {
    return this.page.getByTestId(`vector-set-element-value-${elementName}`);
  }

  async removeElement(elementName: string): Promise<void> {
    await this.removeElementButton(elementName).click();
    const confirm = this.confirmRemoveElementButton(elementName);
    await expect(confirm).toBeVisible();
    await confirm.click();
    await expect(this.elementValueCell(elementName)).toBeHidden();
  }

  async openElementDetails(elementName: string): Promise<void> {
    await this.viewElementButton(elementName).click();
    await expect(this.vectorValue).toBeVisible();
  }

  async setSimilarityMode(mode: 'vector' | 'element'): Promise<void> {
    const target = mode === 'vector' ? this.similarityModeVectorButton : this.similarityModeElementButton;
    await target.click();
  }

  async runSimilaritySearchByVector(vector: string): Promise<void> {
    await this.setSimilarityMode('vector');
    await this.similarityVectorInput.fill(vector);
    await expect(this.similaritySubmitButton).toBeEnabled();
    await this.similaritySubmitButton.click();
    await expect(this.similarityResultsTable).toBeVisible();
  }

  async runSimilaritySearchByElement(elementName: string): Promise<void> {
    await this.setSimilarityMode('element');
    await this.similarityElementInput.fill(elementName);
    await expect(this.similaritySubmitButton).toBeEnabled();
    await this.similaritySubmitButton.click();
    await expect(this.similarityResultsTable).toBeVisible();
  }

  similarityResultRank(index: number): Locator {
    return this.page.getByTestId(`vector-set-similarity-rank-cell-${index}`);
  }

  // Renders the score percentage, not the element name — use
  // `similarityResultElementValue` to assert on element identity.
  similarityResultCell(index: number): Locator {
    return this.page.getByTestId(`vector-set-similarity-cell-${index}`);
  }

  // Scoped to the results container — the same testid appears in the main
  // elements table, which can be visible simultaneously.
  similarityResultElementValue(elementName: string): Locator {
    return this.similarityResultsTable.getByTestId(`vector-set-element-value-${elementName}`);
  }
}
