import { test, expect } from '../../../fixtures/base';
import { getClusterConfig } from '../../../test-data/databases';
import { Tags } from '../../../config';

test.describe('Add Database > Cluster', () => {
  test.beforeEach(async ({ databasesPage }) => {
    await databasesPage.goto();
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteTestDatabases();
  });

  test(`should add cluster database ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ databasesPage }) => {
    const config = getClusterConfig();

    await databasesPage.addDatabase(config);

    await expect(databasesPage.databaseList.getRow(config.name)).toBeVisible();
  });
});
