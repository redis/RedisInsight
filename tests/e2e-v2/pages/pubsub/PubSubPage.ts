import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Pub/Sub Page Object Model
 * Handles subscribe and publish functionality
 */
export class PubSubPage extends BasePage {
  // Navigation
  readonly pubsubTab: Locator;

  // Subscribe section
  readonly patternInput: Locator;
  readonly subscribeButton: Locator;
  readonly unsubscribeButton: Locator;
  readonly notSubscribedMessage: Locator;
  readonly messagesContainer: Locator;
  readonly clearMessagesButton: Locator;

  // Publish section
  readonly channelNameInput: Locator;
  readonly messageInput: Locator;
  readonly publishButton: Locator;

  // Messages table/list
  readonly messagesTable: Locator;
  readonly messageRows: Locator;

  // Warning message
  readonly productionWarning: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation
    this.pubsubTab = page.getByRole('tab', { name: 'Pub/Sub' });

    // Subscribe section
    this.patternInput = page.getByPlaceholder('Enter Pattern');
    this.subscribeButton = page.getByRole('button', { name: 'Subscribe' });
    this.unsubscribeButton = page.getByRole('button', { name: 'Unsubscribe' });
    this.notSubscribedMessage = page.getByText('You are not subscribed');
    this.messagesContainer = page.getByTestId('pubsub-messages').or(page.locator('[data-testid*="pubsub"]'));
    this.clearMessagesButton = page.getByRole('button', { name: /clear/i });

    // Publish section
    this.channelNameInput = page.getByPlaceholder('Enter Channel Name');
    this.messageInput = page.getByPlaceholder('Enter Message');
    this.publishButton = page.getByRole('button', { name: 'Publish' });

    // Messages table/list
    this.messagesTable = page.getByRole('table').filter({ hasText: /Channel|Message/ });
    this.messageRows = this.messagesTable.locator('tbody tr');

    // Warning message
    this.productionWarning = page.getByText('Running in production may decrease performance');
  }

  /**
   * Navigate to Pub/Sub page
   */
  async goto(databaseId: string): Promise<void> {
    await this.page.goto(`/${databaseId}/pub-sub`);
    await this.pubsubTab.waitFor({ state: 'visible' });
  }

  /**
   * Click Pub/Sub tab from Browser/Workbench
   */
  async clickPubSubTab(): Promise<void> {
    await this.pubsubTab.click();
  }

  /**
   * Subscribe to a pattern
   */
  async subscribe(pattern: string = '*'): Promise<void> {
    await this.patternInput.clear();
    await this.patternInput.fill(pattern);
    await this.subscribeButton.click();
    // Wait for subscription to be active (button changes to Unsubscribe)
    await this.unsubscribeButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Unsubscribe from current subscription
   */
  async unsubscribe(): Promise<void> {
    await this.unsubscribeButton.click();
    await this.subscribeButton.waitFor({ state: 'visible' });
  }

  /**
   * Publish a message to a channel
   */
  async publish(channel: string, message: string): Promise<void> {
    await this.channelNameInput.clear();
    await this.channelNameInput.fill(channel);
    await this.messageInput.clear();
    await this.messageInput.fill(message);
    await this.publishButton.click();
  }

  /**
   * Check if subscribed (Unsubscribe button visible)
   */
  async isSubscribed(): Promise<boolean> {
    try {
      await this.unsubscribeButton.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if not subscribed message is visible
   */
  async isNotSubscribedMessageVisible(): Promise<boolean> {
    try {
      await this.notSubscribedMessage.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get messages count
   */
  async getMessagesCount(): Promise<number> {
    try {
      await this.messagesTable.waitFor({ state: 'visible', timeout: 2000 });
      return await this.messageRows.count();
    } catch {
      return 0;
    }
  }

  /**
   * Wait for message to appear
   */
  async waitForMessage(messageText: string, timeout: number = 10000): Promise<void> {
    await this.page.getByText(messageText).waitFor({ state: 'visible', timeout });
  }
}

