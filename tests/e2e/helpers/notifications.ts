import { workingDirectory } from '../helpers/conf';
import { NotificationParameters } from '../pageObjects/components/navigation/notification-panel';

const dbPath = `${workingDirectory}/garnetinsight.db`;

const sqlite3 = require('sqlite3').verbose();

/**
 * Delete all the notifications from local DB
 */
export function deleteAllNotificationsFromDB(): void {
    const db = new sqlite3.Database(dbPath);
    db.run('DELETE from notification', function(err: { message: string }) {
        if (err) {
            return console.log(`error during notification deletion: ${err.message}`);
        }
    });
    db.close();
}

/**
 * Insert specified notification to local  DB
 * @param notifications Array with notification data
 */
export function insertNotificationInDB(notifications: NotificationParameters[]): void {
    const db = new sqlite3.Database(dbPath);
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
    db.run(query, function(err: { message: string }) {
        if (err) {
            return console.log(`error during notification creation: ${err.message}`);
        }
    });
    db.close();
}
