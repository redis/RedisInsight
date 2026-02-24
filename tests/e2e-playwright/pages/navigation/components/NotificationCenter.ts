import { Page, Locator } from '@playwright/test';

/**
 * NotificationCenter component for Notification Center interactions
 *
 * Handles locators and methods for the Notification Center dialog
 * accessed from the sidebar navigation.
 */
export class NotificationCenter {
  readonly page: Page;

  // Notification Center button and dialog
  readonly notificationMenuButton: Locator;
  readonly notificationCenterDialog: Locator;
  readonly notificationCenterTitle: Locator;

  // Notification list and items
  readonly notificationsList: Locator;
  readonly notificationItems: Locator;

  // Notification elements
  readonly notificationTitles: Locator;
  readonly notificationBodies: Locator;
  readonly notificationDates: Locator;
  readonly notificationCategories: Locator;
  readonly notificationLinks: Locator;

  // Badge
  readonly unreadBadge: Locator;

  // Empty state
  readonly noNotificationsText: Locator;

  constructor(page: Page) {
    this.page = page;

    // Notification Center button and dialog
    this.notificationMenuButton = page.getByTestId('notification-menu-button');
    this.notificationCenterDialog = page.getByTestId('notification-center');
    this.notificationCenterTitle = this.notificationCenterDialog.getByText('Notification Center');

    // Notification list - the container with notification items
    this.notificationsList = this.notificationCenterDialog.locator('> div > div');
    this.notificationItems = this.notificationsList.locator('> div').filter({ has: page.locator('a, p') });

    // Notification elements within items
    this.notificationTitles = this.notificationItems.locator('> div:first-child');
    this.notificationBodies = this.notificationItems.locator('> div:nth-child(2)');
    this.notificationDates = this.notificationItems.locator('p').first();
    this.notificationCategories = this.notificationItems.locator('p').last();
    this.notificationLinks = this.notificationItems.locator('a');

    // Badge for unread count
    this.unreadBadge = page.getByTestId('total-unread-badge');

    // Empty state
    this.noNotificationsText = this.notificationCenterDialog.getByText('No notifications');
  }

  /**
   * Open notification center by clicking the notification button
   */
  async open(): Promise<void> {
    await this.notificationMenuButton.click();
    await this.notificationCenterDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Close notification center by clicking outside the dialog
   */
  async close(): Promise<void> {
    // Click outside the dialog to close it
    await this.page.locator('body').click({ position: { x: 10, y: 10 } });
    await this.notificationCenterDialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Check if notification center is open
   */
  async isOpen(): Promise<boolean> {
    return this.notificationCenterDialog.isVisible();
  }

  /**
   * Get notification title by index
   */
  getNotificationTitle(index: number): Locator {
    return this.notificationItems.nth(index).locator('> div:first-child');
  }

  /**
   * Get notification body by index
   */
  getNotificationBody(index: number): Locator {
    return this.notificationItems.nth(index).locator('> div:nth-child(2)');
  }

  /**
   * Get notification date by index
   */
  getNotificationDate(index: number): Locator {
    return this.notificationItems.nth(index).locator('p').first();
  }

  /**
   * Get notification category by index
   */
  getNotificationCategory(index: number): Locator {
    return this.notificationItems.nth(index).locator('p').last();
  }

  /**
   * Get notification links by index
   */
  getNotificationLinks(index: number): Locator {
    return this.notificationItems.nth(index).locator('a');
  }
}
