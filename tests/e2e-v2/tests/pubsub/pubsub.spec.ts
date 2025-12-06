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
});

