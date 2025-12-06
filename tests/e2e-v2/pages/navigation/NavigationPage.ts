import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object for Navigation elements (sidebar, help menu, notifications)
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

  // Notification center
  readonly notificationDialog: Locator;
  readonly notificationCenterTitle: Locator;
  readonly notificationItems: Locator;

  constructor(page: Page) {
    super(page);

    // Main navigation
    this.mainNavigation = page.getByRole('navigation', { name: 'Main navigation' });
    this.redisLogo = page.getByRole('link', { name: 'Redis Logo Dark Min' });
    this.cloudLink = page.getByRole('link', { name: 'cloud-db-icon' });
    this.notificationMenuButton = page.getByTestId('notification-menu-button');
    this.helpMenuButton = page.getByTestId('help-menu-button');
    this.settingsButton = page.getByTestId('settings-page-btn').or(
      page.locator('[data-testid="Settings page button"]')
    );
    this.githubLink = page.getByRole('link', { name: 'github-repo-icon' });

    // Help menu items
    this.helpMenuDialog = page.getByRole('dialog').filter({ hasText: 'Help Center' });
    this.provideFeedbackLink = page.getByRole('link', { name: /Provide Feedback/i });
    this.keyboardShortcutsButton = page.getByText('Keyboard Shortcuts');
    this.releaseNotesLink = page.getByRole('link', { name: 'Release Notes' });
    this.resetOnboardingButton = page.getByText('Reset Onboarding');

    // Notification center
    this.notificationDialog = page.getByRole('dialog').filter({ hasText: 'Notification Center' });
    this.notificationCenterTitle = page.getByText('Notification Center');
    this.notificationItems = this.notificationDialog.locator('[class*="notification"]');
  }

  /**
   * Navigate to home page
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForLoad();
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
    await this.settingsButton.click();
    await this.page.waitForURL('**/settings');
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
}

