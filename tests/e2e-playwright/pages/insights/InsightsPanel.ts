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
  readonly enablementArea: Locator;

  // Tutorial page content
  readonly tutorialPageContent: Locator;
  readonly paginationMenuButton: Locator;
  readonly paginationMenu: Locator;
  readonly nextPageButton: Locator;
  readonly prevPageButton: Locator;

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
    this.enablementArea = page.getByTestId('enablementArea');

    // Tutorial page content (when viewing a tutorial)
    this.tutorialPageContent = page.getByTestId('enablement-area__page');
    this.paginationMenuButton = page.getByTestId('enablement-area__toggle-pagination-menu-btn');
    this.paginationMenu = page.getByTestId('enablement-area__pagination-menu');
    this.nextPageButton = page.getByTestId('enablement-area__next-page-btn');
    this.prevPageButton = page.getByTestId('enablement-area__prev-page-btn');

    // Tips tab content
    this.noRecommendationsScreen = page.getByTestId('no-recommendations-screen');
  }

  /**
   * Open the Insights panel by clicking the trigger.
   * The trigger dispatches a *toggle* action, so clicking it when the panel
   * is already open would close it.  Skip the click when already visible.
   */
  async open(): Promise<void> {
    if (await this.panel.isVisible()) {
      return;
    }

    await this.trigger.click();
    await this.panel.waitFor({ state: 'visible' });
  }

  /**
   * Close the Insights panel.
   * No-op if the panel is already hidden.
   */
  async close(): Promise<void> {
    if (!(await this.panel.isVisible())) {
      return;
    }

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

  /**
   * Click on a tutorial link by its data-testid
   * Tutorial links have data-testid="internal-link-{id}"
   * @param tutorialId - The tutorial link id (e.g., 'introduction', 'sq-intro')
   */
  async openTutorial(tutorialId: string): Promise<void> {
    const tutorialLink = this.page.getByTestId(`internal-link-${tutorialId}`);
    await tutorialLink.click();
    await this.tutorialPageContent.waitFor({ state: 'visible' });
  }

  /**
   * Navigate to next page in tutorial pagination
   * Waits for the pagination text to change after clicking
   */
  async goToNextPage(): Promise<void> {
    const currentPagination = await this.getPaginationInfo();
    await this.nextPageButton.click();
    // Wait for pagination text to change
    await expect(this.paginationMenuButton).not.toHaveText(currentPagination);
  }

  /**
   * Navigate to previous page in tutorial pagination
   * Waits for the pagination text to change after clicking
   */
  async goToPreviousPage(): Promise<void> {
    const currentPagination = await this.getPaginationInfo();
    await this.prevPageButton.click();
    // Wait for pagination text to change
    await expect(this.paginationMenuButton).not.toHaveText(currentPagination);
  }

  /**
   * Get current page info from pagination (e.g., "1 of 3")
   */
  async getPaginationInfo(): Promise<string> {
    return (await this.paginationMenuButton.textContent()) || '';
  }

  /**
   * Check if next page button is visible (indicates more pages available)
   */
  async hasNextPage(): Promise<boolean> {
    return this.nextPageButton.isVisible();
  }

  /**
   * Check if previous page button is visible
   */
  async hasPreviousPage(): Promise<boolean> {
    return this.prevPageButton.isVisible();
  }

  /**
   * Run a tutorial command by clicking the run button with specified label
   * @param label - The label of the run button (from data-testid="run-btn-{label}")
   */
  async runCommand(label: string): Promise<void> {
    const runButton = this.page.getByTestId(`run-btn-${label}`);
    await runButton.click();
  }

  /**
   * Get the first available run button on the tutorial page
   */
  getFirstRunButton(): Locator {
    return this.tutorialPageContent.locator('[data-testid^="run-btn-"]').first();
  }

  /**
   * Check if tutorial page content is visible
   */
  async isTutorialPageVisible(): Promise<boolean> {
    return this.tutorialPageContent.isVisible();
  }
}
