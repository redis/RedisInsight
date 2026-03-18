import { Page, Locator } from '@playwright/test';

/**
 * Create Index Onboarding component
 * Guided popovers that walk the user through the create index form steps:
 * DefineIndex → IndexPrefix → FieldName → SampleValue → IndexingType → CommandView
 */
export class CreateIndexOnboarding {
  readonly page: Page;

  readonly popover: Locator;
  readonly skipButton: Locator;

  static readonly STEPS = [
    'defineIndex',
    'indexPrefix',
    'fieldName',
    'sampleValue',
    'indexingType',
    'commandView',
  ] as const;

  constructor(page: Page) {
    this.page = page;

    this.popover = page.getByTestId(/create-index-onboarding-popover/);
    this.skipButton = page.getByRole('button', { name: 'Skip tour' });
  }

  stepPopover(step: string): Locator {
    return this.page.getByTestId(`create-index-onboarding-popover-${step}`);
  }

  stepAction(step: string): Locator {
    return this.page.getByTestId(`create-index-onboarding-action-${step}`);
  }
}
