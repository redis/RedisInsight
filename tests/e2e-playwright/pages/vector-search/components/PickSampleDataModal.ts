import { Page, Locator } from '@playwright/test';

export class PickSampleDataModal {
  readonly page: Page;

  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly radioGroup: Locator;
  readonly closeButton: Locator;
  readonly cancelButton: Locator;
  readonly seeIndexDefinitionButton: Locator;
  readonly startQueryingButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByTestId('pick-sample-data-modal--heading');
    this.subtitle = page.getByText('Select a sample dataset.');
    this.radioGroup = page.getByTestId('pick-sample-data-modal--radio-group');
    this.closeButton = page.getByTestId('pick-sample-data-modal--close');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.seeIndexDefinitionButton = page.getByRole('button', { name: 'See index definition' });
    this.startQueryingButton = page.getByRole('button', { name: 'Start querying' });
  }

  getSampleDataOption(value: string): Locator {
    return this.page.getByTestId(`pick-sample-data-modal--option-${value}`);
  }
}
