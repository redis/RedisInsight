import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Redis tools side panel
 */
export class RedisToolsPanel {
  readonly page: Page;

  readonly trigger: Locator;
  readonly panel: Locator;

  // Cards
  readonly radarCard: Locator;
  readonly radarIcon: Locator;

  // Steps box
  readonly stepIcons: Locator;

  constructor(page: Page) {
    this.page = page;

    this.trigger = page.getByTestId('redis-tools-trigger');
    this.panel = page.getByTestId('redis-tools-panel');

    this.radarCard = page.getByTestId('redis-tools-radar-card');
    this.radarIcon = page.getByTestId('redis-tools-radar-icon');

    this.stepIcons = page.getByTestId('redis-tools-steps').locator('svg');
  }

  /**
   * Open the panel by clicking the trigger.
   * The trigger toggles the panel, so skip the click when it is already open.
   */
  async open(): Promise<void> {
    if (await this.panel.isVisible()) {
      return;
    }

    await this.trigger.click();
    await this.panel.waitFor({ state: 'visible' });
  }
}
