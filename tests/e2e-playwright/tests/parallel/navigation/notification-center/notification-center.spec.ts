import { test, expect } from '../../../../fixtures/base';

/**
 * Notification center tests (TEST_PLAN.md: 0.3 Notification center)
 *
 * Tests for the Notification center accessed from the sidebar navigation.
 * The Notification center displays:
 * - Unread badge count
 * - Notification list with title, body, date, and category
 * - Links within notification bodies
 */
test.describe('Notification center', () => {
  test.beforeEach(async ({ sidebarPanel }) => {
    await sidebarPanel.goto();
  });

  test('should open Notification center and display notifications', async ({ sidebarPanel }) => {
    const { notificationCenter } = sidebarPanel;
    await notificationCenter.open();

    // Verify Notification center dialog is open with title
    await expect(notificationCenter.notificationCenterDialog).toBeVisible();
    await expect(notificationCenter.notificationCenterTitle).toBeVisible();
    await expect(notificationCenter.notificationCenterTitle).toHaveText('Notification center');

    // Check if notifications list is displayed
    const hasNotifications = await notificationCenter.notificationsList.isVisible();

    if (hasNotifications) {
      // Verify notification items are displayed
      const itemCount = await notificationCenter.notificationItems.count();
      expect(itemCount).toBeGreaterThan(0);

      // Verify first notification has all content elements
      await expect(notificationCenter.getNotificationTitle(0)).toBeVisible();
      await expect(notificationCenter.getNotificationBody(0)).toBeVisible();
      await expect(notificationCenter.getNotificationDate(0)).toBeVisible();
    } else {
      // If no notifications, should show empty state
      await expect(notificationCenter.noNotificationsText).toBeVisible();
    }
  });

  test('should close Notification center', async ({ sidebarPanel }) => {
    const { notificationCenter } = sidebarPanel;
    await notificationCenter.open();

    // Verify dialog is open
    await expect(notificationCenter.notificationCenterDialog).toBeVisible();

    // Close and verify
    await notificationCenter.close();
    await expect(notificationCenter.notificationCenterDialog).not.toBeVisible();
  });

  test('should display notification links that are clickable', async ({ sidebarPanel }) => {
    const { notificationCenter } = sidebarPanel;
    await notificationCenter.open();

    // Check if there are notification items
    const itemCount = await notificationCenter.notificationItems.count();
    if (itemCount === 0) {
      test.skip();
      return;
    }

    // Find links in first notification
    const links = notificationCenter.getNotificationLinks(0);
    const linkCount = await links.count();

    if (linkCount > 0) {
      // Verify first link has href attribute
      const firstLink = links.first();
      await expect(firstLink).toBeVisible();
      const href = await firstLink.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/^https?:\/\//);
    }
  });

  test('should show unread badge when there are unread notifications', async ({ sidebarPanel }) => {
    const { notificationCenter } = sidebarPanel;

    // Check if unread badge is visible before opening
    const isVisible = await notificationCenter.unreadBadge.isVisible();

    if (isVisible) {
      // Badge should show a number
      const badgeText = await notificationCenter.unreadBadge.textContent();
      expect(badgeText).toBeTruthy();
      // Badge should be a number or "9+"
      expect(badgeText).toMatch(/^(\d+|\d\+)$/);
    }
  });
});
