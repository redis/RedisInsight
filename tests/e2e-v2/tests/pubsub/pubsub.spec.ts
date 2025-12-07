import { test, expect } from '../../fixtures/base';
import { Tags } from '../../config';
import { standaloneConfig } from '../../config/databases/standalone';
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
  });
});

