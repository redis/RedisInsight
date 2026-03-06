import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { redisConfig } from 'e2eSrc/config/databases';

/**
 * Connection Security Tests (TEST_PLAN.md: 1.1.1 Connection Security)
 *
 * Tests for adding databases with SSH tunneling, SNI, and TLS certificates.
 * These tests require the corresponding infrastructure in docker-compose.
 */
test.describe('Connection Security', () => {
  const createdDatabaseNames: string[] = [];

  test.beforeEach(async ({ databasesPage }) => {
    await databasesPage.goto();
  });

  test.afterEach(async ({ databasesPage }) => {
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

  test('should add database using SSH tunneling', async ({ databasesPage }) => {
    const sshTunnel = redisConfig.sshTunnel;
    const sshRedis = redisConfig.sshRedis;

    // Skip if any required SSH config value is missing
    test.skip(
      !sshTunnel.host || !sshTunnel.port || !sshTunnel.username || !sshRedis.host || !sshRedis.port,
      'SSH infrastructure not configured',
    );

    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build({
      host: sshRedis.host!,
      port: sshRedis.port!,
    });
    createdDatabaseNames.push(config.name);

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);

    await addDatabaseDialog.configureSsh({
      host: sshTunnel.host!,
      port: sshTunnel.port!,
      username: sshTunnel.username!,
      password: sshTunnel.password,
    });

    await addDatabaseDialog.generalTab.click();
    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();
    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test('should connect using SNI configuration', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const { caCert, clientCert } = redisConfig.createUniqueTlsCerts();
    const config = StandaloneConfigFactory.build({
      host: redisConfig.tlsRedis.host,
      port: redisConfig.tlsRedis.port,
    });
    createdDatabaseNames.push(config.name);

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);

    // Enable TLS first (SNI requires TLS)
    await addDatabaseDialog.configureTls({
      enabled: true,
      verifyServerCert: false,
      caCert,
      clientCert,
    });

    // Enable SNI with the TLS host as servername
    await addDatabaseDialog.enableSni(redisConfig.tlsRedis.host);

    await expect(addDatabaseDialog.sniCheckbox).toBeChecked();
    await expect(addDatabaseDialog.sniServernameInput).toHaveValue(redisConfig.tlsRedis.host);

    await addDatabaseDialog.generalTab.click();
    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();
    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });

  test('should connect with TLS using CA, client, and private key certificates', async ({ databasesPage }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const { caCert, clientCert } = redisConfig.createUniqueTlsCerts();
    const config = StandaloneConfigFactory.build({
      host: redisConfig.tlsRedis.host,
      port: redisConfig.tlsRedis.port,
    });
    createdDatabaseNames.push(config.name);

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);

    await addDatabaseDialog.configureTls({
      enabled: true,
      verifyServerCert: false,
      caCert,
      clientCert,
    });

    // Verify all TLS fields are populated
    await expect(addDatabaseDialog.useTlsCheckbox).toBeChecked();
    await expect(addDatabaseDialog.requiresClientAuthCheckbox).toBeChecked();

    await addDatabaseDialog.generalTab.click();
    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();
    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
  });
});
