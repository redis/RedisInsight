import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { HelpMenu } from './components/HelpMenu';
import { NotificationCenter } from './components/NotificationCenter';
import { CopilotPanel } from './components/CopilotPanel';

/**
 * Page Object for Navigation elements (sidebar, help menu, notifications, panels)
 * Extends BasePage since this handles global navigation elements
 */
export class SidebarPanel extends BasePage {
  // Main navigation
  readonly mainNavigation: Locator;
  readonly cloudLink: Locator;
  readonly settingsButton: Locator;
  readonly githubLink: Locator;

  // Help menu component
  readonly helpMenu: HelpMenu;

  // Notification center component
  readonly notificationCenter: NotificationCenter;

  // Copilot panel component
  readonly copilotPanel: CopilotPanel;

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
    this.cloudLink = page.getByTestId('create-cloud-db-link');
    this.settingsButton = page
      .getByTestId('settings-page-btn')
      .or(page.locator('[data-testid="Settings page button"]'));
    this.githubLink = page.getByTestId('github-repo-btn');

    // Help menu component
    this.helpMenu = new HelpMenu(page);

    // Notification center component
    this.notificationCenter = new NotificationCenter(page);

    // Copilot panel component
    this.copilotPanel = new CopilotPanel(page);

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
