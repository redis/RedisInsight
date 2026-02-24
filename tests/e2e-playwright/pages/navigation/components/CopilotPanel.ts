import { Page, Locator } from '@playwright/test';

/**
 * Copilot Panel component
 * Handles the Copilot side panel functionality
 */
export class CopilotPanel {
  readonly page: Page;
  readonly trigger: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;
  readonly fullScreenButton: Locator;
  readonly googleSignIn: Locator;
  readonly githubSignIn: Locator;
  readonly ssoSignIn: Locator;
  readonly termsCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.trigger = page.getByTestId('copilot-trigger');
    this.title = page.getByText('Redis Copilot', { exact: true });
    this.closeButton = page.getByTestId('close-copilot-btn');
    this.fullScreenButton = page.getByTestId('fullScreen-copilot-btn');
    this.googleSignIn = page.getByRole('button', { name: /Google Signin/i });
    this.githubSignIn = page.getByRole('button', { name: /Github Github/i });
    this.ssoSignIn = page.getByRole('button', { name: /Sso SSO/i });
    this.termsCheckbox = page.getByRole('checkbox', { name: /By signing up/i });
  }

  /**
   * Open Copilot panel
   */
  async open(): Promise<void> {
    await this.trigger.click();
    await this.title.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Close Copilot panel
   */
  async close(): Promise<void> {
    await this.closeButton.click();
    await this.title.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Check if Copilot panel is open
   */
  async isOpen(): Promise<boolean> {
    return this.title.isVisible();
  }
}
