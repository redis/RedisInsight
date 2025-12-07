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

  test(`should create consumer group with custom Entry ID ${Tags.REGRESSION}`, async ({
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

    // Use a custom Entry ID - "0-1" is a valid format that means "from the first entry"
    // This is different from "0" (which means from the beginning) and "$" (new messages only)
    const customEntryId = '0-1';
    const idField = page.getByRole('textbox', { name: 'ID*' });
    await idField.clear();
    await idField.fill(customEntryId);

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

  test(`should delete consumer group ${Tags.REGRESSION}`, async ({
    page,
    createBrowserPage,
    cliPanel,
  }) => {
    const browserPage: BrowserPage = createBrowserPage(databaseId);
    const groupName = `test-group-${faker.string.alphanumeric(6)}`;

    // Create a consumer group using CLI
    await cliPanel.open();
    await cliPanel.executeCommand(
      `XGROUP CREATE ${streamKey} ${groupName} 0 MKSTREAM`,
    );
    await cliPanel.close();

    // Search for the stream key
    await browserPage.keyList.searchKeys(streamKey);

    // Click on the stream key
    await browserPage.keyList.clickKey(streamKey);

    // Click on Consumer Groups tab
    await page.getByRole('tab', { name: 'Consumer Groups' }).click();

    // Verify consumer group is visible
    await expect(page.getByRole('gridcell', { name: groupName })).toBeVisible();

    // Click the remove button for the consumer group
    await page
      .getByTestId(`remove-groups-button-${groupName}-icon`)
      .click();

    // Confirm deletion in the popup
    await page.getByTestId(`remove-groups-button-${groupName}`).click();

    // Verify success toast
    await expect(page.getByText('Group has been removed')).toBeVisible();

    // Verify empty state message (group was deleted)
    await expect(
      page.getByText('Your Key has no Consumer Groups available'),
    ).toBeVisible();
  });

  test(`should delete consumer from consumer group ${Tags.REGRESSION}`, async ({
    page,
    createBrowserPage,
    cliPanel,
  }) => {
    const browserPage: BrowserPage = createBrowserPage(databaseId);
    const groupName = `test-group-${faker.string.alphanumeric(6)}`;
    const consumerName = `test-consumer-${faker.string.alphanumeric(6)}`;

    // Create a consumer group and consumer using CLI
    await cliPanel.open();
    await cliPanel.executeCommand(
      `XGROUP CREATE ${streamKey} ${groupName} 0 MKSTREAM`,
    );
    // Read a message to create a consumer
    await cliPanel.executeCommand(
      `XREADGROUP GROUP ${groupName} ${consumerName} COUNT 1 STREAMS ${streamKey} >`,
    );
    await cliPanel.close();

    // Search for the stream key
    await browserPage.keyList.searchKeys(streamKey);

    // Click on the stream key
    await browserPage.keyList.clickKey(streamKey);

    // Click on Consumer Groups tab
    await page.getByRole('tab', { name: 'Consumer Groups' }).click();

    // Wait for consumer groups to load and click on the group
    await expect(page.getByRole('gridcell', { name: groupName })).toBeVisible();
    await page.getByRole('gridcell', { name: groupName }).click();

    // Wait for consumers tab to appear
    await expect(page.getByRole('tab', { name: groupName })).toBeVisible();

    // Verify consumer is visible
    await expect(
      page.getByTestId(`stream-consumer-${consumerName}`),
    ).toBeVisible();

    // Click the remove button for the consumer (use force to bypass row click interception)
    await page
      .getByTestId(`remove-consumer-button-${consumerName}-icon`)
      .click({ force: true });

    // Confirm deletion in the popup
    await page.getByTestId(`remove-consumer-button-${consumerName}`).click();

    // Verify success toast
    await expect(page.getByText('Consumer has been removed')).toBeVisible();

    // Verify consumer is no longer visible (empty state or consumer removed)
    await expect(
      page.getByTestId(`stream-consumer-${consumerName}`),
    ).not.toBeVisible();
  });
});

test.describe('Browser > Stream Pending Messages', () => {
  let databaseId: string;
  let streamKey: string;
  let groupName: string;
  let consumerName: string;

  test.beforeAll(async ({ apiHelper }) => {
    // Get or create a database for testing
    const databases = await apiHelper.getDatabases();
    if (databases.length === 0) {
      const db = await apiHelper.createDatabase({
        name: 'test-stream-pending',
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
    streamKey = `test-stream-pending-${faker.string.alphanumeric(8)}`;
    groupName = `test-group-${faker.string.alphanumeric(6)}`;
    consumerName = `test-consumer-${faker.string.alphanumeric(6)}`;

    // Navigate to browser page
    await page.goto(`/${databaseId}/browser`);
    await page.waitForLoadState('networkidle');

    // Create a stream with messages and a consumer group with pending messages
    await cliPanel.open();
    // Add multiple messages to stream
    await cliPanel.executeCommand(`XADD ${streamKey} * field1 value1`);
    await cliPanel.executeCommand(`XADD ${streamKey} * field2 value2`);
    await cliPanel.executeCommand(`XADD ${streamKey} * field3 value3`);
    // Create consumer group starting from beginning
    await cliPanel.executeCommand(
      `XGROUP CREATE ${streamKey} ${groupName} 0 MKSTREAM`,
    );
    // Read messages to create pending entries for consumer
    await cliPanel.executeCommand(
      `XREADGROUP GROUP ${groupName} ${consumerName} COUNT 2 STREAMS ${streamKey} >`,
    );
    await cliPanel.close();
  });

  test.afterEach(async ({ cliPanel }) => {
    // Clean up
    await cliPanel.open();
    await cliPanel.executeCommand(`DEL ${streamKey}`);
    await cliPanel.close();
  });

  test(`should view pending messages for consumer ${Tags.SMOKE}`, async ({
    page,
    createBrowserPage,
  }) => {
    const browserPage: BrowserPage = createBrowserPage(databaseId);

    // Search for the stream key
    await browserPage.keyList.searchKeys(streamKey);

    // Click on the stream key
    await browserPage.keyList.clickKey(streamKey);

    // Click on Consumer Groups tab
    await page.getByRole('tab', { name: 'Consumer Groups' }).click();

    // Wait for consumer groups to load
    await expect(page.getByRole('gridcell', { name: groupName })).toBeVisible();

    // Click on the consumer group row to expand it
    await page.getByRole('gridcell', { name: groupName }).click();

    // Wait for consumers tab to appear and show the group name
    await expect(page.getByRole('tab', { name: groupName })).toBeVisible();

    // Click on consumer to see pending messages
    await page.getByTestId(`stream-consumer-${consumerName}`).click();

    // Verify the consumer name tab appears
    await expect(page.getByRole('tab', { name: consumerName })).toBeVisible();

    // Verify pending messages are displayed (should have 2 pending)
    const pendingRows = page.locator('[data-testid^="stream-message-"]');
    await expect(pendingRows.first()).toBeVisible();
    const count = await pendingRows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test(`should acknowledge pending message ${Tags.REGRESSION}`, async ({
    page,
    createBrowserPage,
  }) => {
    const browserPage: BrowserPage = createBrowserPage(databaseId);

    // Navigate to pending messages view
    await browserPage.keyList.searchKeys(streamKey);
    await browserPage.keyList.clickKey(streamKey);
    await page.getByRole('tab', { name: 'Consumer Groups' }).click();
    await expect(page.getByRole('gridcell', { name: groupName })).toBeVisible();
    await page.getByRole('gridcell', { name: groupName }).click();
    await expect(page.getByRole('tab', { name: groupName })).toBeVisible();
    await page.getByTestId(`stream-consumer-${consumerName}`).click();
    await expect(page.getByRole('tab', { name: consumerName })).toBeVisible();

    // Get initial pending count
    const pendingRows = page.locator('[data-testid^="stream-message-"]');
    await expect(pendingRows.first()).toBeVisible();
    const initialCount = await pendingRows.count();

    // Click ACK button on first pending message
    const ackButton = page.getByTestId('acknowledge-btn').first();
    await ackButton.click();

    // Confirm acknowledgement
    await page.getByTestId('acknowledge-submit').click();

    // Verify pending count decreased
    await expect(async () => {
      const newCount = await pendingRows.count();
      expect(newCount).toBeLessThan(initialCount);
    }).toPass({ timeout: 5000 });
  });
});

