import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig } from '../../../test-data/databases';

/**
 * Database Connection Tests
 *
 * Tests for connecting to databases from the database list
 */
test.describe.serial('Database List > Connection', () => {
  let databaseId: string;
  let databaseName: string;
  let uniquePrefix: string;

  test.beforeAll(async ({ apiHelper }) => {
    uniquePrefix = `test-connect-${Date.now().toString(36)}`;
    databaseName = uniquePrefix;
    const config = getStandaloneConfig({ name: databaseName });
    const db = await apiHelper.createDatabase(config);
    databaseId = db.id;
  });

  test.afterAll(async ({ apiHelper }) => {
    if (databaseId) {
      await apiHelper.deleteDatabase(databaseId);
    }
  });

  test(`should connect to database by clicking on row ${Tags.CRITICAL}`, async ({
    databasesPage,
    page,
  }) => {
    await databasesPage.goto();

    // Search for the database first
    await databasesPage.databaseList.search(databaseName);

    // Click on the database row to connect
    await databasesPage.databaseList.connect(databaseName);

    // Should navigate to browser page
    await expect(page).toHaveURL(/\/browser$/);

    // Should show the database name in the header
    await expect(page.getByText(databaseName)).toBeVisible({ timeout: 10000 });
  });

  test(`should show browser page after connection ${Tags.CRITICAL}`, async ({
    databasesPage,
    page,
  }) => {
    await databasesPage.goto();
    await databasesPage.databaseList.search(databaseName);
    await databasesPage.databaseList.connect(databaseName);

    // Verify browser page elements are visible
    await expect(page.getByRole('tab', { name: 'Browse' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('tab', { name: 'Workbench' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Pub/Sub' })).toBeVisible();
  });

  test(`should navigate back to database list ${Tags.REGRESSION}`, async ({
    databasesPage,
    page,
  }) => {
    await databasesPage.goto();
    await databasesPage.databaseList.search(databaseName);
    await databasesPage.databaseList.connect(databaseName);

    // Wait for browser page
    await expect(page).toHaveURL(/\/browser$/);

    // Click on "Databases" button to navigate back
    await page.getByRole('button', { name: 'Databases' }).click();

    // Should navigate back to database list
    await expect(page).toHaveURL(/\/$/);
  });

  test(`should show database info after connection ${Tags.REGRESSION}`, async ({
    databasesPage,
    page,
  }) => {
    await databasesPage.goto();
    await databasesPage.databaseList.search(databaseName);
    await databasesPage.databaseList.connect(databaseName);

    // Wait for browser page to load
    await expect(page).toHaveURL(/\/browser$/);

    // Should show database stats in header - look for memory indicator (e.g., "4 MB")
    // The stats are shown in the top bar with icons
    await expect(page.getByText(/\d+ [KMG]?B/)).toBeVisible({ timeout: 10000 });
  });
});

