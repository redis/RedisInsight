import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object for Navigation elements (sidebar, help menu, notifications, panels)
 */
export class NavigationPage extends BasePage {
  // Main navigation
  readonly mainNavigation: Locator;
  readonly redisLogo: Locator;
  readonly cloudLink: Locator;
  readonly notificationMenuButton: Locator;
  readonly helpMenuButton: Locator;
  readonly settingsButton: Locator;
  readonly githubLink: Locator;

  // Help menu items
  readonly helpMenuDialog: Locator;
  readonly provideFeedbackLink: Locator;
  readonly keyboardShortcutsButton: Locator;
  readonly releaseNotesLink: Locator;
  readonly resetOnboardingButton: Locator;

  // Keyboard shortcuts dialog
  readonly shortcutsDialog: Locator;
  readonly shortcutsTitle: Locator;
  readonly shortcutsCloseButton: Locator;
  readonly shortcutsDesktopSection: Locator;
  readonly shortcutsCliSection: Locator;
  readonly shortcutsWorkbenchSection: Locator;

  // Notification center
  readonly notificationDialog: Locator;
  readonly notificationCenterTitle: Locator;
  readonly notificationItems: Locator;
  readonly unreadBadge: Locator;
  readonly unreadNotifications: Locator;
  readonly readNotifications: Locator;

  // Copilot panel
  readonly copilotTrigger: Locator;
  readonly copilotPanel: Locator;
  readonly copilotTitle: Locator;
  readonly copilotCloseButton: Locator;
  readonly copilotFullScreenButton: Locator;
  readonly copilotGoogleSignIn: Locator;
  readonly copilotGithubSignIn: Locator;
  readonly copilotSsoSignIn: Locator;
  readonly copilotTermsCheckbox: Locator;

  // Insights panel
  readonly insightsTrigger: Locator;
  readonly insightsPanel: Locator;
  readonly insightsTitle: Locator;
  readonly insightsCloseButton: Locator;
  readonly insightsFullScreenButton: Locator;
  readonly insightsTutorialsTab: Locator;
  readonly insightsTipsTab: Locator;
  readonly insightsMyTutorials: Locator;
  readonly insightsRedisTutorials: Locator;

  // Live Recommendations (Tips tab)
  readonly noRecommendationsScreen: Locator;
  readonly showHiddenCheckbox: Locator;
  readonly analyzeDatabaseLink: Locator;
  readonly recommendationVoting: Locator;
  readonly likeVoteButton: Locator;
  readonly dislikeVoteButton: Locator;

  constructor(page: Page) {
    super(page);

    // Main navigation
    this.mainNavigation = page.getByRole('navigation', { name: 'Main navigation' });
    this.redisLogo = page.getByRole('link', { name: 'Redis Logo Dark Min' });
    this.cloudLink = page.getByRole('link', { name: 'cloud-db-icon' });
    this.notificationMenuButton = page.getByTestId('notification-menu-button');
    this.helpMenuButton = page.getByTestId('help-menu-button');
    this.settingsButton = page
      .getByTestId('settings-page-btn')
      .or(page.locator('[data-testid="Settings page button"]'));
    this.githubLink = page.getByRole('link', { name: 'github-repo-icon' });

    // Help menu items
    this.helpMenuDialog = page.getByRole('dialog').filter({ hasText: 'Help Center' });
    this.provideFeedbackLink = page.getByRole('link', { name: /Provide Feedback/i });
    this.keyboardShortcutsButton = page.getByTestId('shortcuts-btn');
    this.releaseNotesLink = page.getByRole('link', { name: 'Release Notes' });
    this.resetOnboardingButton = page.getByText('Reset Onboarding');

    // Keyboard shortcuts dialog
    this.shortcutsDialog = page.getByRole('dialog', { name: 'Shortcuts' });
    this.shortcutsTitle = this.shortcutsDialog.getByText('Shortcuts', { exact: true });
    this.shortcutsCloseButton = this.shortcutsDialog.getByRole('button', { name: 'close drawer' });
    this.shortcutsDesktopSection = this.shortcutsDialog.getByText('Desktop application');
    this.shortcutsCliSection = this.shortcutsDialog.getByText('CLI', { exact: true });
    this.shortcutsWorkbenchSection = this.shortcutsDialog.getByText('Workbench', { exact: true });

    // Notification center
    this.notificationDialog = page.getByRole('dialog').filter({ hasText: 'Notification Center' });
    this.notificationCenterTitle = page.getByText('Notification Center');
    this.notificationItems = this.notificationDialog.locator('[class*="notification"]');
    this.unreadBadge = page.getByTestId('total-unread-badge');
    this.unreadNotifications = page.locator('[data-testid^="notification-item-unread"]');
    this.readNotifications = page.locator('[data-testid^="notification-item-read"]');

    // Copilot panel
    this.copilotTrigger = page.getByTestId('copilot-trigger');
    this.copilotPanel = page.locator('[class*="copilot"]').filter({ hasText: 'Redis Copilot' });
    this.copilotTitle = page.getByText('Redis Copilot', { exact: true });
    this.copilotCloseButton = page.getByTestId('close-copilot-btn');
    this.copilotFullScreenButton = page.getByRole('button', { name: 'Open full screen' });
    this.copilotGoogleSignIn = page.getByRole('button', { name: /Google Signin/i });
    this.copilotGithubSignIn = page.getByRole('button', { name: /Github Github/i });
    this.copilotSsoSignIn = page.getByRole('button', { name: /Sso SSO/i });
    this.copilotTermsCheckbox = page.getByRole('checkbox', { name: /By signing up/i });

    // Insights panel
    this.insightsTrigger = page.getByTestId('insights-trigger');
    this.insightsPanel = page.locator('[class*="insights"]').filter({ hasText: 'Insights' });
    this.insightsTitle = page.getByText('Insights').first();
    this.insightsCloseButton = page.getByTestId('close-insights-btn');
    this.insightsFullScreenButton = page.getByTestId('fullScreen-insights-btn');
    this.insightsTutorialsTab = page.getByRole('tab', { name: 'Tutorials' });
    this.insightsTipsTab = page.getByRole('tab', { name: /Tips/ });
    this.insightsMyTutorials = page.getByRole('button', { name: 'My tutorials' });
    this.insightsRedisTutorials = page.getByRole('button', { name: 'Redis tutorials' });

    // Live Recommendations (Tips tab)
    this.noRecommendationsScreen = page.getByTestId('no-recommendations-screen');
    this.showHiddenCheckbox = page.getByTestId('checkbox-show-hidden');
    this.analyzeDatabaseLink = page.getByTestId('insights-db-analysis-link');
    this.recommendationVoting = page.getByTestId('recommendation-voting');
    this.likeVoteButton = page.getByTestId('like-vote-btn');
    this.dislikeVoteButton = page.getByTestId('dislike-vote-btn');
  }

  /**
   * Navigate to home page
   */
  async goto(): Promise<void> {
    await this.gotoHome();
  }

  /**
   * Click Redis logo to navigate home
   */
  async clickRedisLogo(): Promise<void> {
    await this.redisLogo.click();
    await this.waitForLoad();
  }

  /**
   * Open help menu
   */
  async openHelpMenu(): Promise<void> {
    await this.helpMenuButton.click();
    await this.helpMenuDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Close help menu by clicking elsewhere
   */
  async closeHelpMenu(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.helpMenuDialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Open notification center
   */
  async openNotificationCenter(): Promise<void> {
    await this.notificationMenuButton.click();
    await this.notificationDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Close notification center by clicking outside
   */
  async closeNotificationCenter(): Promise<void> {
    // Click outside the dialog to close it
    await this.page.locator('body').click({ position: { x: 10, y: 10 } });
    await this.notificationDialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Navigate to settings page
   */
  async goToSettings(): Promise<void> {
    await this.gotoSettings();
  }

  /**
   * Check if help menu is open
   */
  async isHelpMenuOpen(): Promise<boolean> {
    return this.helpMenuDialog.isVisible();
  }

  /**
   * Check if notification center is open
   */
  async isNotificationCenterOpen(): Promise<boolean> {
    return this.notificationDialog.isVisible();
  }

  /**
   * Get notification count
   */
  async getNotificationCount(): Promise<number> {
    const items = await this.notificationDialog.locator('> div > div > div').all();
    // Filter out the title
    return items.length - 1;
  }

  /**
   * Check if notification center has links
   */
  async hasNotificationLinks(): Promise<boolean> {
    const links = await this.notificationDialog.locator('a').all();
    return links.length > 0;
  }

  /**
   * Check if unread badge is visible
   */
  async isUnreadBadgeVisible(): Promise<boolean> {
    return this.unreadBadge.isVisible();
  }

  /**
   * Get unread badge count
   */
  async getUnreadBadgeCount(): Promise<string | null> {
    return this.unreadBadge.textContent();
  }

  /**
   * Get number of unread notifications in the center
   */
  async getUnreadNotificationCount(): Promise<number> {
    return this.unreadNotifications.count();
  }

  /**
   * Get number of read notifications in the center
   */
  async getReadNotificationCount(): Promise<number> {
    return this.readNotifications.count();
  }

  /**
   * Open Copilot panel
   */
  async openCopilotPanel(): Promise<void> {
    await this.copilotTrigger.click();
    await this.copilotTitle.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Close Copilot panel
   */
  async closeCopilotPanel(): Promise<void> {
    await this.copilotCloseButton.click();
    await this.copilotTitle.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Check if Copilot panel is open
   */
  async isCopilotPanelOpen(): Promise<boolean> {
    return this.copilotTitle.isVisible();
  }

  /**
   * Open Insights panel
   */
  async openInsightsPanel(): Promise<void> {
    await this.insightsTrigger.click();
    await this.insightsTitle.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Close Insights panel
   */
  async closeInsightsPanel(): Promise<void> {
    await this.insightsCloseButton.click();
    await this.insightsTitle.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Check if Insights panel is open
   */
  async isInsightsPanelOpen(): Promise<boolean> {
    return this.insightsTitle.isVisible();
  }

  /**
   * Switch to Tutorials tab in Insights panel
   */
  async switchToTutorialsTab(): Promise<void> {
    await this.insightsTutorialsTab.click();
  }

  /**
   * Switch to Tips tab in Insights panel
   */
  async switchToTipsTab(): Promise<void> {
    await this.insightsTipsTab.click();
  }

  /**
   * Open Insights panel in full screen mode
   */
  async openInsightsFullScreen(): Promise<void> {
    await this.insightsFullScreenButton.click();
  }

  /**
   * Check if Insights panel is in full screen mode
   */
  async isInsightsFullScreen(): Promise<boolean> {
    // When in full screen, the button has 'active' state
    const isActive = await this.insightsFullScreenButton.getAttribute('class');
    return isActive?.includes('active') ?? false;
  }

  /**
   * Toggle Redis tutorials folder (expand/collapse)
   */
  async toggleRedisTutorials(): Promise<void> {
    await this.insightsRedisTutorials.click();
  }

  /**
   * Check if Redis tutorials folder is expanded
   */
  async isRedisTutorialsExpanded(): Promise<boolean> {
    const expanded = await this.insightsRedisTutorials.getAttribute('aria-expanded');
    return expanded === 'true';
  }

  /**
   * Get tutorial folder by name
   */
  getTutorialFolder(name: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(`Folder ${name}`, 'i') });
  }

  /**
   * Click on a tutorial folder
   */
  async clickTutorialFolder(name: string): Promise<void> {
    await this.getTutorialFolder(name).click();
  }

  /**
   * Open keyboard shortcuts dialog from help menu
   */
  async openKeyboardShortcuts(): Promise<void> {
    await this.openHelpMenu();
    await this.keyboardShortcutsButton.click();
    await this.shortcutsDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Close keyboard shortcuts dialog
   */
  async closeKeyboardShortcuts(): Promise<void> {
    await this.shortcutsCloseButton.click();
    await this.shortcutsDialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Check if keyboard shortcuts dialog is open
   */
  async isKeyboardShortcutsOpen(): Promise<boolean> {
    return this.shortcutsDialog.isVisible();
  }

  /**
   * Get shortcut table rows for a section
   */
  getShortcutRows(section: 'desktop' | 'cli' | 'workbench'): Locator {
    const sectionLocator = {
      desktop: this.shortcutsDesktopSection,
      cli: this.shortcutsCliSection,
      workbench: this.shortcutsWorkbenchSection,
    }[section];

    // Get the table that follows the section header
    return sectionLocator.locator('..').locator('table tbody tr');
  }

  /**
   * Get shortcut count for a section
   */
  async getShortcutCount(section: 'desktop' | 'cli' | 'workbench'): Promise<number> {
    const rows = await this.getShortcutRows(section).all();
    return rows.length;
  }

  // ===== Live Recommendations Methods =====

  /**
   * Check if the no recommendations welcome screen is visible
   */
  async isNoRecommendationsScreenVisible(): Promise<boolean> {
    return this.noRecommendationsScreen.isVisible();
  }

  /**
   * Get a recommendation accordion by name
   */
  getRecommendation(name: string): Locator {
    return this.page.getByTestId(`${name}-accordion`);
  }

  /**
   * Check if a recommendation is visible
   */
  async isRecommendationVisible(name: string): Promise<boolean> {
    return this.getRecommendation(name).isVisible();
  }

  /**
   * Get count of visible recommendations
   */
  async getRecommendationCount(): Promise<number> {
    // Count elements with data-testid ending in '-accordion' in the tips panel
    const accordions = this.page.locator('[data-testid$="-accordion"]');
    return accordions.count();
  }

  /**
   * Click analyze database link to trigger recommendations
   */
  async clickAnalyzeDatabase(): Promise<void> {
    await this.analyzeDatabaseLink.click();
  }

  /**
   * Get the tips count from the tab label (e.g., "Tips (4)" returns 4)
   */
  async getTipsCount(): Promise<number> {
    const text = await this.insightsTipsTab.innerText();
    const match = text.match(/Tips\s*\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Toggle show hidden recommendations checkbox
   */
  async toggleShowHidden(): Promise<void> {
    await this.showHiddenCheckbox.click();
  }

  /**
   * Hide a recommendation by name
   */
  async hideRecommendation(name: string): Promise<void> {
    const hideButton = this.getRecommendation(name).getByRole('button', { name: 'hide/unhide tip' });
    await hideButton.click();
  }

  /**
   * Snooze a recommendation by name
   */
  async snoozeRecommendation(name: string): Promise<void> {
    const snoozeButton = this.getRecommendation(name).getByRole('button', { name: 'snooze tip' });
    await snoozeButton.click();
  }
}
