import { Page, Locator, expect } from '@playwright/test';

export class QueryEditor {
  readonly page: Page;

  readonly container: Locator;
  readonly actionsBar: Locator;
  readonly runButton: Locator;
  readonly explainButton: Locator;
  readonly profileButton: Locator;
  readonly saveButton: Locator;

  readonly editorLibraryToggle: Locator;
  readonly editorTab: Locator;
  readonly libraryTab: Locator;

  readonly textbox: Locator;

  readonly explainTooltip: Locator;
  readonly profileTooltip: Locator;

  readonly queryOnboarding: Locator;
  readonly queryOnboardingDismiss: Locator;

  constructor(page: Page) {
    this.page = page;

    this.container = page.getByTestId('vector-search-query-editor');
    this.actionsBar = page.getByTestId('vector-search-actions');
    this.runButton = this.actionsBar.getByRole('button', { name: 'submit' });
    this.explainButton = this.actionsBar.getByRole('button', { name: 'explain' });
    this.profileButton = this.actionsBar.getByRole('button', { name: 'profile' });
    this.saveButton = this.actionsBar.getByRole('button', { name: 'save' });

    this.editorLibraryToggle = page.getByTestId('editor-library-toggle');
    this.editorTab = this.editorLibraryToggle.getByRole('button', { name: 'Query editor' });
    this.libraryTab = this.editorLibraryToggle.getByRole('button', { name: 'Query library' });

    this.textbox = this.container.getByRole('textbox');

    this.explainTooltip = page.getByTestId('explain-tooltip');
    this.profileTooltip = page.getByTestId('profile-tooltip');

    this.queryOnboarding = page.getByText('Index created successfully.');
    this.queryOnboardingDismiss = page.getByRole('button', { name: 'Got it' });
  }

  async typeQuery(query: string): Promise<void> {
    // Triple-click selects the entire line without triggering Monaco autocomplete
    await this.container.click({ clickCount: 3 });
    await this.page.keyboard.type(query);
  }

  async clearQuery(): Promise<void> {
    await this.container.click({ clickCount: 3 });
    await this.page.keyboard.press('Backspace');
    await expect(this.textbox).toHaveValue('');
  }
}
