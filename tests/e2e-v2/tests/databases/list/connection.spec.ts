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

test.describe.serial('Database List > Edit Database', () => {
  let databaseId: string;
  let databaseName: string;
  let uniquePrefix: string;

  test.beforeAll(async ({ apiHelper }) => {
    uniquePrefix = `test-edit-${Date.now().toString(36)}`;
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

  test(`should open edit database dialog ${Tags.REGRESSION}`, async ({
    databasesPage,
    page,
  }) => {
    await databasesPage.goto();
    await databasesPage.databaseList.search(databaseName);

    // Click controls button for the database
    const controlsButton = page.getByTestId(`controls-button-${databaseId}`);
    await controlsButton.click();

    // Click edit button
    const editButton = page.getByTestId(`edit-instance-${databaseId}`);
    await editButton.click();

    // Verify edit dialog opens
    const editDialog = page.getByRole('dialog', { name: 'Edit Database' });
    await expect(editDialog).toBeVisible();

    // Verify database alias field has current name
    const aliasInput = page.getByRole('textbox', { name: /Database alias/i });
    await expect(aliasInput).toHaveValue(databaseName);
  });

  test(`should edit database alias ${Tags.REGRESSION}`, async ({
    databasesPage,
    page,
  }) => {
    await databasesPage.goto();
    await databasesPage.databaseList.search(databaseName);

    // Open edit dialog
    const controlsButton = page.getByTestId(`controls-button-${databaseId}`);
    await controlsButton.click();
    const editButton = page.getByTestId(`edit-instance-${databaseId}`);
    await editButton.click();

    // Change the alias
    const newAlias = `${databaseName}-edited`;
    const aliasInput = page.getByRole('textbox', { name: /Database alias/i });
    await aliasInput.clear();
    await aliasInput.fill(newAlias);

    // Apply changes
    await page.getByRole('button', { name: 'Apply Changes' }).click();

    // Verify dialog closes
    await expect(page.getByRole('dialog', { name: 'Edit Database' })).not.toBeVisible();

    // Verify the new name appears in the list
    await databasesPage.databaseList.search(newAlias);
    await expect(page.getByText(newAlias)).toBeVisible();

    // Update databaseName for cleanup
    databaseName = newAlias;
  });

  test(`should cancel edit database ${Tags.REGRESSION}`, async ({
    databasesPage,
    page,
  }) => {
    await databasesPage.goto();
    await databasesPage.databaseList.search(databaseName);

    // Open edit dialog
    const controlsButton = page.getByTestId(`controls-button-${databaseId}`);
    await controlsButton.click();
    const editButton = page.getByTestId(`edit-instance-${databaseId}`);
    await editButton.click();

    // Verify dialog is open
    await expect(page.getByRole('dialog', { name: 'Edit Database' })).toBeVisible();

    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify dialog closes
    await expect(page.getByRole('dialog', { name: 'Edit Database' })).not.toBeVisible();
  });
});

test.describe.serial('Database List > Clone Database', () => {
  let databaseId: string;
  let clonedDatabaseId: string;
  let databaseName: string;
  let uniquePrefix: string;

  test.beforeAll(async ({ apiHelper }) => {
    uniquePrefix = `test-clone-${Date.now().toString(36)}`;
    databaseName = uniquePrefix;
    const config = getStandaloneConfig({ name: databaseName });
    const db = await apiHelper.createDatabase(config);
    databaseId = db.id;
  });

  test.afterAll(async ({ apiHelper }) => {
    if (databaseId) {
      await apiHelper.deleteDatabase(databaseId);
    }
    if (clonedDatabaseId) {
      await apiHelper.deleteDatabase(clonedDatabaseId);
    }
  });

  test(`should open clone database dialog ${Tags.REGRESSION}`, async ({
    databasesPage,
    page,
  }) => {
    await databasesPage.goto();
    await databasesPage.databaseList.search(databaseName);

    // Open edit dialog first
    const controlsButton = page.getByTestId(`controls-button-${databaseId}`);
    await controlsButton.click();
    const editButton = page.getByTestId(`edit-instance-${databaseId}`);
    await editButton.click();

    // Click Clone Connection button
    await page.getByTestId('clone-db-btn').click();

    // Verify dialog shows Clone Database title
    await expect(page.getByText('Clone Database').first()).toBeVisible();

    // Verify Clone Database button is visible (submit button)
    await expect(page.getByRole('button', { name: 'Clone Database' })).toBeVisible();
  });

  test(`should clone database with new name ${Tags.REGRESSION}`, async ({
    databasesPage,
    page,
    apiHelper,
  }) => {
    await databasesPage.goto();
    await databasesPage.databaseList.search(databaseName);

    // Open edit dialog
    const controlsButton = page.getByTestId(`controls-button-${databaseId}`);
    await controlsButton.click();
    const editButton = page.getByTestId(`edit-instance-${databaseId}`);
    await editButton.click();

    // Click Clone Connection
    await page.getByTestId('clone-db-btn').click();

    // Change the alias for the clone
    const cloneName = `${databaseName}-clone`;
    const aliasInput = page.getByRole('textbox', { name: /Database alias/i });
    await aliasInput.clear();
    await aliasInput.fill(cloneName);

    // Click Clone Database button
    await page.getByRole('button', { name: 'Clone Database' }).click();

    // Wait for dialog to close (success)
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });

    // Verify the cloned database exists in the list
    await databasesPage.goto();
    await databasesPage.databaseList.search(cloneName);
    await expect(page.getByText(cloneName)).toBeVisible();

    // Get the cloned database ID for cleanup
    const databases = await apiHelper.getDatabases();
    const clonedDb = databases.find((db: { name: string }) => db.name === cloneName);
    if (clonedDb) {
      clonedDatabaseId = clonedDb.id;
    }
  });
});

