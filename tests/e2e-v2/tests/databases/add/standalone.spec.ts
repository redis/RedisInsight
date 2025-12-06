import { test, expect } from '../../../fixtures/base';
import { getStandaloneConfig } from '../../../test-data/databases';
import { Tags } from '../../../config';

test.describe('Add Database > Standalone', () => {
  test.beforeEach(async ({ databasesPage }) => {
    await databasesPage.goto();
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteTestDatabases();
  });

  test(`should add standalone database ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ databasesPage }) => {
    const config = getStandaloneConfig();

    await databasesPage.addDatabase(config);

    await expect(databasesPage.databaseList.getRow(config.name)).toBeVisible();
  });

  test(`should add database with no auth ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const config = getStandaloneConfig({
      username: undefined,
      password: undefined,
    });

    await databasesPage.addDatabase(config);

    await expect(databasesPage.databaseList.getRow(config.name)).toBeVisible();
  });

  test(`should add database with username only ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const config = getStandaloneConfig({
      username: 'default',
      password: undefined,
    });

    await databasesPage.addDatabase(config);

    await expect(databasesPage.databaseList.getRow(config.name)).toBeVisible();
  });

  test(`should add database with username and password ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const config = getStandaloneConfig({
      username: 'default',
      password: 'password',
    });

    await databasesPage.addDatabase(config);

    await expect(databasesPage.databaseList.getRow(config.name)).toBeVisible();
  });
});
