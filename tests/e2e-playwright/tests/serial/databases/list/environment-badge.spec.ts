import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { Environment } from 'e2eSrc/types';

/**
 * End-to-end: per-database environment selection in the connection form,
 * verified against the rendered badge in the databases list and the
 * instance header after connecting.
 */
test.describe('Database List — environment badge', () => {
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

  test.describe('Production DB', () => {
    test('should show PROD badge in databases list and instance header', async ({
      databasesPage,
      browserPage,
      page,
    }) => {
      const { addDatabaseDialog, databaseList } = databasesPage;
      const config = StandaloneConfigFactory.build({ environment: Environment.Production });
      createdDatabaseNames.push(config.name);

      await databasesPage.openAddDatabaseDialog();
      await addDatabaseDialog.openConnectionSettings();
      await addDatabaseDialog.fillForm(config);
      await addDatabaseDialog.submit();
      await addDatabaseDialog.waitForHidden();

      // Badge in the database list row
      await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
      await expect(databaseList.getRow(config.name).getByText('PROD', { exact: true })).toBeVisible();

      // Badge in the instance header after connecting
      await databaseList.connect(config.name);
      await browserPage.waitForLoad();

      const headerSlot = page.getByTestId('instance-header-environment');
      await expect(headerSlot.getByTestId('environment-badge-production')).toBeVisible();
      await expect(headerSlot).toContainText('PROD');

      await browserPage.goToDatabases();
    });
  });

  test.describe('Development DB', () => {
    test('should show DEV label in databases list and instance header', async ({
      databasesPage,
      browserPage,
      page,
    }) => {
      const { addDatabaseDialog, databaseList } = databasesPage;
      const config = StandaloneConfigFactory.build({ environment: Environment.Development });
      createdDatabaseNames.push(config.name);

      await databasesPage.openAddDatabaseDialog();
      await addDatabaseDialog.openConnectionSettings();
      await addDatabaseDialog.fillForm(config);
      await addDatabaseDialog.submit();
      await addDatabaseDialog.waitForHidden();

      await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
      await expect(databaseList.getRow(config.name).getByText('DEV', { exact: true })).toBeVisible();

      await databaseList.connect(config.name);
      await browserPage.waitForLoad();

      const headerSlot = page.getByTestId('instance-header-environment');
      await expect(headerSlot.getByTestId('environment-badge-development')).toBeVisible();
      await expect(headerSlot).toContainText('DEV');

      await browserPage.goToDatabases();
    });
  });

  test.describe('Unspecified DB', () => {
    test('should not render an environment badge in list or header', async ({ databasesPage, browserPage, page }) => {
      const { addDatabaseDialog, databaseList } = databasesPage;
      // Default form value is "Unspecified" — explicitly omit `environment` to assert that.
      const config = StandaloneConfigFactory.build();
      createdDatabaseNames.push(config.name);

      await databasesPage.openAddDatabaseDialog();
      await addDatabaseDialog.openConnectionSettings();
      await addDatabaseDialog.fillForm(config);
      await addDatabaseDialog.submit();
      await addDatabaseDialog.waitForHidden();

      await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
      const row = databaseList.getRow(config.name);
      await expect(row.getByText('PROD', { exact: true })).toHaveCount(0);
      await expect(row.getByText('DEV', { exact: true })).toHaveCount(0);

      await databaseList.connect(config.name);
      await browserPage.waitForLoad();

      const headerSlot = page.getByTestId('instance-header-environment');
      await expect(headerSlot.getByTestId('environment-badge-production')).toHaveCount(0);
      await expect(headerSlot.getByTestId('environment-badge-development')).toHaveCount(0);

      await browserPage.goToDatabases();
    });
  });
});
