import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object for Settings page
 * Extends BasePage (not InstancePage) since this is a standalone page
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
  readonly customDateFormatInput: Locator;
  readonly customDateFormatSaveButton: Locator;
  readonly timezoneDropdown: Locator;
  readonly datePreview: Locator;

  // Privacy settings
  readonly usageDataSwitch: Locator;
  readonly privacyPolicyLink: Locator;

  // Workbench settings
  readonly editorCleanupSwitch: Locator;
  readonly pipelineCommandsText: Locator;
  readonly pipelineCommandsValue: Locator;
  readonly pipelineCommandsInput: Locator;
  readonly pipelineApplyButton: Locator;

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

    // Accordion headings (clicking the heading label toggles the section)
    this.generalButton = page.getByRole('heading', { name: 'General' });
    this.privacyButton = page.getByRole('heading', { name: 'Privacy' });
    this.workbenchButton = page.getByRole('heading', { name: 'Workbench' });
    this.redisCloudButton = page.getByRole('heading', { name: 'Redis Cloud', exact: true });
    this.advancedButton = page.getByRole('heading', { name: 'Advanced' });

    // General settings
    this.themeDropdown = page.getByRole('combobox', { name: /color theme/i });
    this.notificationSwitch = page
      .locator('div')
      .filter({ hasText: /^Show notification$/ })
      .locator('..')
      .getByRole('switch');
    this.dateFormatRadioPreselected = page.getByRole('radio', { name: 'Pre-selected formats' });
    this.dateFormatRadioCustom = page.getByRole('radio', { name: 'Custom' });
    this.dateFormatDropdown = page
      .locator('[data-testid="select-datetime-format"]')
      .or(page.getByRole('combobox').filter({ hasText: /HH:mm/i }));
    this.customDateFormatInput = page.getByTestId('custom-datetime-input');
    this.customDateFormatSaveButton = page.getByTestId('datetime-custom-btn');
    this.timezoneDropdown = page
      .locator('[data-testid="select-timezone"]')
      .or(page.getByRole('combobox').filter({ hasText: /Match System/i }));
    this.datePreview = page.getByTestId('data-preview');

    // Privacy settings
    this.usageDataSwitch = page
      .locator('[data-testid="switch-option-analytics"]')
      .or(page.getByRole('switch').filter({ hasText: /Usage Data/i }));
    this.privacyPolicyLink = page.getByRole('link', { name: 'Privacy Policy' });

    // Workbench settings
    const workbenchSection = page.getByTestId('accordion-workbench-settings');

    this.editorCleanupSwitch = page
      .locator('[data-testid="switch-workbench-cleanup"]')
      .or(page.getByRole('switch').filter({ hasText: /Clear the Editor/i }));
    this.pipelineCommandsText = workbenchSection.getByText(/Commands in pipeline/i);
    this.pipelineCommandsValue = workbenchSection.getByTestId('pipeline-bunch-value');
    this.pipelineCommandsInput = workbenchSection.getByTestId('pipeline-bunch-input');
    this.pipelineApplyButton = this.pipelineCommandsInput
      .locator('xpath=ancestor::form')
      .getByTestId('apply-btn');

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
    await this.page.getByTestId('settings-page-btn').click();
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.pageTitle.waitFor({ state: 'visible' });
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
    const state = await this.page.locator('[data-test-subj="accordion-appearance"]').getAttribute('data-state');
    return state === 'open';
  }

  /**
   * Check if Privacy section is expanded
   */
  async isPrivacyExpanded(): Promise<boolean> {
    const state = await this.page.locator('[data-test-subj="accordion-privacy-settings"]').getAttribute('data-state');
    return state === 'open';
  }

  /**
   * Check if Workbench section is expanded
   */
  async isWorkbenchExpanded(): Promise<boolean> {
    const state = await this.page.locator('[data-test-subj="accordion-workbench-settings"]').getAttribute('data-state');
    return state === 'open';
  }

  /**
   * Check if Advanced section is expanded
   */
  async isAdvancedExpanded(): Promise<boolean> {
    const state = await this.page.locator('[data-test-subj="accordion-advanced-settings"]').getAttribute('data-state');
    return state === 'open';
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
    const state = await this.page.locator('[data-test-subj="accordion-cloud-settings"]').getAttribute('data-state');
    return state === 'open';
  }

  /**
   * Set custom date format
   */
  async setCustomDateFormat(format: string): Promise<void> {
    await this.dateFormatRadioCustom.click();
    await this.customDateFormatInput.waitFor({ state: 'visible' });
    await this.customDateFormatInput.clear();
    await this.customDateFormatInput.fill(format);
    await this.customDateFormatSaveButton.click();
  }

  /**
   * Get date preview value
   */
  async getDatePreviewValue(): Promise<string> {
    return await this.datePreview.inputValue();
  }

  /**
   * Get current theme value
   */
  async getCurrentTheme(): Promise<string> {
    return (await this.themeDropdown.textContent()) || '';
  }

  /**
   * Change theme
   */
  async changeTheme(theme: 'Light Theme' | 'Dark Theme' | 'System Theme'): Promise<void> {
    await this.themeDropdown.click();
    await this.page.getByRole('option', { name: theme }).click();
  }

  /**
   * Toggle notification switch
   */
  async toggleNotifications(): Promise<void> {
    await this.notificationSwitch.click();
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    const checked = await this.notificationSwitch.getAttribute('aria-checked');
    return checked === 'true';
  }

  /**
   * Toggle editor cleanup switch
   */
  async toggleEditorCleanup(): Promise<void> {
    await this.editorCleanupSwitch.click();
  }

  /**
   * Check if editor cleanup is enabled (switch is on)
   */
  async isEditorCleanupEnabled(): Promise<boolean> {
    const checked = await this.editorCleanupSwitch.getAttribute('aria-checked');
    return checked === 'true';
  }

  /**
   * Get current pipeline commands value (displayed number)
   */
  async getPipelineCommandsValue(): Promise<string> {
    return (await this.pipelineCommandsValue.textContent()) ?? '';
  }

  /**
   * Set pipeline commands value and apply (enters edit mode, fills input, clicks Apply)
   */
  async setPipelineCommandsAndApply(value: number): Promise<void> {
    await this.pipelineCommandsValue.click();
    await this.pipelineCommandsInput.waitFor({ state: 'visible' });
    await this.pipelineCommandsInput.clear();
    await this.pipelineCommandsInput.fill(String(value));
    await this.pipelineApplyButton.click();
  }
}
