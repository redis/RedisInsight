import { test, expect } from '../../../fixtures/base';
import { getStandaloneConfig, TEST_DB_PREFIX } from '../../../test-data/databases';
import { Tags } from '../../../config';

// Run tests serially to avoid parallel test interference with shared database state
test.describe.serial('Add Database > Standalone', () => {
  // Use unique names per test run to avoid parallel test interference
  let uniquePrefix: string;

  test.beforeEach(async ({ databasesPage }) => {
    // Generate unique prefix for this test run
    const uniqueId = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    uniquePrefix = `${TEST_DB_PREFIX}add-${uniqueId}`;
    await databasesPage.goto();
  });

  test.afterEach(async ({ apiHelper }) => {
    // Only delete databases created by this specific test (using unique prefix)
    await apiHelper.deleteDatabasesByPattern(new RegExp(`^${uniquePrefix}`));
  });

  test(`should add standalone database ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ databasesPage }) => {
    const config = getStandaloneConfig({ name: `${uniquePrefix}-standalone` });

    await databasesPage.addDatabase(config);

    // Search for the database to handle pagination
    await databasesPage.databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test(`should add database with no auth ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const config = getStandaloneConfig({
      name: `${uniquePrefix}-noauth`,
      username: undefined,
      password: undefined,
    });

    await databasesPage.addDatabase(config);

    // Search for the database to handle pagination
    await databasesPage.databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test(`should add database with username only ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const config = getStandaloneConfig({
      name: `${uniquePrefix}-useronly`,
      username: 'default',
      password: undefined,
    });

    await databasesPage.addDatabase(config);

    // Search for the database to handle pagination
    await databasesPage.databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test(`should add database with username and password ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const config = getStandaloneConfig({
      name: `${uniquePrefix}-userpass`,
      username: 'default',
      password: 'password',
    });

    await databasesPage.addDatabase(config);

    // Search for the database to handle pagination
    await databasesPage.databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test(`should cancel add database ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const config = getStandaloneConfig({
      name: `${uniquePrefix}-cancel`,
    });

    // Open dialog and fill form
    await databasesPage.openAddDatabaseDialog();
    await databasesPage.addDatabaseDialog.openConnectionSettings();
    await databasesPage.addDatabaseDialog.fillForm(config);

    // Cancel the dialog
    await databasesPage.addDatabaseDialog.cancel();

    // Verify dialog is closed
    const isVisible = await databasesPage.addDatabaseDialog.isVisible();
    expect(isVisible).toBe(false);

    // Verify database was not added
    await databasesPage.databaseList.search(config.name);
    const exists = await databasesPage.databaseList.exists(config.name);
    expect(exists).toBe(false);
  });

  test(`should test connection before saving ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const config = getStandaloneConfig({
      name: `${uniquePrefix}-testconn`,
    });

    // Open dialog and fill form
    await databasesPage.openAddDatabaseDialog();
    await databasesPage.addDatabaseDialog.openConnectionSettings();
    await databasesPage.addDatabaseDialog.fillForm(config);

    // Test connection
    await databasesPage.addDatabaseDialog.testConnection();

    // Wait for success message
    await databasesPage.page.waitForSelector('text=Connection is successful', { timeout: 10000 });
  });

  test(`should validate required fields ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    // Open dialog and go to connection settings
    await databasesPage.openAddDatabaseDialog();
    await databasesPage.addDatabaseDialog.openConnectionSettings();

    // Clear the host field
    await databasesPage.addDatabaseDialog.hostInput.clear();

    // Verify the Add Redis Database button is disabled
    await expect(databasesPage.addDatabaseDialog.addRedisDatabaseButton).toBeDisabled();

    // Verify the Test Connection button is also disabled
    await expect(databasesPage.addDatabaseDialog.testConnectionButton).toBeDisabled();
  });

  test(`should add database via Connection URL ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    // Use a different port to create a unique database entry
    // Note: This will fail to connect but will still add the database entry
    const connectionUrl = 'redis://default@127.0.0.1:6379';

    // Open dialog and add via URL
    await databasesPage.openAddDatabaseDialog();
    await databasesPage.addDatabaseDialog.addDatabaseByUrl(connectionUrl);

    // Wait for success toast
    await databasesPage.page.waitForSelector('text=Database has been added', { timeout: 10000 });
  });

  test(`should configure timeout setting ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    // Open dialog and go to connection settings
    await databasesPage.openAddDatabaseDialog();
    await databasesPage.addDatabaseDialog.openConnectionSettings();

    // Verify default timeout is 30 seconds
    await expect(databasesPage.addDatabaseDialog.timeoutInput).toHaveValue('30');

    // Change timeout to 60 seconds
    await databasesPage.addDatabaseDialog.timeoutInput.fill('60');
    await expect(databasesPage.addDatabaseDialog.timeoutInput).toHaveValue('60');
  });

  test(`should select logical database ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    // Open dialog and go to connection settings
    await databasesPage.openAddDatabaseDialog();
    await databasesPage.addDatabaseDialog.openConnectionSettings();

    // Verify database index input is not visible initially
    await expect(databasesPage.addDatabaseDialog.databaseIndexInput).not.toBeVisible();

    // Enable logical database selection
    await databasesPage.addDatabaseDialog.selectLogicalDatabaseCheckbox.click();

    // Verify database index input is now visible
    await expect(databasesPage.addDatabaseDialog.databaseIndexInput).toBeVisible();

    // Set database index to 1
    await databasesPage.addDatabaseDialog.databaseIndexInput.fill('1');
    await expect(databasesPage.addDatabaseDialog.databaseIndexInput).toHaveValue('1');
  });

  test(`should force standalone connection ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    // Open dialog and go to connection settings
    await databasesPage.openAddDatabaseDialog();
    await databasesPage.addDatabaseDialog.openConnectionSettings();

    // Verify force standalone checkbox is visible and unchecked
    await expect(databasesPage.addDatabaseDialog.forceStandaloneCheckbox).toBeVisible();
    await expect(databasesPage.addDatabaseDialog.forceStandaloneCheckbox).not.toBeChecked();

    // Enable force standalone connection
    await databasesPage.addDatabaseDialog.forceStandaloneCheckbox.click();
    await expect(databasesPage.addDatabaseDialog.forceStandaloneCheckbox).toBeChecked();
  });

  test(`should enable automatic data decompression ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    // Open dialog and go to connection settings
    await databasesPage.openAddDatabaseDialog();
    await databasesPage.addDatabaseDialog.openConnectionSettings();

    // Go to Decompression & Formatters tab
    await databasesPage.addDatabaseDialog.decompressionTab.click();

    // Verify decompression checkbox is visible and unchecked
    await expect(databasesPage.addDatabaseDialog.enableDecompressionCheckbox).toBeVisible();
    await expect(databasesPage.addDatabaseDialog.enableDecompressionCheckbox).not.toBeChecked();

    // Enable automatic data decompression
    await databasesPage.addDatabaseDialog.enableDecompressionCheckbox.click();
    await expect(databasesPage.addDatabaseDialog.enableDecompressionCheckbox).toBeChecked();
  });

  test(`should configure key name format ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    // Open dialog and go to connection settings
    await databasesPage.openAddDatabaseDialog();
    await databasesPage.addDatabaseDialog.openConnectionSettings();

    // Go to Decompression & Formatters tab
    await databasesPage.addDatabaseDialog.decompressionTab.click();

    // Verify key name format dropdown is visible with default value
    await expect(databasesPage.addDatabaseDialog.keyNameFormatDropdown).toBeVisible();
    await expect(databasesPage.addDatabaseDialog.keyNameFormatDropdown).toContainText('Unicode');
  });

  test(`should open Connection settings from URL form ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    // Open dialog (starts with URL form)
    await databasesPage.openAddDatabaseDialog();

    // Verify we're on the URL form
    await expect(databasesPage.addDatabaseDialog.connectionUrlInput).toBeVisible();

    // Click Connection settings button
    await databasesPage.addDatabaseDialog.openConnectionSettings();

    // Verify we're now on the Connection settings form
    await expect(databasesPage.addDatabaseDialog.hostInput).toBeVisible();
    await expect(databasesPage.addDatabaseDialog.portInput).toBeVisible();
    await expect(databasesPage.addDatabaseDialog.databaseAliasInput).toBeVisible();
  });
});
