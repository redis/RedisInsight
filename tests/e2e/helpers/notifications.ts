import Database from 'better-sqlite3';
import { workingDirectory } from '../helpers/conf';
import { NotificationParameters } from '../pageObjects/components/navigation/notification-panel';

const dbPath = `${workingDirectory}/redisinsight.db`;

/**
 * Delete all the notifications from local DB
 */
export function deleteAllNotificationsFromDB(): void {
    const db = new Database(dbPath);
    try {
        db.prepare('DELETE from notification').run();
    } catch (err: any) {
        console.error(`error during notification deletion: ${err.message}`);
    } finally {
        db.close();
    }
}

/**
 * Insert specified notification to local  DB
 * @param notifications Array with notification data
 */
export function insertNotificationInDB(notifications: NotificationParameters[]): void {
    const db = new Database(dbPath);
    let query = 'insert into notification ("type", "timestamp", "title", "body", "read") values';
    for (let i = 0; i < notifications.length; i++) {
        const messageWithQuotes = `${notifications[i].type}, ${notifications[i].timestamp},
        ${notifications[i].title}, ${notifications[i].body}, ${notifications[i].isRead}`;
        if (i === notifications.length - 1) {
            query = `${query} (${messageWithQuotes})`;
        }
        else {
            query = `${query} (${messageWithQuotes}),`;
        }
    }
    try {
        db.prepare(query).run();
    } catch (err: any) {
        console.error(`error during notification creation: ${err.message}`);
    } finally {
        db.close();
    }
}
