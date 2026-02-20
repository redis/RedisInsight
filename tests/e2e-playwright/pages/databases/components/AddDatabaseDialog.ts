import { Page, Locator } from '@playwright/test';
import { AddDatabaseConfig, TlsConfig } from '../../../types';

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

  // Security tab
  readonly useTlsCheckbox: Locator;

  // TLS settings
  readonly verifyTlsCertCheckbox: Locator;
  readonly caCertDropdown: Locator;
  readonly caCertNameInput: Locator;
  readonly caCertTextarea: Locator;
  readonly requiresClientAuthCheckbox: Locator;
  readonly clientCertNameInput: Locator;
  readonly clientCertTextarea: Locator;
  readonly clientPrivateKeyTextarea: Locator;

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
    this.forceStandaloneCheckbox = page.getByTestId('forceStandalone');

    // Tabs
    this.generalTab = page.getByRole('tab', { name: 'General' });
    this.securityTab = page.getByRole('tab', { name: 'Security' });
    this.decompressionTab = page.getByRole('tab', { name: 'Decompression & Formatters' });

    // Security tab
    this.useTlsCheckbox = page.getByTestId('tls');

    // TLS settings
    this.verifyTlsCertCheckbox = page.getByRole('checkbox', { name: /verify tls certificate/i });
    this.caCertDropdown = page.getByTestId('select-ca-cert');
    this.caCertNameInput = page.getByTestId('qa-ca-cert');
    this.caCertTextarea = page.getByTestId('new-ca-cert');
    this.requiresClientAuthCheckbox = page.getByTestId('tls-required-checkbox');
    // Note: testid has typo in source code (tsl instead of tls)
    this.clientCertNameInput = page.getByTestId('new-tsl-cert-pair-name');
    this.clientCertTextarea = page.getByTestId('new-tls-client-cert');
    this.clientPrivateKeyTextarea = page.getByTestId('new-tls-client-cert-key');

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

  /**
   * Wait for dialog to close
   */
  async waitForHidden(): Promise<void> {
    await this.dialog.waitFor({ state: 'hidden' });
  }

  /**
   * Enable logical database selection with specified index
   */
  async setLogicalDatabase(index: number): Promise<void> {
    const isChecked = await this.selectLogicalDatabaseCheckbox.isChecked();
    if (!isChecked) {
      await this.selectLogicalDatabaseCheckbox.click();
    }
    await this.databaseIndexInput.fill(index.toString());
  }

  /**
   * Configure timeout setting
   */
  async setTimeout(seconds: number): Promise<void> {
    await this.timeoutInput.fill(seconds.toString());
  }

  /**
   * Enable force standalone connection
   */
  async setForceStandalone(enabled: boolean): Promise<void> {
    const isChecked = await this.forceStandaloneCheckbox.isChecked();
    if (enabled !== isChecked) {
      await this.forceStandaloneCheckbox.click();
    }
  }

  /**
   * Go to decompression tab and enable decompression
   */
  async enableDecompression(): Promise<void> {
    await this.decompressionTab.click();
    const isChecked = await this.enableDecompressionCheckbox.isChecked();
    if (!isChecked) {
      await this.enableDecompressionCheckbox.click();
    }
  }

  /**
   * Configure TLS settings on the Security tab
   * @param tlsConfig TLS configuration options
   */
  async configureTls(tlsConfig: TlsConfig): Promise<void> {
    // Go to Security tab
    await this.securityTab.click();

    // Enable TLS
    const isTlsChecked = await this.useTlsCheckbox.isChecked();
    if (tlsConfig.enabled && !isTlsChecked) {
      await this.useTlsCheckbox.click();
    }

    if (!tlsConfig.enabled) {
      return;
    }

    // Configure verify server cert if specified
    if (tlsConfig.verifyServerCert !== undefined) {
      const isVerifyChecked = await this.verifyTlsCertCheckbox.isChecked();
      if (tlsConfig.verifyServerCert !== isVerifyChecked) {
        await this.verifyTlsCertCheckbox.click();
      }
    }

    // Configure CA Certificate if provided
    if (tlsConfig.caCert) {
      await this.caCertDropdown.click();
      await this.page.getByRole('option', { name: 'Add new CA certificate' }).click();
      await this.caCertNameInput.fill(tlsConfig.caCert.name);
      await this.caCertTextarea.fill(tlsConfig.caCert.certificate);
    }

    // Configure Client Certificate if provided (mutual TLS)
    if (tlsConfig.clientCert) {
      // First check the "Requires TLS Client Authentication" checkbox
      const isClientAuthChecked = await this.requiresClientAuthCheckbox.isChecked();
      if (!isClientAuthChecked) {
        await this.requiresClientAuthCheckbox.click();
      }

      // Client cert dropdown should already show "Add new certificate"
      await this.clientCertNameInput.fill(tlsConfig.clientCert.name);
      await this.clientCertTextarea.fill(tlsConfig.clientCert.certificate);
      await this.clientPrivateKeyTextarea.fill(tlsConfig.clientCert.key);
    }
  }
}
