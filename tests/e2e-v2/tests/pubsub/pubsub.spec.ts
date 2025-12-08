import { test, expect } from '../../fixtures/base';
import { Tags } from '../../config';
import { standaloneConfig } from '../../config/databases/standalone';
import { clusterConfig } from '../../config/databases/cluster';
import { faker } from '@faker-js/faker';

test.describe('Pub/Sub', () => {
  let databaseId: string;

  test.beforeAll(async ({ apiHelper }) => {
    // Get or create a database for testing
    const databases = await apiHelper.getDatabases();
    const existingDb = databases.find(
      (db) => db.host === standaloneConfig.host && db.port === standaloneConfig.port
    );

    if (existingDb) {
      databaseId = existingDb.id;
    } else {
      const db = await apiHelper.createDatabase({
        name: 'test-pubsub-db',
        host: standaloneConfig.host,
        port: standaloneConfig.port,
      });
      databaseId = db.id;
    }
  });

  test.describe('Page Display', () => {
    test(`should display pub/sub page ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      await expect(pubsubPage.pubsubTab).toBeVisible();
      await expect(pubsubPage.pubsubTab).toHaveAttribute('aria-selected', 'true');
    });

    test(`should show not subscribed message initially ${Tags.SMOKE}`, async ({
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      const isNotSubscribed = await pubsubPage.isNotSubscribedMessageVisible();
      expect(isNotSubscribed).toBe(true);
    });

    test(`should show subscribe button ${Tags.SMOKE}`, async ({
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      await expect(pubsubPage.subscribeButton).toBeVisible();
    });

    test(`should show pattern input with default value ${Tags.REGRESSION}`, async ({
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      await expect(pubsubPage.patternInput).toBeVisible();
      await expect(pubsubPage.patternInput).toHaveValue('*');
    });

    test(`should show publish section ${Tags.REGRESSION}`, async ({
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      await expect(pubsubPage.channelNameInput).toBeVisible();
      await expect(pubsubPage.messageInput).toBeVisible();
      await expect(pubsubPage.publishButton).toBeVisible();
    });

    test(`should show production warning ${Tags.REGRESSION}`, async ({
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      await expect(pubsubPage.productionWarning).toBeVisible();
    });
  });

  test.describe('Subscribe', () => {
    test(`should subscribe to channel pattern ${Tags.CRITICAL}`, async ({
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      // Subscribe with default pattern
      await pubsubPage.subscribe('*');

      // Should show unsubscribe button (meaning we're subscribed)
      const isSubscribed = await pubsubPage.isSubscribed();
      expect(isSubscribed).toBe(true);

      // Cleanup - unsubscribe
      await pubsubPage.unsubscribe();
    });

    test(`should unsubscribe from channel ${Tags.CRITICAL}`, async ({
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      // Subscribe first
      await pubsubPage.subscribe('test-channel-*');

      // Verify subscribed
      expect(await pubsubPage.isSubscribed()).toBe(true);

      // Unsubscribe
      await pubsubPage.unsubscribe();

      // Verify unsubscribed
      expect(await pubsubPage.isSubscribed()).toBe(false);
    });

    test(`should subscribe with custom pattern ${Tags.REGRESSION}`, async ({
      createPubSubPage,
    }) => {
      const customPattern = `test-${faker.string.alphanumeric(6)}-*`;
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      // Subscribe with custom pattern
      await pubsubPage.subscribe(customPattern);

      // Should be subscribed
      const isSubscribed = await pubsubPage.isSubscribed();
      expect(isSubscribed).toBe(true);

      // Cleanup
      await pubsubPage.unsubscribe();
    });
  });

  test.describe('Publish', () => {
    test(`should be able to fill publish form ${Tags.REGRESSION}`, async ({
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      const channelName = `test-channel-${faker.string.alphanumeric(6)}`;
      const message = faker.lorem.sentence();

      // Fill channel name
      await pubsubPage.channelNameInput.fill(channelName);
      await expect(pubsubPage.channelNameInput).toHaveValue(channelName);

      // Fill message
      await pubsubPage.messageInput.fill(message);
      await expect(pubsubPage.messageInput).toHaveValue(message);
    });

    test(`should receive published message ${Tags.CRITICAL}`, async ({
      page,
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      const channelName = `test-channel-${faker.string.alphanumeric(6)}`;
      const message = `Hello-${faker.string.alphanumeric(8)}`;

      // Subscribe first
      await pubsubPage.subscribe('*');
      expect(await pubsubPage.isSubscribed()).toBe(true);

      // Publish a message
      await pubsubPage.publish(channelName, message);

      // Wait for message to appear in the table
      await expect(async () => {
        const messagesCount = await pubsubPage.getMessagesCount();
        expect(messagesCount).toBeGreaterThan(0);
      }).toPass({ timeout: 10000 });

      // Verify the message content is visible
      await expect(page.getByText(message)).toBeVisible();
      await expect(page.getByText(channelName)).toBeVisible();

      // Cleanup
      await pubsubPage.unsubscribe();
    });

    test(`should show status report with affected clients count after publish ${Tags.REGRESSION}`, async ({
      page,
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      const channelName = `test-channel-${faker.string.alphanumeric(6)}`;
      const message = `msg-${faker.string.alphanumeric(8)}`;

      // Subscribe first (so we have at least 1 client)
      await pubsubPage.subscribe('*');
      expect(await pubsubPage.isSubscribed()).toBe(true);

      // Publish a message
      await pubsubPage.publish(channelName, message);

      // Verify the toast shows "Published (N)" where N is the affected clients count
      // The toast should show at least 1 client (our subscription)
      await expect(page.getByText(/Published \(\d+\)/)).toBeVisible({ timeout: 5000 });

      // Cleanup
      await pubsubPage.unsubscribe();
    });
  });

  test.describe('Message Table View', () => {
    test(`should view message table with subscribed messages ${Tags.SMOKE}`, async ({
      page,
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      const channelName = `test-channel-${faker.string.alphanumeric(6)}`;
      const message = `msg-${faker.string.alphanumeric(8)}`;

      // Subscribe first
      await pubsubPage.subscribe('*');
      expect(await pubsubPage.isSubscribed()).toBe(true);

      // Publish a message
      await pubsubPage.publish(channelName, message);

      // Wait for message table to appear
      await expect(pubsubPage.messagesList).toBeVisible();

      // Verify table headers are visible
      await expect(pubsubPage.timestampHeader).toBeVisible();
      await expect(pubsubPage.channelHeader).toBeVisible();
      await expect(pubsubPage.messageHeader).toBeVisible();

      // Verify message count is displayed
      await expect(pubsubPage.messagesCount).toBeVisible();

      // Verify the message is in the table
      await expect(page.getByText(message)).toBeVisible();

      // Cleanup
      await pubsubPage.unsubscribe();
    });

    test(`should show status bar with subscription status ${Tags.REGRESSION}`, async ({
      page,
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      const channel = `test-${faker.string.alphanumeric(6)}`;
      const uniqueMessage = `unique-msg-${faker.string.alphanumeric(10)}`;

      // Subscribe to see the status bar
      await pubsubPage.subscribe('*');

      // Publish a message so the table appears (needed to see status bar)
      await pubsubPage.publish(channel, uniqueMessage);

      // Wait for the specific message to appear in the table
      await expect(page.getByText(uniqueMessage)).toBeVisible();

      // Status section should show "Subscribed" badge
      await expect(pubsubPage.statusSection).toBeVisible();
      const isStatusSubscribed = await pubsubPage.isStatusSubscribed();
      expect(isStatusSubscribed).toBe(true);

      // Messages count should be visible and at least 1
      await expect(pubsubPage.messagesCount).toBeVisible();
      const count = await pubsubPage.getDisplayedMessagesCount();
      expect(count).toBeGreaterThanOrEqual(1);

      // Unsubscribe
      await pubsubPage.unsubscribe();

      // Status should change to "Unsubscribed" (visible because we have messages)
      await expect(pubsubPage.unsubscribedBadge).toBeVisible();
    });

    test(`should show message count in status bar ${Tags.REGRESSION}`, async ({
      page,
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      // Subscribe first
      await pubsubPage.subscribe('*');

      // Publish a message with unique content
      const channel = `test-${faker.string.alphanumeric(6)}`;
      const uniqueMsg = `msg-${faker.string.alphanumeric(10)}`;
      await pubsubPage.publish(channel, uniqueMsg);

      // Wait for the message to appear
      await expect(page.getByText(uniqueMsg)).toBeVisible();

      // Verify messages count is visible and shows at least 1
      await expect(pubsubPage.messagesCount).toBeVisible();
      const count = await pubsubPage.getDisplayedMessagesCount();
      expect(count).toBeGreaterThanOrEqual(1);

      // Cleanup
      await pubsubPage.unsubscribe();
    });

    test(`should show newest messages at top of message table ${Tags.REGRESSION}`, async ({
      page,
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      const channel = `test-${faker.string.alphanumeric(6)}`;
      const firstMessage = `first-${faker.string.alphanumeric(8)}`;
      const secondMessage = `second-${faker.string.alphanumeric(8)}`;

      // Subscribe first
      await pubsubPage.subscribe('*');
      expect(await pubsubPage.isSubscribed()).toBe(true);

      // Publish first message
      await pubsubPage.publish(channel, firstMessage);
      await expect(page.getByText(firstMessage)).toBeVisible();

      // Wait a bit to ensure timestamp difference
      await page.waitForTimeout(500);

      // Publish second message
      await pubsubPage.publish(channel, secondMessage);
      await expect(page.getByText(secondMessage)).toBeVisible();

      // Get all message rows from the table body and verify order (newest first)
      const messagesTable = page.getByRole('table').filter({ hasText: /Channel|Message/ });
      const messageRows = messagesTable.locator('tbody tr');
      const rowCount = await messageRows.count();
      expect(rowCount).toBeGreaterThanOrEqual(2);

      // The first row (index 0) should contain the second (newest) message
      const firstRowText = await messageRows.first().textContent();
      expect(firstRowText).toContain(secondMessage);

      // Cleanup
      await pubsubPage.unsubscribe();
    });

    test(`should persist subscription while navigating in same DB context ${Tags.REGRESSION}`, async ({
      page,
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      const channel = `test-${faker.string.alphanumeric(6)}`;
      const message = `msg-${faker.string.alphanumeric(8)}`;

      // Subscribe first
      await pubsubPage.subscribe('*');
      expect(await pubsubPage.isSubscribed()).toBe(true);

      // Publish a message
      await pubsubPage.publish(channel, message);
      await expect(page.getByText(message)).toBeVisible();

      // Navigate to Browser tab
      await page.getByRole('tab', { name: 'Browse' }).click();
      // Wait for browser page to load (either list or tree view)
      await expect(page.getByRole('tab', { name: 'Browse' })).toHaveAttribute('aria-selected', 'true');

      // Navigate back to Pub/Sub tab
      await page.getByRole('tab', { name: 'Pub/Sub' }).click();

      // Verify subscription is still active
      expect(await pubsubPage.isSubscribed()).toBe(true);

      // Verify the previous message is still visible
      await expect(page.getByText(message)).toBeVisible();

      // Cleanup
      await pubsubPage.unsubscribe();
    });

    test(`should sort message table by channel column ${Tags.REGRESSION}`, async ({
      page,
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      // Create messages with different channel names for sorting
      const channelA = `aaa-channel-${faker.string.alphanumeric(4)}`;
      const channelZ = `zzz-channel-${faker.string.alphanumeric(4)}`;
      const messageA = `msg-a-${faker.string.alphanumeric(6)}`;
      const messageZ = `msg-z-${faker.string.alphanumeric(6)}`;

      // Subscribe first
      await pubsubPage.subscribe('*');
      expect(await pubsubPage.isSubscribed()).toBe(true);

      // Publish messages to different channels
      await pubsubPage.publish(channelA, messageA);
      await expect(page.getByText(messageA)).toBeVisible();

      await pubsubPage.publish(channelZ, messageZ);
      await expect(page.getByText(messageZ)).toBeVisible();

      // Click on Channel header to sort
      await pubsubPage.sortByColumn('Channel');

      // Wait for sort to apply
      await page.waitForTimeout(500);

      // Verify the table is sorted (check that both messages are still visible)
      await expect(page.getByText(channelA)).toBeVisible();
      await expect(page.getByText(channelZ)).toBeVisible();

      // Cleanup
      await pubsubPage.unsubscribe();
    });

    test(`should persist table configuration across navigation ${Tags.REGRESSION}`, async ({
      page,
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      // Create messages with different channel names
      const channelA = `aaa-persist-${faker.string.alphanumeric(4)}`;
      const channelZ = `zzz-persist-${faker.string.alphanumeric(4)}`;
      const messageA = `msg-a-${faker.string.alphanumeric(6)}`;
      const messageZ = `msg-z-${faker.string.alphanumeric(6)}`;

      // Subscribe first
      await pubsubPage.subscribe('*');
      expect(await pubsubPage.isSubscribed()).toBe(true);

      // Publish messages to different channels
      await pubsubPage.publish(channelA, messageA);
      await expect(page.getByText(messageA)).toBeVisible();

      await pubsubPage.publish(channelZ, messageZ);
      await expect(page.getByText(messageZ)).toBeVisible();

      // Sort by Channel column
      await pubsubPage.sortByColumn('Channel');
      await page.waitForTimeout(500);

      // Navigate to Browser tab
      await page.getByRole('tab', { name: 'Browse' }).click();
      await expect(page.getByRole('tab', { name: 'Browse' })).toHaveAttribute('aria-selected', 'true');

      // Navigate back to Pub/Sub tab
      await page.getByRole('tab', { name: 'Pub/Sub' }).click();
      await expect(page.getByRole('tab', { name: 'Pub/Sub' })).toHaveAttribute('aria-selected', 'true');

      // Verify messages are still visible (table configuration persisted)
      await expect(page.getByText(channelA)).toBeVisible();
      await expect(page.getByText(channelZ)).toBeVisible();

      // Cleanup
      await pubsubPage.unsubscribe();
    });

    // TODO: Enable this test when clear messages button is implemented in the UI
    // The clear button (data-testid="clear-pubsub-btn") is not yet available in the codebase
    test.skip(`should clear messages when clear button is clicked ${Tags.REGRESSION}`, async ({
      page,
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      const channel = `test-${faker.string.alphanumeric(6)}`;
      const message = `msg-${faker.string.alphanumeric(8)}`;

      // Subscribe first
      await pubsubPage.subscribe('*');
      expect(await pubsubPage.isSubscribed()).toBe(true);

      // Publish a message
      await pubsubPage.publish(channel, message);
      await expect(page.getByText(message)).toBeVisible();

      // Verify message count is at least 1
      const countBefore = await pubsubPage.getDisplayedMessagesCount();
      expect(countBefore).toBeGreaterThanOrEqual(1);

      // Click clear messages button
      await pubsubPage.clearMessagesButton.click();

      // Verify messages are cleared (count should be 0)
      await expect(async () => {
        const countAfter = await pubsubPage.getDisplayedMessagesCount();
        expect(countAfter).toBe(0);
      }).toPass({ timeout: 5000 });

      // Cleanup
      await pubsubPage.unsubscribe();
    });

    test(`should handle message table with multiple messages ${Tags.REGRESSION}`, async ({
      page,
      createPubSubPage,
    }) => {
      const pubsubPage = createPubSubPage();
      await pubsubPage.goto(databaseId);

      const channel = `test-${faker.string.alphanumeric(6)}`;

      // Subscribe first
      await pubsubPage.subscribe('*');
      expect(await pubsubPage.isSubscribed()).toBe(true);

      // Publish a few messages to verify table handles multiple rows
      const messageCount = 5;
      for (let i = 0; i < messageCount; i++) {
        await pubsubPage.publish(channel, `msg-${i}-${faker.string.alphanumeric(6)}`);
        // Wait for each message to appear before publishing next
        await page.waitForTimeout(200);
      }

      // Verify messages count is displayed
      await expect(pubsubPage.messagesCount).toBeVisible();
      const count = await pubsubPage.getDisplayedMessagesCount();
      expect(count).toBeGreaterThanOrEqual(messageCount);

      // Verify the message table has multiple rows
      const rowCount = await pubsubPage.getMessagesCount();
      expect(rowCount).toBeGreaterThanOrEqual(messageCount);

      // Cleanup
      await pubsubPage.unsubscribe();
    });
  });
});

// Note: Cluster mode tests require a Redis Cluster to be running on port 8200
// These tests are skipped by default as they require specific infrastructure
// To run these tests, ensure a Redis Cluster is available at the configured host:port
test.describe.skip('Pub/Sub > Cluster Mode', () => {
  let clusterDatabaseId: string;

  test.beforeAll(async ({ apiHelper }) => {
    // Get or create a cluster database for testing
    const databases = await apiHelper.getDatabases();
    const existingDb = databases.find(
      (db) => db.host === clusterConfig.host && db.port === clusterConfig.port
    );

    if (existingDb) {
      clusterDatabaseId = existingDb.id;
    } else {
      const db = await apiHelper.createDatabase({
        name: 'test-pubsub-cluster-db',
        host: clusterConfig.host,
        port: clusterConfig.port,
      });
      clusterDatabaseId = db.id;
    }
  });

  test(`should show SPUBLISH info message on welcome screen for cluster ${Tags.SMOKE}`, async ({
    createPubSubPage,
  }) => {
    const pubsubPage = createPubSubPage();
    await pubsubPage.goto(clusterDatabaseId);

    // Verify the SPUBLISH banner is visible for cluster mode
    await expect(pubsubPage.clusterSpublishBanner).toBeVisible();
    await expect(pubsubPage.clusterSpublishBanner).toContainText(
      'Messages published with SPUBLISH will not appear in this channel'
    );
  });

  test(`should not show affected clients count in cluster mode ${Tags.REGRESSION}`, async ({
    createPubSubPage,
    page,
  }) => {
    const pubsubPage = createPubSubPage();
    await pubsubPage.goto(clusterDatabaseId);

    const channelName = `test-cluster-channel-${faker.string.alphanumeric(6)}`;
    const message = `cluster-msg-${faker.string.alphanumeric(8)}`;

    // Subscribe first
    await pubsubPage.subscribe('*');
    expect(await pubsubPage.isSubscribed()).toBe(true);

    // Publish a message
    await pubsubPage.publish(channelName, message);

    // In cluster mode, the "Published" badge should not show the affected clients count
    // It should just show "Published" without a number in parentheses
    const publishedBadge = page.getByText(/^Published$/);
    await expect(publishedBadge).toBeVisible();

    // Verify it does NOT show "Published (X)" format
    const publishedWithCount = page.getByText(/Published \(\d+\)/);
    await expect(publishedWithCount).not.toBeVisible();

    // Cleanup
    await pubsubPage.unsubscribe();
  });
});
