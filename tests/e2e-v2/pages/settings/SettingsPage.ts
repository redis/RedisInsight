import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object for Settings page
 */
export class SettingsPage extends BasePage {
  // Page title
  readonly pageTitle: Locator;

  // Accordion buttons
  readonly generalButton: Locator;
  readonly privacyButton: Locator;
  readonly workbenchButton: Locator;
  readonly redisCloudButton: Locator;
  readonly advancedButton: Locator;

  // General settings
  readonly themeDropdown: Locator;
  readonly notificationSwitch: Locator;
  readonly dateFormatRadioPreselected: Locator;
  readonly dateFormatRadioCustom: Locator;
  readonly dateFormatDropdown: Locator;
  readonly timezoneDropdown: Locator;
  readonly datePreview: Locator;

  // Privacy settings
  readonly usageDataSwitch: Locator;
  readonly privacyPolicyLink: Locator;

  // Workbench settings
  readonly editorCleanupSwitch: Locator;
  readonly pipelineCommandsText: Locator;

  // Advanced settings
  readonly advancedWarning: Locator;
  readonly keysToScanText: Locator;

  // Redis Cloud settings
  readonly apiUserKeysText: Locator;
  readonly removeApiKeysButton: Locator;
  readonly autodiscoverButton: Locator;
  readonly createCloudDbButton: Locator;

  constructor(page: Page) {
    super(page);

    // Page title
    this.pageTitle = page.locator('[data-testid="settings-page-title"]').or(page.getByText('Settings').first());

    // Accordion buttons
    this.generalButton = page.getByRole('button', { name: 'General' });
    this.privacyButton = page.getByRole('button', { name: 'Privacy' });
    this.workbenchButton = page.getByRole('button', { name: 'Workbench' });
    this.redisCloudButton = page.getByRole('button', { name: 'Redis Cloud', exact: true });
    this.advancedButton = page.getByRole('button', { name: 'Advanced' });

    // General settings
    this.themeDropdown = page.getByRole('combobox', { name: /color theme/i });
    this.notificationSwitch = page.locator('[data-testid="switch-option-notification"]').or(
      page.getByRole('switch').filter({ hasText: /notification/i })
    );
    this.dateFormatRadioPreselected = page.getByRole('radio', { name: 'Pre-selected formats' });
    this.dateFormatRadioCustom = page.getByRole('radio', { name: 'Custom' });
    this.dateFormatDropdown = page.locator('[data-testid="select-datetime-format"]').or(
      page.getByRole('combobox').filter({ hasText: /HH:mm/i })
    );
    this.timezoneDropdown = page.locator('[data-testid="select-timezone"]').or(
      page.getByRole('combobox').filter({ hasText: /Match System/i })
    );
    this.datePreview = page.getByRole('textbox').filter({ hasText: /\d{2}:\d{2}:\d{2}/ });

    // Privacy settings
    this.usageDataSwitch = page.locator('[data-testid="switch-option-analytics"]').or(
      page.getByRole('switch').filter({ hasText: /Usage Data/i })
    );
    this.privacyPolicyLink = page.getByRole('link', { name: 'Privacy Policy' });

    // Workbench settings
    this.editorCleanupSwitch = page.locator('[data-testid="switch-workbench-cleanup"]').or(
      page.getByRole('switch').filter({ hasText: /Clear the Editor/i })
    );
    this.pipelineCommandsText = page.getByText(/Commands in pipeline/i);

    // Advanced settings
    this.advancedWarning = page.getByRole('alert').filter({ hasText: /Advanced settings/i });
    this.keysToScanText = page.getByRole('heading', { name: 'Keys to Scan in List view' });

    // Redis Cloud settings
    this.apiUserKeysText = page.getByText('API user keys', { exact: true });
    this.removeApiKeysButton = page.getByRole('button', { name: 'Remove all API keys' });
    this.autodiscoverButton = page.getByRole('button', { name: 'Autodiscover' });
    this.createCloudDbButton = page.getByRole('button', { name: 'Create Redis Cloud database' });
  }

  /**
   * Navigate to Settings page
   */
  async goto(): Promise<void> {
    await this.page.goto('/settings');
    await this.waitForLoad();
  }

  /**
   * Expand General settings section
   */
  async expandGeneral(): Promise<void> {
    await this.generalButton.click();
    await this.themeDropdown.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Expand Privacy settings section
   */
  async expandPrivacy(): Promise<void> {
    await this.privacyButton.click();
    await this.usageDataSwitch.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Expand Workbench settings section
   */
  async expandWorkbench(): Promise<void> {
    await this.workbenchButton.click();
    await this.editorCleanupSwitch.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Expand Advanced settings section
   */
  async expandAdvanced(): Promise<void> {
    await this.advancedButton.click();
    await this.advancedWarning.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Check if General section is expanded
   */
  async isGeneralExpanded(): Promise<boolean> {
    const expanded = await this.generalButton.getAttribute('aria-expanded');
    return expanded === 'true';
  }

  /**
   * Check if Privacy section is expanded
   */
  async isPrivacyExpanded(): Promise<boolean> {
    const expanded = await this.privacyButton.getAttribute('aria-expanded');
    return expanded === 'true';
  }

  /**
   * Check if Workbench section is expanded
   */
  async isWorkbenchExpanded(): Promise<boolean> {
    const expanded = await this.workbenchButton.getAttribute('aria-expanded');
    return expanded === 'true';
  }

  /**
   * Check if Advanced section is expanded
   */
  async isAdvancedExpanded(): Promise<boolean> {
    const expanded = await this.advancedButton.getAttribute('aria-expanded');
    return expanded === 'true';
  }

  /**
   * Expand Redis Cloud settings section
   */
  async expandRedisCloud(): Promise<void> {
    await this.redisCloudButton.click();
    await this.apiUserKeysText.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Check if Redis Cloud section is expanded
   */
  async isRedisCloudExpanded(): Promise<boolean> {
    const expanded = await this.redisCloudButton.getAttribute('aria-expanded');
    return expanded === 'true';
  }
}

