import { Page, Locator, expect } from '@playwright/test';

/**
 * Profiler (Monitor) bottom-panel page object.
 *
 * Wraps the Start / Stop controls, the production-mode confirmation popover,
 * the advisory banner, and the visible "Profiler is started." running
 * indicator. Locators prefer accessible names; testids are kept only where
 * the element has no stable semantic anchor (the popover buttons and the
 * advisory banner).
 */
export class ProfilerPanel {
  readonly page: Page;

  // Controls
  readonly startButton: Locator;
  readonly stopToggleButton: Locator;

  // State
  readonly runningIndicator: Locator;
  readonly advisoryBanner: Locator;

  // Production confirmation popover (rendered only on Production DBs)
  readonly productionConfirmButton: Locator;
  readonly productionCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startButton = page.getByRole('button', { name: 'start monitor' });
    this.stopToggleButton = page.getByRole('button', { name: 'start/stop monitor' });
    this.runningIndicator = page.getByText('Profiler is started.');
    this.advisoryBanner = page.getByTestId('monitor-warning-message');
    this.productionConfirmButton = page.getByTestId('profiler-start-confirm');
    this.productionCancelButton = page.getByTestId('profiler-start-cancel');
  }

  async clickStart(): Promise<void> {
    await this.startButton.click();
  }

  async confirmProductionStart(): Promise<void> {
    await expect(this.productionConfirmButton).toBeVisible();
    await this.productionConfirmButton.click();
  }

  async cancelProductionStart(): Promise<void> {
    await expect(this.productionCancelButton).toBeVisible();
    await this.productionCancelButton.click();
  }

  async expectRunning(): Promise<void> {
    await expect(this.runningIndicator).toBeVisible();
  }

  async expectNotRunning(): Promise<void> {
    await expect(this.startButton).toBeVisible();
    await expect(this.runningIndicator).toHaveCount(0);
  }
}
