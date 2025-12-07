import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { faker } from '@faker-js/faker';
import { BrowserPage } from '../../../pages';

test.describe('Browser > Stream Consumer Groups', () => {
  let databaseId: string;
  let streamKey: string;

  test.beforeAll(async ({ apiHelper }) => {
    // Get or create a database for testing
    const databases = await apiHelper.getDatabases();
    if (databases.length === 0) {
      const db = await apiHelper.createDatabase({
        name: 'test-stream-consumer-groups',
        host: '127.0.0.1',
        port: 6379,
      });
      databaseId = db.id;
    } else {
      databaseId = databases[0].id;
    }
  });

  test.beforeEach(async ({ page, cliPanel }) => {
    // Create a unique stream key for each test
    streamKey = `test-stream-cg-${faker.string.alphanumeric(8)}`;

    // Navigate to browser page
    await page.goto(`/${databaseId}/browser`);
    await page.waitForLoadState('networkidle');

    // Create a stream key using CLI
    await cliPanel.open();
    await cliPanel.executeCommand(`XADD ${streamKey} * field1 value1`);
    await cliPanel.close();
  });

  test.afterEach(async ({ cliPanel }) => {
    // Clean up the stream key
    await cliPanel.open();
    await cliPanel.executeCommand(`DEL ${streamKey}`);
    await cliPanel.close();
  });

  test(`should open Consumer Groups tab for stream key ${Tags.SMOKE}`, async ({
    page,
    createBrowserPage,
  }) => {
    const browserPage: BrowserPage = createBrowserPage(databaseId);

    // Search for the stream key
    await browserPage.keyList.searchKeys(streamKey);

    // Click on the stream key (handle both list view and tree view)
    await browserPage.keyList.clickKey(streamKey);

    // Verify Stream Data tab is visible
    await expect(page.getByRole('tab', { name: 'Stream Data' })).toBeVisible();

    // Click on Consumer Groups tab
    await page.getByRole('tab', { name: 'Consumer Groups' }).click();

    // Verify Consumer Groups tab is selected
    await expect(
      page.getByRole('tab', { name: 'Consumer Groups' }),
    ).toHaveAttribute('aria-selected', 'true');

    // Verify empty state message
    await expect(
      page.getByText('Your Key has no Consumer Groups available'),
    ).toBeVisible();
  });

  test(`should create consumer group with Entry ID "$" (new messages only) ${Tags.SMOKE}`, async ({
    page,
    createBrowserPage,
  }) => {
    const browserPage: BrowserPage = createBrowserPage(databaseId);
    const groupName = `test-group-${faker.string.alphanumeric(6)}`;

    // Search for the stream key
    await browserPage.keyList.searchKeys(streamKey);

    // Click on the stream key (handle both list view and tree view)
    await browserPage.keyList.clickKey(streamKey);

    // Click on Consumer Groups tab
    await page.getByRole('tab', { name: 'Consumer Groups' }).click();

    // Click New Group button
    await page.getByTestId('add-key-value-items-btn').click();

    // Fill in group name
    await page.getByRole('textbox', { name: 'Enter Group Name*' }).fill(groupName);

    // Verify ID field has default value "$"
    const idField = page.getByRole('textbox', { name: 'ID*' });
    await expect(idField).toHaveValue('$');

    // Click Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify group is created and visible in the list (consumer groups are in a grid)
    await expect(page.getByRole('gridcell', { name: groupName })).toBeVisible();
  });

  test(`should create consumer group with Entry ID "0" (from beginning) ${Tags.SMOKE}`, async ({
    page,
    createBrowserPage,
  }) => {
    const browserPage: BrowserPage = createBrowserPage(databaseId);
    const groupName = `test-group-${faker.string.alphanumeric(6)}`;

    // Search for the stream key
    await browserPage.keyList.searchKeys(streamKey);

    // Click on the stream key (handle both list view and tree view)
    await browserPage.keyList.clickKey(streamKey);

    // Click on Consumer Groups tab
    await page.getByRole('tab', { name: 'Consumer Groups' }).click();

    // Click New Group button
    await page.getByTestId('add-key-value-items-btn').click();

    // Fill in group name
    await page.getByRole('textbox', { name: 'Enter Group Name*' }).fill(groupName);

    // Change ID to "0" (from beginning)
    const idField = page.getByRole('textbox', { name: 'ID*' });
    await idField.clear();
    await idField.fill('0');

    // Click Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify group is created and visible in the list (consumer groups are in a grid)
    await expect(page.getByRole('gridcell', { name: groupName })).toBeVisible();
  });

  test(`should cancel creating consumer group ${Tags.REGRESSION}`, async ({
    page,
    createBrowserPage,
  }) => {
    const browserPage: BrowserPage = createBrowserPage(databaseId);
    const groupName = `test-group-${faker.string.alphanumeric(6)}`;

    // Search for the stream key
    await browserPage.keyList.searchKeys(streamKey);

    // Click on the stream key (handle both list view and tree view)
    await browserPage.keyList.clickKey(streamKey);

    // Click on Consumer Groups tab
    await page.getByRole('tab', { name: 'Consumer Groups' }).click();

    // Click New Group button
    await page.getByTestId('add-key-value-items-btn').click();

    // Fill in group name
    await page.getByRole('textbox', { name: 'Enter Group Name*' }).fill(groupName);

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify empty state message is still visible (group was not created)
    await expect(
      page.getByText('Your Key has no Consumer Groups available'),
    ).toBeVisible();
  });
});

