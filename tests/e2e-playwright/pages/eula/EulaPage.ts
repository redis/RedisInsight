import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page object for EULA & Privacy Settings popup
 * This popup appears on first launch or after agreements reset
 * Extends BasePage since this is a standalone page
 */
export class EulaPage extends BasePage {
  // Dialog elements
  readonly dialog: Locator;
  readonly dialogTitle: Locator;

  // Switches
  readonly useRecommendedSettingsSwitch: Locator;
  readonly usageDataSwitch: Locator;
  readonly encryptionSwitch: Locator;
  readonly notificationsSwitch: Locator;
  readonly eulaSwitch: Locator;

  // Submit button
  readonly submitButton: Locator;

  // Links
  readonly privacyPolicyLink: Locator;
  readonly subscriptionAgreementLink: Locator;
  readonly serverSideLicenseLink: Locator;

  constructor(page: Page) {
    super(page);

    // Dialog
    this.dialog = page.getByTestId('consents-settings-popup');
    this.dialogTitle = this.dialog.locator('text=EULA and Privacy settings');

    // Switches - using data-testid pattern from the UI
    this.useRecommendedSettingsSwitch = page.getByTestId('switch-option-recommended');
    this.usageDataSwitch = page.getByTestId('switch-option-analytics');
    this.encryptionSwitch = page.getByTestId('switch-option-encryption');
    this.notificationsSwitch = page.getByTestId('switch-option-notifications');
    this.eulaSwitch = page.getByTestId('switch-option-eula');

    // Submit button
    this.submitButton = page.getByTestId('btn-submit');

    // Links
    this.privacyPolicyLink = page.getByRole('link', { name: 'Privacy Policy' });
    this.subscriptionAgreementLink = page.getByRole('link', {
      name: 'Redis Enterprise Software Subscription Agreement',
    });
    this.serverSideLicenseLink = page.getByRole('link', { name: 'Server Side Public License' });
  }

  async goto(): Promise<void> {
    await this.gotoHome();
  }

  async waitForLoad(): Promise<void> {
    await this.dialog.waitFor({ state: 'visible' });
  }

  /**
   * Check if EULA popup is visible
   */
  async isVisible(): Promise<boolean> {
    try {
      await expect(this.dialog).toBeVisible({ timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for EULA popup to appear
   */
  async waitForPopup(timeout = 10000): Promise<void> {
    await expect(this.dialog).toBeVisible({ timeout });
  }

  /**
   * Accept EULA with default settings (only EULA checked)
   */
  async acceptEula(): Promise<void> {
    await this.eulaSwitch.click();
    await this.submitButton.click();
    await expect(this.dialog).not.toBeVisible();
  }

  /**
   * Accept EULA with recommended settings
   */
  async acceptWithRecommendedSettings(): Promise<void> {
    await this.useRecommendedSettingsSwitch.click();
    await this.eulaSwitch.click();
    await this.submitButton.click();
    await expect(this.dialog).not.toBeVisible();
  }

  /**
   * Accept EULA with custom settings
   */
  async acceptWithCustomSettings(options: {
    analytics?: boolean;
    encryption?: boolean;
    notifications?: boolean;
  }): Promise<void> {
    if (options.analytics) {
      await this.usageDataSwitch.click();
    }
    if (options.encryption === false) {
      // Encryption is on by default, click to disable
      await this.encryptionSwitch.click();
    }
    if (options.notifications) {
      await this.notificationsSwitch.click();
    }

    // Always need to accept EULA
    await this.eulaSwitch.click();
    await this.submitButton.click();
    await expect(this.dialog).not.toBeVisible();
  }

  /**
   * Check if submit button is enabled
   */
  async isSubmitEnabled(): Promise<boolean> {
    return this.submitButton.isEnabled();
  }

  /**
   * Check if a switch is checked
   */
  async isSwitchChecked(switchLocator: Locator): Promise<boolean> {
    const ariaChecked = await switchLocator.getAttribute('aria-checked');
    return ariaChecked === 'true';
  }
}
