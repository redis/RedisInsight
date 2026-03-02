import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for the Insights Panel (side panel with Tutorials and Tips tabs)
 */
export class InsightsPanel {
  readonly page: Page;

  // Panel container
  readonly panel: Locator;
  readonly trigger: Locator;

  // Header controls
  readonly closeButton: Locator;
  readonly fullScreenButton: Locator;

  // Tabs
  readonly tabsContainer: Locator;
  readonly tutorialsTab: Locator;
  readonly tipsTab: Locator;

  // Tutorials tab content
  readonly myTutorialsAccordion: Locator;
  readonly redisTutorialsAccordion: Locator;

  // Tips tab content
  readonly noRecommendationsScreen: Locator;

  constructor(page: Page) {
    this.page = page;

    // Panel container
    this.panel = page.getByTestId('side-panels-insights');
    this.trigger = page.getByTestId('insights-trigger');

    // Header controls
    this.closeButton = page.getByTestId('close-insights-btn');
    this.fullScreenButton = page.getByTestId('fullScreen-insights-btn');

    // Tabs - scoped to panel to avoid matching other tabs on the page
    this.tabsContainer = page.getByTestId('insights-tabs');
    this.tutorialsTab = this.tabsContainer.getByRole('tab', { name: 'Tutorials' });
    this.tipsTab = this.tabsContainer.getByRole('tab', { name: /Tips/ });

    // Tutorials tab content - accordion headers (use data-testid)
    // Custom tutorials: id="custom-tutorials", label="MY TUTORIALS"
    this.myTutorialsAccordion = page.getByTestId('ri-accordion-header-custom-tutorials');
    // Main tutorials: id="tutorials", label="Tutorials"
    this.redisTutorialsAccordion = page.getByTestId('ri-accordion-header-tutorials');

    // Tips tab content
    this.noRecommendationsScreen = page.getByTestId('no-recommendations-screen');
  }

  /**
   * Open the Insights panel by clicking the trigger
   */
  async open(): Promise<void> {
    await this.trigger.click();
    await this.panel.waitFor({ state: 'visible' });
  }

  /**
   * Close the Insights panel
   */
  async close(): Promise<void> {
    await this.closeButton.click();
    await this.panel.waitFor({ state: 'hidden' });
  }

  /**
   * Check if the panel is open
   */
  async isOpen(): Promise<boolean> {
    return this.panel.isVisible();
  }

  /**
   * Switch to the Tutorials tab
   */
  async switchToTutorialsTab(): Promise<void> {
    await this.tutorialsTab.click();
    await expect(this.tutorialsTab).toHaveAttribute('data-state', 'active');
  }

  /**
   * Switch to the Tips tab
   */
  async switchToTipsTab(): Promise<void> {
    await this.tipsTab.click();
    await expect(this.tipsTab).toHaveAttribute('data-state', 'active');
  }

  /**
   * Get the currently active tab name
   */
  async getActiveTabName(): Promise<string> {
    const activeTab = this.tabsContainer.locator('[data-state="active"]');
    return (await activeTab.textContent()) || '';
  }

  /**
   * Get the collapse button inside an accordion header
   * The aria-expanded attribute is on the button, not the header div
   */
  private getAccordionButton(folderId: string): Locator {
    const header = this.page.getByTestId(`ri-accordion-header-${folderId}`);
    return header.locator('button[aria-expanded]');
  }

  /**
   * Expand a tutorial folder accordion by id
   * @param folderId - The accordion id (e.g., 'custom-tutorials', 'tutorials')
   */
  async expandTutorialFolder(folderId: string): Promise<void> {
    const button = this.getAccordionButton(folderId);
    const isExpanded = await button.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'true');
    }
  }

  /**
   * Collapse a tutorial folder accordion by id
   * @param folderId - The accordion id (e.g., 'custom-tutorials', 'tutorials')
   */
  async collapseTutorialFolder(folderId: string): Promise<void> {
    const button = this.getAccordionButton(folderId);
    const isExpanded = await button.getAttribute('aria-expanded');
    if (isExpanded === 'true') {
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Check if a tutorial folder is expanded by id
   * @param folderId - The accordion id (e.g., 'custom-tutorials', 'tutorials')
   */
  async isTutorialFolderExpanded(folderId: string): Promise<boolean> {
    const button = this.getAccordionButton(folderId);
    const isExpanded = await button.getAttribute('aria-expanded');
    return isExpanded === 'true';
  }

  /**
   * Check if My tutorials section is visible
   */
  async isMyTutorialsVisible(): Promise<boolean> {
    return this.myTutorialsAccordion.isVisible();
  }
}
