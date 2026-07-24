import { Page, Locator } from '@playwright/test';

export class WelcomeScreen {
  readonly page: Page;

  readonly container: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly features: Locator;
  readonly trySampleDataButton: Locator;
  readonly useMyDatabaseButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.container = page.getByTestId('welcome-screen');
    this.title = page.getByRole('heading', { name: 'Search your data at in-memory speed' });
    this.subtitle = page.getByText('Discover how Redis enables full-text and vector search');
    this.features = page.getByTestId('welcome-screen--features');
    this.trySampleDataButton = page.getByRole('button', { name: 'Try with sample data' });
    // Label depends on the dev-vs-enhancements flag ("Create index" when on,
    // "Use data from my database" when off), so target the stable test id.
    this.useMyDatabaseButton = page.getByTestId('welcome-screen--use-my-database-btn');
  }
}
