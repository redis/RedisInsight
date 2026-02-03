import { Page, Locator, expect } from '@playwright/test';

/**
 * Navigation Tabs component
 * Common tabs shown on all database instance pages (Browse, Workbench, Analyze, Pub/Sub)
 */
export class NavigationTabs {
  readonly page: Page;

  // Tab elements
  readonly browseTab: Locator;
  readonly workbenchTab: Locator;
  readonly analyzeTab: Locator;
  readonly pubSubTab: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation tabs
    this.browseTab = page.getByRole('tab', { name: 'Browse' });
    this.workbenchTab = page.getByRole('tab', { name: 'Workbench' });
    this.analyzeTab = page.getByRole('tab', { name: 'Analyze' });
    this.pubSubTab = page.getByRole('tab', { name: 'Pub/Sub' });
  }

  /**
   * Navigate to Browser tab
   */
  async gotoBrowser(): Promise<void> {
    await this.browseTab.click();
    await expect(this.browseTab).toHaveAttribute('aria-selected', 'true');
  }

  /**
   * Navigate to Workbench tab
   */
  async gotoWorkbench(): Promise<void> {
    await this.workbenchTab.click();
    await expect(this.workbenchTab).toHaveAttribute('aria-selected', 'true');
  }

  /**
   * Navigate to Analyze tab
   */
  async gotoAnalyze(): Promise<void> {
    await this.analyzeTab.click();
    await expect(this.analyzeTab).toHaveAttribute('aria-selected', 'true');
  }

  /**
   * Navigate to Pub/Sub tab
   */
  async gotoPubSub(): Promise<void> {
    await this.pubSubTab.click();
    await expect(this.pubSubTab).toHaveAttribute('aria-selected', 'true');
  }

  /**
   * Get the currently selected tab name
   */
  async getSelectedTab(): Promise<string | null> {
    const tabs = [this.browseTab, this.workbenchTab, this.analyzeTab, this.pubSubTab];
    for (const tab of tabs) {
      const isSelected = await tab.getAttribute('aria-selected');
      if (isSelected === 'true') {
        return await tab.textContent();
      }
    }
    return null;
  }

  /**
   * Check if a specific tab is selected
   */
  async isTabSelected(tabName: 'Browse' | 'Workbench' | 'Analyze' | 'Pub/Sub'): Promise<boolean> {
    const tabMap = {
      Browse: this.browseTab,
      Workbench: this.workbenchTab,
      Analyze: this.analyzeTab,
      'Pub/Sub': this.pubSubTab,
    };
    const tab = tabMap[tabName];
    const isSelected = await tab.getAttribute('aria-selected');
    return isSelected === 'true';
  }
}

