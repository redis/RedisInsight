import { Page, Locator } from '@playwright/test';

/**
 * Results Panel component for Workbench
 * Handles the results display area
 */
export class ResultsPanel {
  readonly page: Page;
  readonly container: Locator;
  readonly resultCards: Locator;
  readonly lastResult: Locator;
  readonly resultText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('[data-testid^="query-card-container-"]').first();
    this.resultCards = page.locator('[data-testid^="query-card-container-"]');
    this.lastResult = page.getByTestId('query-cli-result').first();
    this.resultText = page.getByTestId('query-cli-card-result').first();
  }

  /**
   * Wait for a result to appear
   */
  async waitForResult(timeout = 10000): Promise<void> {
    await this.container.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for a new result to appear (useful when results already exist)
   */
  async waitForNewResult(previousCount: number, timeout = 10000): Promise<void> {
    await this.page.waitForFunction(
      (expectedCount) => {
        const cards = document.querySelectorAll('[data-testid^="query-card-container-"]');
        return cards.length > expectedCount;
      },
      previousCount,
      { timeout },
    );
  }

  /**
   * Get the text of the most recent result (first in DOM order)
   */
  async getLastResultText(): Promise<string> {
    return this.getResultTextByIndex(0);
  }

  /**
   * Get the number of result cards
   */
  async getResultCount(): Promise<number> {
    return this.resultCards.count();
  }

  /**
   * Get result text by index (0 = most recent)
   */
  async getResultTextByIndex(index: number): Promise<string> {
    const resultCard = this.resultCards.nth(index);
    const resultText = resultCard.locator('[data-testid="query-cli-card-result"]');
    await resultText.waitFor({ state: 'visible', timeout: 5000 });
    return resultText.innerText();
  }

  /**
   * Get command text from result card by index
   */
  async getCommandTextByIndex(index: number): Promise<string> {
    const resultCard = this.resultCards.nth(index);
    const commandText = resultCard.locator('[data-testid="query-card-command"]');
    return commandText.innerText();
  }

  /**
   * Delete result by index
   */
  async deleteResultByIndex(index: number): Promise<void> {
    const resultCard = this.resultCards.nth(index);
    const deleteButton = resultCard.locator('[data-testid="delete-command"]');
    await deleteButton.click();
  }

  /**
   * Re-run command by index
   */
  async rerunCommandByIndex(index: number): Promise<void> {
    const resultCard = this.resultCards.nth(index);
    const rerunButton = resultCard.locator('[data-testid="re-run-command"]');
    await rerunButton.click();
  }

  /**
   * Copy command by index
   */
  async copyCommandByIndex(index: number): Promise<void> {
    const resultCard = this.resultCards.nth(index);
    const copyButton = resultCard.locator('[data-testid="copy-command-btn"]');
    await copyButton.click();
  }

  /**
   * Check if results are visible
   */
  async hasResults(): Promise<boolean> {
    const count = await this.getResultCount();
    return count > 0;
  }

  /**
   * Get execution time of last result
   */
  async getLastExecutionTime(): Promise<string> {
    const timeValue = this.page.getByTestId('command-execution-time-value').first();
    return timeValue.innerText();
  }

  /**
   * Get datetime of result by index (0 = most recent)
   */
  async getDateTimeByIndex(index: number): Promise<string> {
    const resultCard = this.resultCards.nth(index);
    const dateTime = resultCard.locator('[data-testid="command-execution-date-time"]');
    await dateTime.waitFor({ state: 'visible', timeout: 5000 });
    return dateTime.innerText();
  }

  /**
   * Get datetime of the most recent result
   */
  async getLastDateTime(): Promise<string> {
    return this.getDateTimeByIndex(0);
  }
}
