import { DatabaseHelper } from '../../../../helpers/database';
import { deleteAllNotificationsFromDB } from '../../../../helpers/notifications';
import { commonUrl } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { MyRedisDatabasePage, SettingsPage } from '../../../../pageObjects';
import { NotificationParameters } from '../../../../pageObjects/components/navigation/notification-panel';

const description = require('./notifications.json');
const jsonNotifications: NotificationParameters[] = description.notifications;

const myRedisDatabasePage = new MyRedisDatabasePage();
const settingsPage = new SettingsPage();
const databaseHelper = new DatabaseHelper();
const NotificationPanel = myRedisDatabasePage.NavigationPanel.NotificationPanel;

// Sort all notifications in json file
const sortedNotifications = jsonNotifications.sort((a, b) => a.timestamp < b.timestamp ? 1 : -1);

// todo: rework. flaky tests.
fixture.skip `Notifications`
    .meta({ rte: rte.none, type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async(t) => {
        await t.setTestSpeed(.9);
        await databaseHelper.acceptLicenseTerms();
        await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
        await settingsPage.changeNotificationsSwitcher(true);
        await deleteAllNotificationsFromDB();
        await myRedisDatabasePage.reloadPage();
    });
test('Verify that when manager publishes new notification, it appears in the app', async t => {
    // Get number of notifications in the badge
    const newMessagesBeforeClosing = await NotificationPanel.getUnreadNotificationNumber();
    // Verify that user can see new notification in left popup
    // Verify that user can change notification toggle to on and new popup message will be displayed
    await t.expect(NotificationPanel.notificationPopup.visible)
        .ok('Notification popup is displayed', { timeout: 4000 });
    // Verify that new notification contains title, body and date
    await t.expect(NotificationPanel.notificationTitle.visible).ok('Title in popup is displayed');
    await t.expect(NotificationPanel.notificationBody.visible).ok('Body in popup is displayed');
    await t.expect(NotificationPanel.notificationDate.visible).ok('Date in popup is displayed');
    // Verify that user can see notification with category badge and category color in a single notification
    await t.expect(NotificationPanel.notificationCategory.visible).ok('Category is not displayed in popup');

    if (sortedNotifications[0].category !== undefined) {
        await t.expect(NotificationPanel.notificationCategory.innerText)
            .eql(sortedNotifications[0].category ?? '', 'Text for category is not correct');
        await t.expect(NotificationPanel.notificationCategory
            .withExactText(sortedNotifications[0].category ?? '').withAttribute('style', `background-color: rgb${sortedNotifications[0].rbgColor};`).exists).ok('Category color');
    }
    // Verify that user can click on close button and received notification will be closed
    await t.click(NotificationPanel.closeNotificationPopup);
    await t.expect(NotificationPanel.notificationPopup.visible).notOk('Notification popup is not displayed');
    // Verify that when user closes new notification popup, number of unread messages decreased in badge
    if (await NotificationPanel.notificationBadge.exists) {
        const newMessagesAfterClosing = await NotificationPanel.getUnreadNotificationNumber();
        await t.expect(newMessagesBeforeClosing).eql(newMessagesAfterClosing + 1, 'Reduced number of unread messages');
    }
});
test('Verify that user can see message "No notifications to display." when no messages received', async t => {
    await t.click(NotificationPanel.notificationCenterButton);
    await t.expect(NotificationPanel.notificationCenterPanel.child().withExactText('Notification Center').visible).ok('Panel is opened');
    await t.expect(NotificationPanel.emptyNotificationMessage.child().withExactText('No notifications to display.').visible).ok('Empty message is displayed');
    // Verify that user can close notification center by clicking on any other area of the application
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
    await t.expect(NotificationPanel.notificationCenterPanel.visible).notOk('Panel is not displayed');
    // Wait for new notification
    await t.expect(NotificationPanel.notificationPopup.exists).ok('New notifications appear', { timeout: 35000 });
    // Verify that user can open notification center by clicking on new received message popup
    await t.click(NotificationPanel.notificationPopup);
    await t.expect(NotificationPanel.notificationCenterPanel.visible).ok('Notification center is opened');
});
test('Verify that user can open notification center by clicking on icon and see all received messages', async t => {
    // Wait for new notifications
    await t.expect(NotificationPanel.notificationBadge.exists).ok('New notifications appear', { timeout: 35000 });
    // Verify that user can see number of new notifications on notification center icon
    await t.expect(await NotificationPanel.getUnreadNotificationNumber())
        .eql(jsonNotifications.length, 'Number of unread messages in badge');
    // Verify that badge with number of unread notifications disappears when user opens notification center
    await t.click(NotificationPanel.notificationCenterButton);
    await t.expect(NotificationPanel.notificationBadge.exists).notOk('Badge disappears');
    // Verify that user can see unread messages by blue icon highlighting in notification center
    await t.expect(NotificationPanel.unreadNotification.count).eql(jsonNotifications.length, 'Highlighted messages');
    // Verify that user can see title, body, and received date of the message in notification center
    for (let i = 0; i < jsonNotifications.length; i++) {
        // Check date of the message
        await t.expect(NotificationPanel.notificationTitle.withExactText(jsonNotifications[i].title).exists).ok('Displayed title');
        await t.expect(NotificationPanel.notificationBody.withExactText(jsonNotifications[i].body).exists).ok('Displayed body');
        await t.expect(NotificationPanel.notificationDate.withExactText(await NotificationPanel.convertEpochDateToMessageDate(jsonNotifications[i])).exists).ok('Displayed date');
        // Verify that user can see notification with category badge and category color in the notification center
        if (jsonNotifications[i].category !== undefined) {
            await t.expect(NotificationPanel.notificationCategory.withExactText(jsonNotifications[i].category ?? '').exists).ok(`${jsonNotifications[i].category} category name not displayed`);
            await t.expect(NotificationPanel.notificationCategory.withExactText(jsonNotifications[i].category ?? '').withAttribute('style', `background-color: rgb${jsonNotifications[i].rbgColor}; color: rgb(0, 0, 0);`).exists).ok('Category color');
        }
    }
    // Verify that as soon as user closes notification center, unread messages become read
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton); // Close notification center
    await t.expect(NotificationPanel.notificationBadge.exists).notOk('No unread messages badge');
    // Verify that next time when users open notification center, highlighting is not displayed for those messages that were unread previous center opening
    await t.click(NotificationPanel.notificationCenterButton); // Open notification center again
    await t.expect(NotificationPanel.unreadNotification.exists).notOk('No unread notifications');
});
test('Verify that all messages in notification center are sorted by timestamp from newest to oldest', async t => {
    // Wait for new notifications
    await t.expect(NotificationPanel.notificationBadge.exists).ok('New notifications appear', { timeout: 35000 });
    await t.click(NotificationPanel.notificationCenterButton);
    for (let i = 0; i < sortedNotifications.length; i++) {
        // Get data one by one from notification center
        const title = await NotificationPanel.notificationList.child(i).find(NotificationPanel.cssNotificationTitle).textContent;
        const body = await NotificationPanel.notificationList.child(i).find(NotificationPanel.cssNotificationBody).textContent;
        const date = await NotificationPanel.notificationList.child(i).find(NotificationPanel.cssNotificationDate).textContent;
        // Compare with what contained in sorted set
        await t.expect(title).eql(sortedNotifications[i].title, 'Title corresponds to sorted notification');
        await t.expect(body).eql(sortedNotifications[i].body, 'Body corresponds to sorted notification');
        await t.expect(date).eql(await NotificationPanel.convertEpochDateToMessageDate(sortedNotifications[i]), 'Date corresponds to sorted notification');
    }
});
test
    .before(async t => {
        await t.setTestSpeed(.9);
        await databaseHelper.acceptLicenseTerms();
        await settingsPage.changeNotificationsSwitcher(false);
        await deleteAllNotificationsFromDB();
        await myRedisDatabasePage.reloadPage();
        await t.expect(NotificationPanel.notificationBadge.exists).notOk('No badge');
    })('Verify that new popup message is not displayed when notifications are turned off', async t => {
        // Verify that user can see notification badge increased when new messages is sent and notifications are turned off
        await t.expect(NotificationPanel.notificationBadge.exists).ok('New notifications appear', { timeout: 35000 });
        await t.expect(NotificationPanel.notificationPopup.exists).notOk('Popup is not displayed');
        // Verify that new messages is displayed only in notification center if notifications are turned off
        await t.click(NotificationPanel.notificationCenterButton);
        await t.expect(NotificationPanel.unreadNotification.count).eql(jsonNotifications.length, 'Unread notifications number');
    });
