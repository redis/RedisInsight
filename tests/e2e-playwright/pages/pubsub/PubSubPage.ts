import { Page, Locator } from '@playwright/test';
import { InstancePage } from '../InstancePage';

/**
 * Pub/Sub Page Object Model
 * Handles subscribe and publish functionality
 *
 * Extends InstancePage to get access to:
 * - instanceHeader (database name, stats, breadcrumb)
 * - navigationTabs (Browse, Workbench, Analyze, Pub/Sub)
 * - bottomPanel (CLI, Command Helper, Profiler)
 */
export class PubSubPage extends InstancePage {
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
  readonly messagesList: Locator;
  readonly messagesTable: Locator;
  readonly messageRows: Locator;

  // Status section
  readonly statusSection: Locator;
  readonly messagesCount: Locator;
  readonly subscribedBadge: Locator;
  readonly unsubscribedBadge: Locator;

  // Table columns (headers)
  readonly timestampHeader: Locator;
  readonly channelHeader: Locator;
  readonly messageHeader: Locator;

  // Warning message
  readonly productionWarning: Locator;

  // Cluster mode banner
  readonly clusterSpublishBanner: Locator;

  constructor(page: Page) {
    super(page);

    // Subscribe section
    this.patternInput = page.getByPlaceholder('Enter Pattern');
    this.subscribeButton = page.getByRole('button', { name: 'Subscribe' });
    this.unsubscribeButton = page.getByRole('button', { name: 'Unsubscribe' });
    this.notSubscribedMessage = page.getByText('You are not subscribed');
    this.messagesContainer = page.getByTestId('pubsub-messages').or(page.locator('[data-testid*="pubsub"]'));
    this.clearMessagesButton = page.getByTestId('clear-pubsub-btn');

    // Publish section
    this.channelNameInput = page.getByPlaceholder('Enter Channel Name');
    this.messageInput = page.getByPlaceholder('Enter Message');
    this.publishButton = page.getByRole('button', { name: 'Publish' });

    // Messages table/list
    this.messagesList = page.getByTestId('messages-list');
    this.messagesTable = page.getByRole('table').filter({ hasText: /Channel|Message/ });
    this.messageRows = this.messagesTable.locator('tbody tr');

    // Status section
    this.statusSection = page.getByTestId('pub-sub-status');
    this.messagesCount = page.getByTestId('pub-sub-messages-count');
    this.subscribedBadge = page.getByText('Subscribed', { exact: true });
    this.unsubscribedBadge = page.getByText('Unsubscribed', { exact: true });

    // Table headers
    this.timestampHeader = this.messagesTable.getByRole('columnheader', { name: 'Timestamp' });
    this.channelHeader = this.messagesTable.getByRole('columnheader', { name: 'Channel' });
    this.messageHeader = this.messagesTable.getByRole('columnheader', { name: 'Message' });

    // Warning message
    this.productionWarning = page.getByText('Running in production may decrease performance');

    // Cluster mode banner
    this.clusterSpublishBanner = page.getByTestId('empty-messages-list-cluster');
  }

  /**
   * Navigate to Pub/Sub page via UI
   */
  async goto(databaseId: string): Promise<void> {
    await this.gotoDatabase(databaseId);
    await this.navigationTabs.gotoPubSub();
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.subscribeButton.waitFor({ state: 'visible' });
  }

  /**
   * Subscribe to a pattern
   */
  async subscribe(pattern: string = '*'): Promise<void> {
    await this.patternInput.clear();
    await this.patternInput.fill(pattern);
    await this.subscribeButton.click();
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

  /**
   * Get the displayed messages count from the status bar
   */
  async getDisplayedMessagesCount(): Promise<number> {
    const text = await this.messagesCount.innerText();
    return parseInt(text, 10);
  }

  /**
   * Check if message table is visible
   */
  async isMessageTableVisible(): Promise<boolean> {
    try {
      await this.messagesList.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click on a table column header to sort
   */
  async sortByColumn(columnName: 'Timestamp' | 'Channel' | 'Message'): Promise<void> {
    const header = this.messagesTable.getByRole('columnheader', { name: columnName });
    await header.click();
  }

  /**
   * Get cell text by row and column index
   */
  async getCellText(rowIndex: number, columnIndex: number): Promise<string> {
    const row = this.messageRows.nth(rowIndex);
    const cell = row.locator('td').nth(columnIndex);
    return cell.innerText();
  }

  /**
   * Check if status badge shows "Subscribed"
   */
  async isStatusSubscribed(): Promise<boolean> {
    try {
      await this.subscribedBadge.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}
