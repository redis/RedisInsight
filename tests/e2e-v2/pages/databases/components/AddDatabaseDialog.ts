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

  constructor(page: Page) {
    this.page = page;

    // Dialog controls
    this.connectionUrlInput = page.getByPlaceholder(/redis:\/\//i);
    this.connectionSettingsButton = page.getByTestId('btn-connection-settings');
    this.addDatabaseButton = page.getByRole('button', {
      name: 'Add database',
      exact: true,
    });

    // Connection settings form
    this.databaseAliasInput = page.getByPlaceholder('Enter Database Alias');
    this.hostInput = page.getByPlaceholder('Enter Hostname / IP address / Connection URL');
    this.portInput = page.getByRole('spinbutton', { name: /port/i });
    this.usernameInput = page.getByPlaceholder('Enter Username');
    this.passwordInput = page.getByPlaceholder('Enter Password');
    this.addRedisDatabaseButton = page.getByRole('button', {
      name: 'Add Redis Database',
    });
  }

  /**
   * Switch to connection settings mode (manual form)
   */
  async openConnectionSettings(): Promise<void> {
    await this.connectionSettingsButton.click();
  }

  /**
   * Fill the database connection form
   */
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

  /**
   * Submit the form to add the database
   */
  async submit(): Promise<void> {
    await this.addRedisDatabaseButton.click();
  }

  /**
   * Add a database using the connection settings form
   * This is the full flow: open settings -> fill form -> submit
   */
  async addDatabase(config: AddDatabaseConfig): Promise<void> {
    await this.openConnectionSettings();
    await this.fillForm(config);
    await this.submit();
  }

  /**
   * Add a database using connection URL
   */
  async addDatabaseByUrl(url: string): Promise<void> {
    await this.connectionUrlInput.fill(url);
    await this.addDatabaseButton.click();
  }
}
