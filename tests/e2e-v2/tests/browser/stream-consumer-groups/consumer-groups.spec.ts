import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { faker } from '@faker-js/faker';
import { DatabaseInstance } from '../../../types';

test.describe('Browser > Stream Consumer Groups', () => {
  let database: DatabaseInstance;
  let streamKey: string;

  test.beforeAll(async ({ apiHelper }) => {
    // Get or create a database for testing
    const databases = await apiHelper.getDatabases();
    if (databases.length === 0) {
      database = await apiHelper.createDatabase({
        name: 'test-stream-consumer-groups',
        host: '127.0.0.1',
        port: 6379,
      });
    } else {
      database = databases[0];
    }
  });

  test.beforeEach(async ({ cliPanel, browserPage }) => {
    // Create a unique stream key for each test
    streamKey = `test-stream-cg-${faker.string.alphanumeric(8)}`;

    // Navigate to browser page via UI
    await browserPage.goto(database.id);

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
    browserPage,
  }) => {

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
    browserPage,
  }) => {

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
    browserPage,
  }) => {

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
    browserPage,
  }) => {

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
    browserPage,
  }) => {

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
    browserPage,
    cliPanel,
  }) => {

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
    browserPage,
    cliPanel,
  }) => {

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

  test(`should view consumer information columns (Consumer Name, Pending, Idle Time) ${Tags.REGRESSION}`, async ({
    page,
    browserPage,
    cliPanel,
  }) => {

    const groupName = `test-group-${faker.string.alphanumeric(6)}`;
    const consumerName = `test-consumer-${faker.string.alphanumeric(6)}`;

    // Create a consumer group and consumer using CLI
    await cliPanel.open();
    await cliPanel.executeCommand(
      `XGROUP CREATE ${streamKey} ${groupName} 0 MKSTREAM`,
    );
    // Read a message to create a consumer with pending messages
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

    // Verify consumer information columns are visible
    // Column headers: Consumer Name, Pending, Idle Time, msec
    await expect(page.getByText('Consumer Name')).toBeVisible();
    await expect(page.getByText('Pending')).toBeVisible();
    await expect(page.getByText('Idle Time, msec')).toBeVisible();

    // Verify consumer is visible with its name
    await expect(
      page.getByTestId(`stream-consumer-${consumerName}`),
    ).toBeVisible();

    // Verify consumer row has pending count (should be 1 since we read 1 message)
    // The consumer row should contain the pending count
    const consumerRow = page.locator('[role="row"]').filter({ hasText: consumerName });
    await expect(consumerRow).toBeVisible();
    // Verify the row contains numeric values for pending and idle time
    await expect(consumerRow.locator('[role="gridcell"]').nth(1)).toContainText(/\d+/);
    await expect(consumerRow.locator('[role="gridcell"]').nth(2)).toContainText(/\d+/);
  });

  test(`should edit Last Delivered ID for consumer group ${Tags.REGRESSION}`, async ({
    page,
    browserPage,
    cliPanel,
  }) => {

    const groupName = `test-group-${faker.string.alphanumeric(6)}`;

    // Create a consumer group using CLI with initial ID "0"
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

    // Wait for consumer groups to load
    await expect(page.getByRole('gridcell', { name: groupName })).toBeVisible();

    // The Last Delivered ID for a new group with ID "0" is "0-0"
    // Hover on the content wrapper to show the edit button
    // The test ID format is: stream-group_content-value-{lastDeliveredId}
    const contentWrapper = page.getByTestId('stream-group_content-value-0-0');
    await contentWrapper.hover();

    // Click the edit button for Last Delivered ID
    // The test ID format is: stream-group_edit-btn-{lastDeliveredId}
    const editButton = page.getByTestId('stream-group_edit-btn-0-0');
    await editButton.click();

    // Wait for the edit dialog to appear with the ID textbox
    const editInput = page.getByRole('textbox', { name: 'ID*' });
    await expect(editInput).toBeVisible();

    // Change the Last Delivered ID to a new value (use the stream entry ID from the test data)
    // The stream has an entry, so we can use "$" to set it to the latest entry
    await editInput.clear();
    await editInput.fill('$');

    // Click the Save button in the dialog
    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for the dialog to close and verify the ID has changed
    // The new ID should no longer be "0-0" (it will be the actual stream entry ID)
    await expect(page.getByTestId('stream-group_content-value-0-0')).not.toBeVisible({ timeout: 10000 });

    // Verify the group is still visible (operation succeeded)
    await expect(page.getByRole('gridcell', { name: groupName })).toBeVisible();
  });
});

test.describe('Browser > Stream Pending Messages', () => {
  let database: DatabaseInstance;
  let streamKey: string;
  let groupName: string;
  let consumerName: string;

  test.beforeAll(async ({ apiHelper }) => {
    // Get or create a database for testing
    const databases = await apiHelper.getDatabases();
    if (databases.length === 0) {
      database = await apiHelper.createDatabase({
        name: 'test-stream-pending',
        host: '127.0.0.1',
        port: 6379,
      });
    } else {
      database = databases[0];
    }
  });

  test.beforeEach(async ({ cliPanel, browserPage }) => {
    // Create a unique stream key for each test
    streamKey = `test-stream-pending-${faker.string.alphanumeric(8)}`;
    groupName = `test-group-${faker.string.alphanumeric(6)}`;
    consumerName = `test-consumer-${faker.string.alphanumeric(6)}`;

    // Navigate to browser page via UI
    await browserPage.goto(database.id);

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
    browserPage,
  }) => {


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
    browserPage,
  }) => {


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

  test(`should claim pending message ${Tags.REGRESSION}`, async ({
    page,
    browserPage,
    cliPanel,
  }) => {


    // Create a stream with two consumers (Alice and Bob) each with a pending message
    const claimStreamKey = `test-claim-stream-${faker.string.alphanumeric(8)}`;
    const claimGroupName = `test-claim-group-${faker.string.alphanumeric(6)}`;

    // Open CLI panel to create test data
    await cliPanel.open();
    await cliPanel.executeCommand(`XGROUP CREATE ${claimStreamKey} ${claimGroupName} $ MKSTREAM`);
    await cliPanel.executeCommand(`XADD ${claimStreamKey} * message apple`);
    await cliPanel.executeCommand(`XADD ${claimStreamKey} * message orange`);
    await cliPanel.executeCommand(`XREADGROUP GROUP ${claimGroupName} Alice COUNT 1 STREAMS ${claimStreamKey} >`);
    await cliPanel.executeCommand(`XREADGROUP GROUP ${claimGroupName} Bob COUNT 1 STREAMS ${claimStreamKey} >`);
    await cliPanel.close();

    // Navigate to Alice's pending messages
    await browserPage.keyList.searchKeys(claimStreamKey);
    await browserPage.keyList.clickKey(claimStreamKey);
    await page.getByRole('tab', { name: 'Consumer Groups' }).click();
    await expect(page.getByRole('gridcell', { name: claimGroupName })).toBeVisible();
    await page.getByRole('gridcell', { name: claimGroupName }).click();
    await expect(page.getByRole('tab', { name: claimGroupName })).toBeVisible();
    await page.getByTestId('stream-consumer-Alice').click();
    await expect(page.getByRole('tab', { name: 'Alice' })).toBeVisible();

    // Verify Alice has 1 pending message - wait for the CLAIM button to be visible
    await expect(page.getByTestId('claim-pending-message')).toBeVisible();

    // Click CLAIM button on the pending message
    await page.getByTestId('claim-pending-message').click();

    // Wait for the claim popover to appear
    await expect(page.getByTestId('destination-select')).toBeVisible();

    // Select Bob as the destination consumer using keyboard navigation
    // The dropdown should auto-select Bob since it's the only option
    // Just click the Claim button directly since Bob is already selected by default
    await page.getByTestId('btn-submit').click();

    // Wait for the claim popover to close
    await expect(page.getByTestId('btn-submit')).not.toBeVisible({ timeout: 10000 });

    // Verify Alice now has no pending messages
    await expect(page.getByText('Your Consumer has no pending messages')).toBeVisible({ timeout: 10000 });

    // Navigate to Bob's pending messages and verify he now has 2 messages
    await page.getByRole('tab', { name: claimGroupName }).click();
    await page.getByTestId('stream-consumer-Bob').click();
    await expect(page.getByRole('tab', { name: 'Bob' })).toBeVisible();
    // Verify Bob has 2 CLAIM buttons (one per pending message)
    await expect(page.getByTestId('claim-pending-message')).toHaveCount(2);

    // Cleanup
    await cliPanel.open();
    await cliPanel.executeCommand(`DEL ${claimStreamKey}`);
    await cliPanel.close();
  });

  test(`should claim pending message with idle time parameter ${Tags.REGRESSION}`, async ({
    page,
    browserPage,
    cliPanel,
  }) => {


    // Create a stream with two consumers
    const claimStreamKey = `test-claim-idle-${faker.string.alphanumeric(8)}`;
    const claimGroupName = `test-claim-idle-grp-${faker.string.alphanumeric(6)}`;

    // Open CLI panel to create test data
    await cliPanel.open();
    await cliPanel.executeCommand(`XGROUP CREATE ${claimStreamKey} ${claimGroupName} $ MKSTREAM`);
    await cliPanel.executeCommand(`XADD ${claimStreamKey} * message apple`);
    await cliPanel.executeCommand(`XADD ${claimStreamKey} * message orange`);
    await cliPanel.executeCommand(`XREADGROUP GROUP ${claimGroupName} Alice COUNT 1 STREAMS ${claimStreamKey} >`);
    await cliPanel.executeCommand(`XREADGROUP GROUP ${claimGroupName} Bob COUNT 1 STREAMS ${claimStreamKey} >`);
    await cliPanel.close();

    // Navigate to Alice's pending messages
    await browserPage.keyList.searchKeys(claimStreamKey);
    await browserPage.keyList.clickKey(claimStreamKey);
    await page.getByRole('tab', { name: 'Consumer Groups' }).click();
    await page.getByRole('gridcell', { name: claimGroupName }).click();
    await page.getByTestId('stream-consumer-Alice').click();
    await expect(page.getByRole('tab', { name: 'Alice' })).toBeVisible();

    // Click CLAIM button
    await page.getByTestId('claim-pending-message').click();

    // Wait for the claim popover to appear
    await expect(page.getByTestId('destination-select')).toBeVisible();

    // Enable optional parameters
    await page.getByTestId('optional-parameters-switcher').click();

    // Verify optional parameter fields are visible
    await expect(page.getByTestId('time-count')).toBeVisible();
    await expect(page.getByTestId('retry-count')).toBeVisible();
    await expect(page.getByTestId('time-option-select')).toBeVisible();

    // Set idle time
    await page.getByTestId('time-count').fill('100');

    // Bob is already selected by default, just submit
    await page.getByTestId('btn-submit').click();

    // Wait for the claim popover to close
    await expect(page.getByTestId('btn-submit')).not.toBeVisible({ timeout: 10000 });

    // Verify Alice now has no pending messages
    await expect(page.getByText('Your Consumer has no pending messages')).toBeVisible({ timeout: 10000 });

    // Cleanup
    await cliPanel.open();
    await cliPanel.executeCommand(`DEL ${claimStreamKey}`);
    await cliPanel.close();
  });

  test(`should force claim pending message ${Tags.REGRESSION}`, async ({
    page,
    browserPage,
    cliPanel,
  }) => {


    // Create a stream with two consumers
    const claimStreamKey = `test-force-claim-${faker.string.alphanumeric(8)}`;
    const claimGroupName = `test-force-claim-grp-${faker.string.alphanumeric(6)}`;

    // Open CLI panel to create test data
    await cliPanel.open();
    await cliPanel.executeCommand(`XGROUP CREATE ${claimStreamKey} ${claimGroupName} $ MKSTREAM`);
    await cliPanel.executeCommand(`XADD ${claimStreamKey} * message apple`);
    await cliPanel.executeCommand(`XADD ${claimStreamKey} * message orange`);
    await cliPanel.executeCommand(`XREADGROUP GROUP ${claimGroupName} Alice COUNT 1 STREAMS ${claimStreamKey} >`);
    await cliPanel.executeCommand(`XREADGROUP GROUP ${claimGroupName} Bob COUNT 1 STREAMS ${claimStreamKey} >`);
    await cliPanel.close();

    // Navigate to Alice's pending messages
    await browserPage.keyList.searchKeys(claimStreamKey);
    await browserPage.keyList.clickKey(claimStreamKey);
    await page.getByRole('tab', { name: 'Consumer Groups' }).click();
    await page.getByRole('gridcell', { name: claimGroupName }).click();
    await page.getByTestId('stream-consumer-Alice').click();
    await expect(page.getByRole('tab', { name: 'Alice' })).toBeVisible();

    // Click CLAIM button
    await page.getByTestId('claim-pending-message').click();

    // Wait for the claim popover to appear
    await expect(page.getByTestId('destination-select')).toBeVisible();

    // Enable optional parameters
    await page.getByTestId('optional-parameters-switcher').click();

    // Check the Force Claim checkbox
    await page.getByTestId('force-claim-checkbox').click();

    // Bob is already selected by default, just submit
    await page.getByTestId('btn-submit').click();

    // Wait for the claim popover to close
    await expect(page.getByTestId('btn-submit')).not.toBeVisible({ timeout: 10000 });

    // Verify Alice now has no pending messages
    await expect(page.getByText('Your Consumer has no pending messages')).toBeVisible({ timeout: 10000 });

    // Navigate to Bob's pending messages and verify he now has 2 messages
    await page.getByRole('tab', { name: claimGroupName }).click();
    await page.getByTestId('stream-consumer-Bob').click();
    await expect(page.getByRole('tab', { name: 'Bob' })).toBeVisible();
    // Verify Bob has 2 CLAIM buttons (one per pending message)
    await expect(page.getByTestId('claim-pending-message')).toHaveCount(2);

    // Cleanup
    await cliPanel.open();
    await cliPanel.executeCommand(`DEL ${claimStreamKey}`);
    await cliPanel.close();
  });
});

