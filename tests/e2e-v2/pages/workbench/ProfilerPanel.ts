import { Page, Locator, expect } from '@playwright/test';

/**
 * Profiler Panel Page Object
 * Handles interactions with the Profiler panel in the bottom panel
 */
export class ProfilerPanel {
  readonly page: Page;

  // Panel elements
  readonly expandButton: Locator;
  readonly panel: Locator;
  readonly hideButton: Locator;
  readonly closeButton: Locator;

  // Profiler controls
  readonly startButton: Locator;
  readonly toggleButton: Locator;
  readonly clearButton: Locator;
  readonly resetButton: Locator;
  readonly saveLogSwitch: Locator;

  // Profiler content
  readonly profilerOutput: Locator;
  readonly warningMessage: Locator;
  readonly runningTimeText: Locator;

  constructor(page: Page) {
    this.page = page;

    // Panel elements
    this.expandButton = page.getByTestId('expand-monitor');
    this.panel = page.locator('[data-testid="monitor-container"]').or(
      page.locator('[class*="monitor"]').filter({ hasText: 'Profiler' }),
    );
    this.hideButton = page.getByTestId('hide-monitor');
    this.closeButton = page.getByTestId('close-monitor');

    // Profiler controls
    this.startButton = page.getByTestId('start-monitor');
    this.toggleButton = page.getByTestId('toggle-run-monitor');
    this.clearButton = page.getByTestId('clear-monitor');
    this.resetButton = page.getByRole('button', { name: 'Reset Profiler' });
    this.saveLogSwitch = page.getByRole('switch');

    // Profiler content
    this.profilerOutput = page.locator('[class*="monitor"]').filter({ hasText: /\d{2}:\d{2}:\d{2}/ });
    this.warningMessage = page.getByRole('alert').filter({
      hasText: /Running Profiler will decrease throughput/,
    });
    this.runningTimeText = page.getByText(/Running time/);
  }

  /**
   * Open the profiler panel
   */
  async open(): Promise<void> {
    await this.expandButton.click();
    await this.page.waitForTimeout(500); // Wait for panel animation
  }

  /**
   * Check if profiler panel is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.startButton.isVisible().catch(() => false) ||
           await this.toggleButton.isVisible().catch(() => false);
  }

  /**
   * Start the profiler
   */
  async start(): Promise<void> {
    // If start button is visible, click it
    if (await this.startButton.isVisible()) {
      await this.startButton.click();
    } else if (await this.toggleButton.isVisible()) {
      // If toggle button is visible and profiler is stopped, click it
      await this.toggleButton.click();
    }
    // Wait for profiler to start
    await expect(this.toggleButton).toBeVisible({ timeout: 5000 });
  }

  /**
   * Stop the profiler
   */
  async stop(): Promise<void> {
    if (await this.toggleButton.isVisible()) {
      await this.toggleButton.click();
      // Wait for running time to appear (indicates profiler stopped)
      await expect(this.runningTimeText).toBeVisible({ timeout: 5000 });
    }
  }

  /**
   * Check if profiler is running
   */
  async isRunning(): Promise<boolean> {
    // When running, the toggle button is visible but reset button is not
    const toggleVisible = await this.toggleButton.isVisible().catch(() => false);
    const resetVisible = await this.resetButton.isVisible().catch(() => false);
    return toggleVisible && !resetVisible;
  }

  /**
   * Clear profiler output
   */
  async clear(): Promise<void> {
    await this.clearButton.click();
  }

  /**
   * Reset profiler (after stopping)
   */
  async reset(): Promise<void> {
    await this.resetButton.click();
  }

  /**
   * Hide the profiler panel
   */
  async hide(): Promise<void> {
    await this.hideButton.click();
  }

  /**
   * Close the profiler panel
   */
  async close(): Promise<void> {
    await this.closeButton.click();
  }

  /**
   * Toggle save log switch
   */
  async toggleSaveLog(): Promise<void> {
    await this.saveLogSwitch.click();
  }

  /**
   * Check if warning message is visible
   */
  async isWarningVisible(): Promise<boolean> {
    return await this.warningMessage.isVisible().catch(() => false);
  }

  /**
   * Get profiler output entries count
   */
  async getOutputEntriesCount(): Promise<number> {
    const entries = this.page.locator('[class*="monitor"]').locator('div').filter({
      hasText: /\d{2}:\d{2}:\d{2}\.\d{3}/,
    });
    return await entries.count();
  }
}

