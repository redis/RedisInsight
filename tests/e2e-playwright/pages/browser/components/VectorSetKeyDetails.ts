import { Page, Locator, expect } from '@playwright/test';

/**
 * Vector Set Key Details component — right-side panel shown when a Vector Set
 * key is selected in the Browser.
 *
 * Covers the similarity-search form, the elements table, per-row actions
 * (view / find-similar / remove), and the element-details drawer
 * (vector value, copy, edit attributes).
 *
 * Source testids live under `redisinsight/ui/src/pages/browser/modules/
 * key-details/components/vector-set-details/`.
 */
export class VectorSetKeyDetails {
  readonly page: Page;

  // Containers
  readonly elementsTable: Locator;
  readonly elementsTableInner: Locator;
  readonly previewSummary: Locator;

  // Add elements (subheader button on the key details panel)
  readonly addElementsButton: Locator;
  readonly saveElementsButton: Locator;
  readonly cancelElementsButton: Locator;
  readonly elementNameInput: Locator;
  readonly elementVectorInput: Locator;

  // Similarity search form
  readonly similaritySearchForm: Locator;
  readonly similarityModeVectorButton: Locator;
  readonly similarityModeElementButton: Locator;
  readonly similarityVectorInput: Locator;
  readonly similarityElementInput: Locator;
  readonly similarityFilterInput: Locator;
  readonly similarityCountInput: Locator;
  readonly similaritySubmitButton: Locator;
  readonly similarityResetButton: Locator;

  // Similarity search results table
  readonly similarityResultsTable: Locator;
  readonly similarityResultsTableInner: Locator;

  // Element details drawer
  readonly vectorValue: Locator;
  readonly copyVectorButton: Locator;
  readonly downloadVectorButton: Locator;
  readonly editAttributesButton: Locator;
  readonly saveAttributesButton: Locator;
  readonly cancelAttributesButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Elements table
    this.elementsTable = page.getByTestId('vector-set-details');
    this.elementsTableInner = page.getByTestId('vector-set-details-table');
    this.previewSummary = page.getByTestId('vector-set-preview-summary');

    // Add Elements (shares the generic add-items button testid with other key types)
    this.addElementsButton = page.getByTestId('add-key-value-items-btn');
    this.saveElementsButton = page.getByTestId('save-elements-btn');
    this.cancelElementsButton = page.getByTestId('cancel-elements-btn');
    this.elementNameInput = page.getByTestId('element-name').first();
    this.elementVectorInput = page.getByTestId('element-vector').first();

    // Similarity search form (TEST_ID = 'similarity-search-form')
    const formId = 'similarity-search-form';
    this.similaritySearchForm = page.getByTestId(formId);
    this.similarityModeVectorButton = page.getByTestId(`${formId}-mode-vector`);
    this.similarityModeElementButton = page.getByTestId(`${formId}-mode-element`);
    this.similarityVectorInput = page.getByTestId(`${formId}-vector-input`);
    this.similarityElementInput = page.getByTestId(`${formId}-element-input`);
    this.similarityFilterInput = page.getByTestId(`${formId}-filter-input`);
    this.similarityCountInput = page.getByTestId(`${formId}-count-input`);
    this.similaritySubmitButton = page.getByTestId(`${formId}-submit`);
    this.similarityResetButton = page.getByTestId(`${formId}-reset`);

    // Similarity results
    this.similarityResultsTable = page.getByTestId('vector-set-similarity-results');
    this.similarityResultsTableInner = page.getByTestId('vector-set-similarity-results-table');

    // Element details drawer
    this.vectorValue = page.getByTestId('vector-set-vector-value');
    this.copyVectorButton = page.getByTestId('vector-set-copy-vector-btn');
    this.downloadVectorButton = page.getByTestId('vector-set-download-vector-btn');
    this.editAttributesButton = page.getByTestId('vector-set-edit-attributes-btn');
    this.saveAttributesButton = page.getByTestId('vector-set-save-attributes-btn');
    this.cancelAttributesButton = page.getByTestId('vector-set-cancel-attributes-btn');
  }

  async waitForLoad(): Promise<void> {
    await expect(this.elementsTable).toBeVisible();
  }

  /**
   * Add an element to the currently-selected Vector Set via the side panel form.
   */
  async addElement(name: string, vector: string): Promise<void> {
    await this.addElementsButton.click();
    await expect(this.elementNameInput).toBeVisible();
    await this.elementNameInput.fill(name);
    await this.elementVectorInput.fill(vector);
    await expect(this.saveElementsButton).toBeEnabled();
    await this.saveElementsButton.click();
    // Form closes on success
    await expect(this.elementNameInput).toBeHidden();
  }

  /**
   * Per-row action: view element (opens details drawer).
   * Element names appear verbatim in the testid suffix.
   */
  viewElementButton(elementName: string): Locator {
    return this.page.getByTestId(`vector-set-view-btn-${elementName}`);
  }

  /**
   * Per-row action: find similar by element. Clicking prefills similarity
   * search in Element mode with this element name.
   */
  searchSimilarByElementButton(elementName: string): Locator {
    return this.page.getByTestId(`vector-set-search-similar-btn-${elementName}`);
  }

  /**
   * Per-row action: delete element trigger (the trash icon in the row).
   * Carries the `-icon` suffix; clicking opens the confirmation popover.
   * Distinct from `confirmRemoveElementButton`, which lives *inside* the
   * popover and shares the same testid prefix without the `-icon` suffix.
   */
  removeElementButton(elementName: string): Locator {
    return this.page.getByTestId(`vector-set-remove-btn-${elementName}-icon`);
  }

  /**
   * Confirmation button inside the delete popover (no `-icon` suffix —
   * see `removeElementButton` above).
   */
  confirmRemoveElementButton(elementName: string): Locator {
    return this.page.getByTestId(`vector-set-remove-btn-${elementName}`);
  }

  /**
   * Cell containing an element name in the results table (used to assert
   * presence / absence after CRUD).
   */
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

  // ---- Similarity search ----

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

  /**
   * Similarity result row by index. Useful for asserting that the top-ranked
   * row matches the queried element.
   */
  similarityResultRank(index: number): Locator {
    return this.page.getByTestId(`vector-set-similarity-rank-cell-${index}`);
  }

  similarityResultCell(index: number): Locator {
    return this.page.getByTestId(`vector-set-similarity-cell-${index}`);
  }
}
