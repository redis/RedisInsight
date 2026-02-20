import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory, ClusterConfigFactory } from 'e2eSrc/test-data/databases';
import { redisConfig } from 'e2eSrc/config/databases';

/**
 * Add Database Tests (TEST_PLAN.md: 1.1 Add Database)
 *
 * Tests for adding databases via the Connection Settings form.
 * Tests use the existing Redis instances configured in docker-compose.
 */
test.describe('Add Database', () => {
  // Track databases created in tests for cleanup
  const createdDatabaseNames: string[] = [];

  test.beforeEach(async ({ databasesPage }) => {
    await databasesPage.goto();
  });

  test.afterEach(async ({ databasesPage }) => {
    // Clean up databases created during tests (via UI)
    for (const name of createdDatabaseNames) {
      try {
        if (await databasesPage.databaseList.exists(name)) {
          await databasesPage.databaseList.delete(name);
        }
      } catch {
        // Ignore cleanup errors
      }
    }
    createdDatabaseNames.length = 0;
  });

  test('should add standalone database', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build();
    createdDatabaseNames.push(config.name);

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);
    await addDatabaseDialog.submit();

    // Wait for success and verify database in list
    await addDatabaseDialog.waitForHidden();
    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test('should add database with no auth', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build({
      username: undefined,
      password: undefined,
    });
    createdDatabaseNames.push(config.name);

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();

    // Fill only required fields without auth
    await addDatabaseDialog.databaseAliasInput.fill(config.name);
    await addDatabaseDialog.hostInput.fill(config.host);
    await addDatabaseDialog.portInput.fill(config.port.toString());
    await addDatabaseDialog.usernameInput.clear();

    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();
    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test('should add database with username only', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build({
      username: 'default',
      password: undefined,
    });
    createdDatabaseNames.push(config.name);

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.databaseAliasInput.fill(config.name);
    await addDatabaseDialog.hostInput.fill(config.host);
    await addDatabaseDialog.portInput.fill(config.port.toString());
    await addDatabaseDialog.usernameInput.fill(config.username!);

    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();
    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test('should add database with username and password', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build({
      username: 'default',
      password: 'testpassword',
    });
    createdDatabaseNames.push(config.name);

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);

    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();
    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test('should add cluster database', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = ClusterConfigFactory.build();
    createdDatabaseNames.push(config.name);

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);
    await addDatabaseDialog.submit();

    await addDatabaseDialog.waitForHidden();
    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test('should validate required fields', async ({ databasesPage }) => {
    const { addDatabaseDialog } = databasesPage;

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();

    // Clear required fields
    await addDatabaseDialog.databaseAliasInput.clear();
    await addDatabaseDialog.hostInput.clear();
    await addDatabaseDialog.portInput.clear();

    // The submit button should be disabled when required fields are empty
    await expect(addDatabaseDialog.addRedisDatabaseButton).toBeDisabled();

    // Dialog should still be visible
    await expect(addDatabaseDialog.dialog).toBeVisible();
  });

  test('should test connection before saving', async ({ databasesPage }) => {
    const { addDatabaseDialog } = databasesPage;
    const config = StandaloneConfigFactory.build();

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);

    // Test connection
    await addDatabaseDialog.testConnection();

    // Should show success message
    await expect(databasesPage.page.getByText(/connection is successful/i)).toBeVisible({ timeout: 10000 });
  });

  test('should cancel add database', async ({ databasesPage }) => {
    const { addDatabaseDialog } = databasesPage;

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();

    // Fill some data
    await addDatabaseDialog.databaseAliasInput.fill('test-cancel-db');

    // Cancel
    await addDatabaseDialog.cancel();

    // Dialog should close
    await expect(addDatabaseDialog.dialog).not.toBeVisible();
  });

  test('should add database via Connection URL', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build();
    const connectionUrl = `redis://${config.host}:${config.port}`;
    createdDatabaseNames.push(`${config.host}:${config.port}`);

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.connectionUrlInput.fill(connectionUrl);
    await addDatabaseDialog.addDatabaseButton.click();

    await addDatabaseDialog.waitForHidden();
    await databaseList.expectDatabaseVisible(`${config.host}:${config.port}`, { searchFirst: true });
  });

  test('should open Connection settings from URL form', async ({ databasesPage }) => {
    const { addDatabaseDialog } = databasesPage;

    await databasesPage.openAddDatabaseDialog();

    // Verify URL form is shown
    await expect(addDatabaseDialog.connectionUrlInput).toBeVisible();

    // Click connection settings
    await addDatabaseDialog.openConnectionSettings();

    // Verify connection settings form is shown
    await expect(addDatabaseDialog.databaseAliasInput).toBeVisible();
    await expect(addDatabaseDialog.hostInput).toBeVisible();
    await expect(addDatabaseDialog.portInput).toBeVisible();
  });

  test('should configure timeout setting', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build();
    createdDatabaseNames.push(config.name);
    const customTimeout = 60;

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);
    await addDatabaseDialog.setTimeout(customTimeout);

    // Verify timeout value
    await expect(addDatabaseDialog.timeoutInput).toHaveValue(customTimeout.toString());

    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();
    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test('should select logical database', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build();
    createdDatabaseNames.push(config.name);
    const dbIndex = 1;

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);
    await addDatabaseDialog.setLogicalDatabase(dbIndex);

    // Verify database index is set
    await expect(addDatabaseDialog.databaseIndexInput).toHaveValue(dbIndex.toString());

    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();
    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test('should display logical database index in database list', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build();
    createdDatabaseNames.push(config.name);
    const dbIndex = 2;

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);
    await addDatabaseDialog.setLogicalDatabase(dbIndex);
    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();

    // Search for the database
    await databaseList.search(config.name);

    // Verify database index is shown in the list (format: "name [db2]")
    const row = databaseList.getRow(config.name);
    await expect(row).toContainText(`[db${dbIndex}]`);
  });

  test('should display logical database index in database header', async ({ databasesPage, browserPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build();
    createdDatabaseNames.push(config.name);
    const dbIndex = 3;

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);
    await addDatabaseDialog.setLogicalDatabase(dbIndex);
    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();

    // Connect to the database
    await databaseList.search(config.name);
    await databaseList.connect(config.name);

    // Verify database index is shown in the header (format: "db3")
    await expect(browserPage.instanceHeader.logicalDatabaseButton).toContainText(`db${dbIndex}`);

    // Navigate back to databases list
    await browserPage.gotoHome();
  });

  test('should display logical database index in edit form', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build();
    createdDatabaseNames.push(config.name);
    const dbIndex = 4;

    // Create database with logical database
    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);
    await addDatabaseDialog.setLogicalDatabase(dbIndex);
    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();

    // Open edit dialog
    await databaseList.search(config.name);
    await databaseList.edit(config.name);

    // Verify edit dialog opens with the correct title showing db index
    // The edit dialog title includes the database name with db index annotation
    const editDialog = databasesPage.page.getByRole('dialog', { name: /edit database/i });
    await expect(editDialog).toBeVisible();

    // Verify the logical database index is displayed in the edit dialog
    // The db index is shown as "Database Index: X" in the connection info section
    await expect(editDialog).toContainText(`Database Index:${dbIndex}`);

    // Close the dialog
    await databasesPage.page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('should enable force standalone connection', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build();
    createdDatabaseNames.push(config.name);

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);
    await addDatabaseDialog.setForceStandalone(true);

    // Verify checkbox is checked
    await expect(addDatabaseDialog.forceStandaloneCheckbox).toBeChecked();

    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();
    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test('should enable automatic data decompression', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build();
    createdDatabaseNames.push(config.name);

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);
    await addDatabaseDialog.enableDecompression();

    // Verify checkbox is checked
    await expect(addDatabaseDialog.enableDecompressionCheckbox).toBeChecked();

    // Go back to General tab and submit
    await addDatabaseDialog.generalTab.click();
    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();
    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test('should configure key name format', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build();
    createdDatabaseNames.push(config.name);

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);

    // Go to Decompression & Formatters tab and change key name format
    await addDatabaseDialog.decompressionTab.click();
    await addDatabaseDialog.keyNameFormatDropdown.click();
    // Select HEX option (available options: Unicode, HEX)
    await databasesPage.page.getByRole('option', { name: 'HEX' }).click();

    // Verify the value changed
    await expect(addDatabaseDialog.keyNameFormatDropdown).toContainText('HEX');

    // Go back to General tab and submit
    await addDatabaseDialog.generalTab.click();
    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();
    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test('should add database with TLS/SSL', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build({
      host: redisConfig.tlsRedis.host,
      port: redisConfig.tlsRedis.port,
    });
    createdDatabaseNames.push(config.name);

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);

    // Configure TLS with CA and client certificates
    await addDatabaseDialog.configureTls({
      enabled: true,
      verifyServerCert: false,
      caCert: redisConfig.getTlsCaCert(),
      clientCert: redisConfig.getTlsClientCert(),
    });

    // Go back to General tab and submit
    await addDatabaseDialog.generalTab.click();
    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();
    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });
});
