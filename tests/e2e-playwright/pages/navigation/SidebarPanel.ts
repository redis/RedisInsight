import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { HelpMenu } from './components/HelpMenu';

/**
 * Page Object for Navigation elements (sidebar, help menu, notifications, panels)
 * Extends BasePage since this handles global navigation elements
 */
export class SidebarPanel extends BasePage {
  // Main navigation
  readonly mainNavigation: Locator;
  readonly cloudLink: Locator;
  readonly notificationMenuButton: Locator;
  readonly settingsButton: Locator;
  readonly githubLink: Locator;

  // Help menu component
  readonly helpMenu: HelpMenu;

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

    // Main navigation (redisLogo inherited from BasePage)
    this.mainNavigation = page.getByRole('navigation', { name: 'Main navigation' });
    this.cloudLink = page.getByRole('link', { name: 'cloud-db-icon' });
    this.notificationMenuButton = page.getByTestId('notification-menu-button');
    this.settingsButton = page
      .getByTestId('settings-page-btn')
      .or(page.locator('[data-testid="Settings page button"]'));
    this.githubLink = page.getByRole('link', { name: 'github-repo-icon' });

    // Help menu component
    this.helpMenu = new HelpMenu(page);

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
}
