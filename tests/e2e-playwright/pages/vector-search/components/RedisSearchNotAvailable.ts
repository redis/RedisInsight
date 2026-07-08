import { Page, Locator } from '@playwright/test';

/**
 * Redis Search Not Available component
 * Shown when Redis instance doesn't have the Search module
 */
export class RedisSearchNotAvailable {
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

    this.container = page.getByTestId('redis-search-not-available');
    this.title = page.getByText('Redis Search is not available for this database');
    this.description = page.getByTestId('redis-search-not-available-description');
    this.featureList = page.getByTestId('redis-search-not-available-feature-list');
    this.getStartedButton = page.getByRole('button', { name: 'Get started for free' });
    this.learnMoreLink = page.getByRole('link', { name: 'Learn more' });
    this.illustration = page.getByTestId('redis-search-not-available-illustration');
  }
}
