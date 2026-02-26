import { Page, Locator } from '@playwright/test';

/**
 * Component Page Object for the Clone Database Dialog
 * Handles all interactions with the clone database form
 */
export class CloneDatabaseDialog {
  readonly page: Page;

  // Dialog controls
  readonly dialog: Locator;
  readonly closeButton: Locator;
  readonly backButton: Locator;
  readonly cancelButton: Locator;
  readonly cloneDatabaseButton: Locator;
  readonly testConnectionButton: Locator;

  // Connection settings form fields
  readonly databaseAliasInput: Locator;
  readonly hostInput: Locator;
  readonly portInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;

  // Additional settings
  readonly timeoutInput: Locator;
  readonly selectLogicalDatabaseCheckbox: Locator;
  readonly databaseIndexInput: Locator;
  readonly forceStandaloneCheckbox: Locator;

  // Tabs
  readonly generalTab: Locator;
  readonly securityTab: Locator;
  readonly decompressionTab: Locator;

  constructor(page: Page) {
    this.page = page;

    // Dialog controls
    this.dialog = page.getByRole('dialog', { name: /clone database/i });
    this.closeButton = page.getByRole('button', { name: 'close' });
    this.backButton = page.getByRole('button', { name: 'back' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.cloneDatabaseButton = page.getByRole('button', { name: 'Clone Database' });
    this.testConnectionButton = page.getByRole('button', { name: 'Test Connection' });

    // Connection settings form
    this.databaseAliasInput = page.getByPlaceholder('Enter Database Alias');
    this.hostInput = page.getByPlaceholder('Enter Hostname / IP address / Connection URL');
    this.portInput = page.getByRole('spinbutton', { name: /port/i });
    this.usernameInput = page.getByPlaceholder('Enter Username');
    this.passwordInput = page.getByPlaceholder('Enter Password');

    // Additional settings
    this.timeoutInput = page.getByRole('spinbutton', { name: /timeout/i });
    this.selectLogicalDatabaseCheckbox = page.getByTestId('showDb');
    this.databaseIndexInput = page.getByRole('spinbutton', { name: /database index/i });
    this.forceStandaloneCheckbox = page.getByRole('checkbox', { name: /force standalone/i });

    // Tabs
    this.generalTab = page.getByRole('tab', { name: 'General' });
    this.securityTab = page.getByRole('tab', { name: 'Security' });
    this.decompressionTab = page.getByRole('tab', { name: 'Decompression & Formatters' });
  }

  async isVisible(): Promise<boolean> {
    return this.dialog.isVisible();
  }

  async getDatabaseAlias(): Promise<string> {
    return this.databaseAliasInput.inputValue();
  }

  async getHost(): Promise<string> {
    return this.hostInput.inputValue();
  }

  async getPort(): Promise<string> {
    return this.portInput.inputValue();
  }

  async getUsername(): Promise<string> {
    return this.usernameInput.inputValue();
  }

  async getTimeout(): Promise<string> {
    return this.timeoutInput.inputValue();
  }

  async setDatabaseAlias(alias: string): Promise<void> {
    await this.databaseAliasInput.clear();
    await this.databaseAliasInput.fill(alias);
  }

  async submit(): Promise<void> {
    await this.cloneDatabaseButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async testConnection(): Promise<void> {
    await this.testConnectionButton.click();
  }
}
