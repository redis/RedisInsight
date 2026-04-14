import { Page, Locator } from '@playwright/test';

/**
 * RQE Not Available component
 * Shown when Redis instance doesn't have the Search module
 */
export class RqeNotAvailable {
  readonly page: Page;

  readonly container: Locator;
  readonly title: Locator;
  readonly description: Locator;
  readonly featureList: Locator;
  readonly getStartedButton: Locator;
  readonly learnMoreLink: Locator;
  readonly illustration: Locator;

  constructor(page: Page) {
    this.page = page;

    this.container = page.getByTestId('rqe-not-available');
    this.title = page.getByText('Redis Query Engine is not available for this database');
    this.description = page.getByTestId('rqe-description');
    this.featureList = page.getByTestId('rqe-feature-list');
    this.getStartedButton = page.getByRole('button', { name: 'Get started for free' });
    this.learnMoreLink = page.getByRole('link', { name: 'Learn more' });
    this.illustration = page.getByTestId('rqe-illustration');
  }
}
