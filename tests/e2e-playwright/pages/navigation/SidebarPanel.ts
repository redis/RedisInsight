import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { HelpMenu } from './components/HelpMenu';
import { NotificationCenter } from './components/NotificationCenter';

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
