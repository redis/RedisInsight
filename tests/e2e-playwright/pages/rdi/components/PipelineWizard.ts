import { Page, Locator } from '@playwright/test';

/**
 * rdi-ui's pipeline create wizard. Opened with `?addSource=true` on a
 * deployed pipeline, it runs in add-source mode: the pipeline's existing
 * sources are listed and locked, and a new one can be added.
 */
export class PipelineWizard {
  readonly page: Page;

  readonly stepNavigation: Locator;
  readonly addSourcesStep: Locator;
  readonly sourcesCount: Locator;
  readonly addSourceButton: Locator;
  readonly sourceTypes: Locator;
  readonly continueButton: Locator;
  readonly saveAndExitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.stepNavigation = page.getByRole('tablist', { name: 'Step navigation' });
    this.addSourcesStep = this.stepNavigation.getByRole('tab', { name: 'Add sources' });
    this.sourcesCount = page.getByText(/^Sources · \d+$/);
    this.addSourceButton = page.getByRole('button', { name: 'Add source', exact: true });
    this.sourceTypes = page.getByRole('group', { name: 'Source type' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.saveAndExitButton = page.getByRole('button', { name: 'Save & exit' });
  }

  /**
   * A source in the wizard's sources rail
   */
  getSource(sourceName: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^Database ${sourceName} `) });
  }

  getSourceType(label: string): Locator {
    return this.sourceTypes.getByRole('button', { name: label, exact: true });
  }
}
