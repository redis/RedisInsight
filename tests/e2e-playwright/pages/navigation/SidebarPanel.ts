import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object for Navigation elements (sidebar, help menu, notifications, panels)
 * Extends BasePage since this handles global navigation elements
 */
export class SidebarPanel extends BasePage {
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
    this.keyboardShortcutsButton = page.getByText('Keyboard Shortcuts');
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

  async waitForLoad(): Promise<void> {
    await this.mainNavigation.waitFor({ state: 'visible' });
  }

  // ===== Help Menu Methods =====

  /**
   * Open help menu
   */
  async openHelpMenu(): Promise<void> {
    await this.helpMenuButton.click();
    await this.helpMenuDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Close help menu by pressing Escape
   */
  async closeHelpMenu(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.helpMenuDialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Check if help menu is open
   */
  async isHelpMenuOpen(): Promise<boolean> {
    return this.helpMenuDialog.isVisible();
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
}
