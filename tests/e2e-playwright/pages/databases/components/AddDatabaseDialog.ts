import { Page, Locator } from '@playwright/test';
import { AddDatabaseConfig } from '../../../types';

/**
 * Component Page Object for the Add Database Dialog
 * Handles all interactions with the add database form
 */
export class AddDatabaseDialog {
  readonly page: Page;

  // Dialog controls
  readonly connectionUrlInput: Locator;
  readonly connectionSettingsButton: Locator;
  readonly addDatabaseButton: Locator;

  // Connection settings form fields
  readonly databaseAliasInput: Locator;
  readonly hostInput: Locator;
  readonly portInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly addRedisDatabaseButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly testConnectionButton: Locator;
  readonly dialog: Locator;

  // Additional settings
  readonly timeoutInput: Locator;
  readonly selectLogicalDatabaseCheckbox: Locator;
  readonly databaseIndexInput: Locator;
  readonly forceStandaloneCheckbox: Locator;

  // Tabs
  readonly generalTab: Locator;
  readonly securityTab: Locator;
  readonly decompressionTab: Locator;

  // Decompression & Formatters tab
  readonly enableDecompressionCheckbox: Locator;
  readonly keyNameFormatDropdown: Locator;

  constructor(page: Page) {
    this.page = page;

    // Dialog controls
    this.dialog = page.getByRole('dialog', { name: /add database|connection settings/i });
    this.connectionUrlInput = page.getByPlaceholder(/redis:\/\//i);
    this.connectionSettingsButton = page.getByTestId('btn-connection-settings');
    this.addDatabaseButton = page.getByRole('button', {
      name: 'Add database',
      exact: true,
    });
    this.closeButton = page.getByRole('button', { name: 'close' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.testConnectionButton = page.getByRole('button', { name: 'Test Connection' });

    // Connection settings form
    this.databaseAliasInput = page.getByPlaceholder('Enter Database Alias');
    this.hostInput = page.getByPlaceholder('Enter Hostname / IP address / Connection URL');
    this.portInput = page.getByRole('spinbutton', { name: /port/i });
    this.usernameInput = page.getByPlaceholder('Enter Username');
    this.passwordInput = page.getByPlaceholder('Enter Password');
    this.addRedisDatabaseButton = page.getByRole('button', {
      name: 'Add Redis Database',
    });

    // Additional settings
    this.timeoutInput = page.getByRole('spinbutton', { name: /timeout/i });
    this.selectLogicalDatabaseCheckbox = page.getByTestId('showDb');
    this.databaseIndexInput = page.getByRole('spinbutton', { name: /database index/i });
    this.forceStandaloneCheckbox = page.getByRole('checkbox', { name: /force standalone/i });

    // Tabs
    this.generalTab = page.getByRole('tab', { name: 'General' });
    this.securityTab = page.getByRole('tab', { name: 'Security' });
    this.decompressionTab = page.getByRole('tab', { name: 'Decompression & Formatters' });

    // Decompression & Formatters tab
    this.enableDecompressionCheckbox = page.getByRole('checkbox', { name: /enable automatic data decompression/i });
    this.keyNameFormatDropdown = page.getByRole('combobox', { name: /key name format/i });
  }

  async openConnectionSettings(): Promise<void> {
    await this.connectionSettingsButton.click();
  }

  async fillForm(config: AddDatabaseConfig): Promise<void> {
    await this.databaseAliasInput.fill(config.name);
    await this.hostInput.fill(config.host);
    await this.portInput.fill(config.port.toString());

    if (config.username) {
      await this.usernameInput.fill(config.username);
    }

    if (config.password) {
      await this.passwordInput.fill(config.password);
    }
  }

  async submit(): Promise<void> {
    await this.addRedisDatabaseButton.click();
  }

  async addDatabase(config: AddDatabaseConfig): Promise<void> {
    await this.openConnectionSettings();
    await this.fillForm(config);
    await this.submit();
  }

  async addDatabaseByUrl(url: string): Promise<void> {
    await this.connectionUrlInput.fill(url);
    await this.addDatabaseButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async isVisible(): Promise<boolean> {
    return this.dialog.isVisible();
  }

  async testConnection(): Promise<void> {
    await this.testConnectionButton.click();
  }
}

