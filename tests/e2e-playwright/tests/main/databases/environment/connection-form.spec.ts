import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { Environment } from 'e2eSrc/types';

/**
 * RI-8190 — E2E coverage for prod vs non-prod modes.
 *
 * Connection-form scenarios:
 *  - Production env in the form → PROD badge in DB list + header (scenario 1)
 *  - Development env in the form → DEV label in DB list + header (scenario 8)
 *  - Unspecified (default) → no badge or label rendered (scenario 9)
 */
test.use({ featureFlags: { 'dev-prodMode': true } });

test.describe('Environment classification — connection form', () => {
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

  test('Production environment shows PROD badge in list and header', async ({ databasesPage, browserPage, page }) => {
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
    const listBadge = databaseList.getRow(config.name).getByText('PROD', { exact: true });
    await expect(listBadge).toBeVisible();

    // Connect and verify badge in the instance header
    await databaseList.connect(config.name);
    await browserPage.waitForLoad();

    const headerSlot = page.getByTestId('instance-header-environment');
    await expect(headerSlot).toBeVisible();
    await expect(headerSlot.getByTestId('environment-badge-production')).toBeVisible();
    await expect(headerSlot).toContainText('PROD');

    await browserPage.goToDatabases();
  });

  test('Development environment shows DEV label in list and header', async ({ databasesPage, browserPage, page }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    const config = StandaloneConfigFactory.build({ environment: Environment.Development });
    createdDatabaseNames.push(config.name);

    await databasesPage.openAddDatabaseDialog();
    await addDatabaseDialog.openConnectionSettings();
    await addDatabaseDialog.fillForm(config);
    await addDatabaseDialog.submit();
    await addDatabaseDialog.waitForHidden();

    await databaseList.expectDatabaseVisible(config.name, { searchFirst: true });
    const listBadge = databaseList.getRow(config.name).getByText('DEV', { exact: true });
    await expect(listBadge).toBeVisible();

    await databaseList.connect(config.name);
    await browserPage.waitForLoad();

    const headerSlot = page.getByTestId('instance-header-environment');
    await expect(headerSlot.getByTestId('environment-badge-development')).toBeVisible();
    await expect(headerSlot).toContainText('DEV');

    await browserPage.goToDatabases();
  });

  test('Unspecified environment renders no badge or label', async ({ databasesPage, browserPage, page }) => {
    const { addDatabaseDialog, databaseList } = databasesPage;
    // Default form value is "Unspecified" — explicitly omit `environment` to assert default.
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
    // Slot is rendered, but contains no badge for Unspecified.
    await expect(headerSlot.getByTestId('environment-badge-production')).toHaveCount(0);
    await expect(headerSlot.getByTestId('environment-badge-development')).toHaveCount(0);

    await browserPage.goToDatabases();
  });
});
