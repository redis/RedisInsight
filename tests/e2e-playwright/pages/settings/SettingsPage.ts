import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object for Settings page
 * Extends BasePage (not InstancePage) since this is a standalone page
 */
export class SettingsPage extends BasePage {
  // Page title
  readonly pageTitle: Locator;

  // Accordion section headers
  readonly generalSectionHeader: Locator;
  readonly privacySectionHeader: Locator;
  readonly workbenchSectionHeader: Locator;
  readonly redisCloudSectionHeader: Locator;
  readonly advancedSectionHeader: Locator;

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
  readonly keysToScanValue: Locator;
  readonly keysToScanInput: Locator;
  readonly keysToScanApplyButton: Locator;

  // Redis Cloud settings
  readonly apiUserKeysText: Locator;
  readonly removeApiKeysButton: Locator;
  readonly autodiscoverButton: Locator;
  readonly createCloudDbButton: Locator;

  constructor(page: Page) {
    super(page);

    // Page title
    this.pageTitle = page.locator('[data-testid="settings-page-title"]').or(page.getByText('Settings').first());

    // The header toggles via its nested collapse trigger button.
    this.generalSectionHeader = page.locator('[data-test-subj="accordion-appearance"] button[aria-expanded]');
    this.privacySectionHeader = page.locator('[data-test-subj="accordion-privacy-settings"] button[aria-expanded]');
    this.workbenchSectionHeader = page.locator('[data-test-subj="accordion-workbench-settings"] button[aria-expanded]');
    this.redisCloudSectionHeader = page.locator('[data-test-subj="accordion-cloud-settings"] button[aria-expanded]');
    this.advancedSectionHeader = page.locator('[data-test-subj="accordion-advanced-settings"] button[aria-expanded]');

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
    this.timezoneDropdown = page.getByTestId('format-timezone-form').getByRole('combobox');
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
    this.pipelineApplyButton = this.pipelineCommandsInput.locator('xpath=ancestor::form').getByTestId('apply-btn');

    // Advanced settings
    this.advancedWarning = page.getByRole('alert').filter({ hasText: /Advanced settings/i });
    this.keysToScanText = page.getByRole('heading', { name: 'Keys to Scan in List view' });
    this.keysToScanValue = page.getByTestId(/keys-to-scan-value/);
    this.keysToScanInput = page.getByTestId('keys-to-scan-input');
    this.keysToScanApplyButton = page.getByTestId('apply-btn');

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
    await this.generalSectionHeader.click();
    await this.themeDropdown.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Expand Privacy settings section
   */
  async expandPrivacy(): Promise<void> {
    await this.privacySectionHeader.click();
    await this.usageDataSwitch.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Expand Workbench settings section
   */
  async expandWorkbench(): Promise<void> {
    await this.workbenchSectionHeader.click();
    await this.editorCleanupSwitch.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Expand Advanced settings section
   */
  async expandAdvanced(): Promise<void> {
    await this.advancedSectionHeader.click();
    await this.advancedWarning.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Check if General section is expanded
   */
  async isGeneralExpanded(): Promise<boolean> {
    const expanded = await this.generalSectionHeader.getAttribute('aria-expanded');
    return expanded === 'true';
  }

  /**
   * Check if Privacy section is expanded
   */
  async isPrivacyExpanded(): Promise<boolean> {
    const expanded = await this.privacySectionHeader.getAttribute('aria-expanded');
    return expanded === 'true';
  }

  /**
   * Check if usage data (analytics) is enabled
   */
  async isUsageDataEnabled(): Promise<boolean> {
    const checked = await this.usageDataSwitch.getAttribute('aria-checked');
    return checked === 'true';
  }

  /**
   * Toggle usage data switch and wait for the settings PATCH to complete
   */
  async toggleUsageData(): Promise<void> {
    await Promise.all([
      this.page.waitForResponse((resp) => resp.url().includes('/api/settings') && resp.request().method() === 'PATCH'),
      this.usageDataSwitch.click(),
    ]);
  }

  /**
   * Set up route interception for telemetry requests (send-event, send-page).
   * Returns an array that accumulates intercepted request URLs.
   * Intercepted requests are fulfilled with 204 to prevent real telemetry.
   */
  async interceptTelemetryRequests(): Promise<string[]> {
    const urls: string[] = [];
    await this.page.route('**/analytics/send-*', (route) => {
      urls.push(route.request().url());
      route.fulfill({ status: 204 });
    });
    return urls;
  }

  /**
   * Check if Workbench section is expanded
   */
  async isWorkbenchExpanded(): Promise<boolean> {
    const expanded = await this.workbenchSectionHeader.getAttribute('aria-expanded');
    return expanded === 'true';
  }

  /**
   * Check if Advanced section is expanded
   */
  async isAdvancedExpanded(): Promise<boolean> {
    const expanded = await this.advancedSectionHeader.getAttribute('aria-expanded');
    return expanded === 'true';
  }

  /**
   * Expand Redis Cloud settings section
   */
  async expandRedisCloud(): Promise<void> {
    await this.redisCloudSectionHeader.click();
    await this.apiUserKeysText.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Check if Redis Cloud section is expanded
   */
  async isRedisCloudExpanded(): Promise<boolean> {
    const expanded = await this.redisCloudSectionHeader.getAttribute('aria-expanded');
    return expanded === 'true';
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

  /**
   * Get current keys-to-scan value
   */
  async getKeysToScan(): Promise<string> {
    return (await this.keysToScanValue.textContent()) || '';
  }

  /**
   * Set keys-to-scan value and apply
   */
  async setKeysToScan(value: string): Promise<void> {
    await this.keysToScanValue.click();
    await this.keysToScanInput.waitFor({ state: 'visible' });
    await this.keysToScanInput.clear();
    await this.keysToScanInput.fill(value);
    await this.keysToScanApplyButton.click();
  }
}
