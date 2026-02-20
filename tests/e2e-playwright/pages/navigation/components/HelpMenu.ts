import { Page, Locator } from '@playwright/test';

/**
 * Component for Help Menu interactions
 * Handles the Help Center dropdown and its menu items
 */
export class HelpMenu {
  readonly page: Page;

  // Help menu trigger and dialog
  readonly helpMenuButton: Locator;
  readonly helpMenuDialog: Locator;

  // Menu items
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

  constructor(page: Page) {
    this.page = page;

    // Help menu trigger and dialog
    this.helpMenuButton = page.getByTestId('help-menu-button');
    this.helpMenuDialog = page.getByRole('dialog').filter({ hasText: 'Help Center' });

    // Menu items
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
  }

  /**
   * Open help menu
   */
  async open(): Promise<void> {
    await this.helpMenuButton.click();
    await this.helpMenuDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Close help menu by pressing Escape
   */
  async close(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.helpMenuDialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Check if help menu is open
   */
  async isOpen(): Promise<boolean> {
    return this.helpMenuDialog.isVisible();
  }

  /**
   * Open keyboard shortcuts dialog from help menu
   */
  async openKeyboardShortcuts(): Promise<void> {
    if (!(await this.isOpen())) {
      await this.open();
    }
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
