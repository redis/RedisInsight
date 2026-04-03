import Database from 'better-sqlite3';
import {workingDirectory} from '../helpers/conf';

const dbPath = `${workingDirectory}/redisinsight.db`;

export class DatabaseScripts {
    /**
     * Update table column value into local DB for a specific row
     * @param dbTableParameters The sqlite database table parameters
     */
    static updateColumnValueInDBTable(dbTableParameters: DbTableParameters): void {
        const db = new Database(dbPath);
        try {
            const query = `UPDATE ${dbTableParameters.tableName}
                           SET ${dbTableParameters.columnName} = ?
                           WHERE ${dbTableParameters.conditionWhereColumnName} = ?`;
            db.prepare(query).run(dbTableParameters.rowValue, dbTableParameters.conditionWhereColumnValue);
        } catch (err) {
            console.log(`Error during changing ${dbTableParameters.columnName} column value: ${err}`)
            throw new Error(
                `Error during changing ${dbTableParameters.columnName} column value: ${err}`,
            );
        } finally {
            console.log("Close DB")
            db.close();
        }
    }

    /**
     * Get Column value from table in local Database
     * @param dbTableParameters The sqlite database table parameters
     */
    static getColumnValueFromTableInDB(dbTableParameters: DbTableParameters): any {
        const db = new Database(dbPath);

        const query = `SELECT ${dbTableParameters.columnName}
                       FROM ${dbTableParameters.tableName}
                       WHERE ${dbTableParameters.conditionWhereColumnName} = ?`;
        try {
            const row = db.prepare(query).get(dbTableParameters.conditionWhereColumnValue);
            if (!row) {
                throw new Error(`No row found for column ${dbTableParameters.columnName}`);
            }
            return (row as Record<string, any>)[dbTableParameters.columnName!];
        } catch (err: any) {
            throw new Error(`Error during getting ${dbTableParameters.columnName} column value: ${err.message}`);
        } finally {
            db.close();
        }
    }

    /**
     * Delete all rows from table in local DB
     * @param dbTableParameters The sqlite database table parameters
     */
    static deleteRowsFromTableInDB(dbTableParameters: DbTableParameters): void {
        const db = new Database(dbPath);

        const query = `DELETE
                       FROM ${dbTableParameters.tableName}`;

        try {
            db.prepare(query).run();
        } catch (err: any) {
            throw new Error(`Error during ${dbTableParameters.tableName} table rows deletion: ${err.message}`);
        } finally {
            db.close();
        }
    }

}

/**
 * Add new database parameters
 * @param tableName The name of table in DB
 * @param columnName The name of column in table
 * @param rowValue Value to update in table
 * @param conditionWhereColumnName The name of the column to search
 * @param conditionWhereColumnValue The value to match in the column
 */
export type DbTableParameters = {
    tableName: string,
    columnName?: string,
    rowValue?: string | number,
    conditionWhereColumnName?: string,
    conditionWhereColumnValue?: string
};
