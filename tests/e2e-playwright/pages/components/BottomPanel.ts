import { Page, Locator } from '@playwright/test';

/**
 * Bottom Panel component
 * Common bottom panel shown on all database instance pages
 * Contains CLI, Command Helper, and Profiler buttons
 */
export class BottomPanel {
  readonly page: Page;

  // Panel toggle buttons
  readonly cliButton: Locator;
  readonly commandHelperButton: Locator;
  readonly profilerButton: Locator;

  // Feedback link
  readonly feedbackLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Bottom panel buttons - using text content with parent element
    this.cliButton = page.getByText('CLI').locator('..');
    this.commandHelperButton = page.getByText('Command Helper').locator('..');
    this.profilerButton = page.getByText('Profiler').locator('..');

    // Feedback link
    this.feedbackLink = page.getByRole('link', { name: 'Let us know what you think' });
  }

  /**
   * Open CLI panel
   */
  async openCli(): Promise<void> {
    await this.cliButton.click();
  }

  /**
   * Open Command Helper panel
   */
  async openCommandHelper(): Promise<void> {
    await this.commandHelperButton.click();
  }

  /**
   * Open Profiler panel
   */
  async openProfiler(): Promise<void> {
    await this.profilerButton.click();
  }

  /**
   * Check if CLI button is visible
   */
  async isCliButtonVisible(): Promise<boolean> {
    return this.cliButton.isVisible();
  }

  /**
   * Check if Command Helper button is visible
   */
  async isCommandHelperButtonVisible(): Promise<boolean> {
    return this.commandHelperButton.isVisible();
  }

  /**
   * Check if Profiler button is visible
   */
  async isProfilerButtonVisible(): Promise<boolean> {
    return this.profilerButton.isVisible();
  }

  /**
   * Click on feedback link
   */
  async openFeedback(): Promise<void> {
    await this.feedbackLink.click();
  }
}
