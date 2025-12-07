import * as sqlite3 from 'sqlite3';
import {workingDirectory} from '../helpers/conf';
import {promisify} from "util";
import {createTimeout} from "./utils";

const dbPath = `${workingDirectory}/garnetinsight.db`;

export class DatabaseScripts {
    /**
     * Update table column value into local DB for a specific row
     * @param dbTableParameters The sqlite database table parameters
     */
    static async updateColumnValueInDBTable(dbTableParameters: DbTableParameters): Promise<void> {
        const db = new sqlite3.Database(dbPath);
        try {
            const runAsync = (query: string, p: (string | number | undefined)[]) => promisify(db.run.bind(db)); // convert db.run to a Promise-based function
            const query = `UPDATE ${dbTableParameters.tableName}
                           SET ${dbTableParameters.columnName} = ?
                           WHERE ${dbTableParameters.conditionWhereColumnName} = ?`;
            await runAsync(query, [dbTableParameters.rowValue, dbTableParameters.conditionWhereColumnValue]);
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
    static async getColumnValueFromTableInDB(dbTableParameters: DbTableParameters): Promise<any> {
        // Open the database in read/write mode and fail early if it cannot be opened.
        const db = await new Promise<sqlite3.Database>((resolve, reject) => {
            const database = new sqlite3.Database(
                dbPath,
                sqlite3.OPEN_READWRITE,
                (err: Error | null) => {
                    if (err) {
                        reject(new Error(`Error opening DB at path ${dbPath}: ${err.message}`));
                    } else {
                        resolve(database);
                    }
                }
            );
        });

        const query = `SELECT ${dbTableParameters.columnName}
                       FROM ${dbTableParameters.tableName}
                       WHERE ${dbTableParameters.conditionWhereColumnName} = ?`;
        try {
            const getAsync = (query: string, p: (string | number | undefined)[]) => promisify(db.get.bind(db));
            const row = await Promise.race([
                getAsync(query, [dbTableParameters.conditionWhereColumnValue]),
                createTimeout('Query timed out after 10 seconds',10000)
            ]);
            if (!row) {
                throw new Error(`No row found for column ${dbTableParameters.columnName}`);
            }
            return row[dbTableParameters.columnName!];
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
    static async deleteRowsFromTableInDB(dbTableParameters: DbTableParameters): Promise<void> {
        const db = await new Promise<sqlite3.Database>((resolve, reject) => {
            const database = new sqlite3.Database(
                dbPath,
                sqlite3.OPEN_READWRITE,
                (err: Error | null) => {
                    if (err) {
                        console.log(`Error during deleteRowsFromTableInDB: ${err}`);
                        reject(new Error(`Error opening DB at path ${dbPath}: ${err.message}`));
                    } else {
                        resolve(database);
                    }
                }
            );
        });

        const query = `DELETE
                       FROM ${dbTableParameters.tableName}`;

        try {
            const runAsync = promisify(db.run.bind(db));
            await Promise.race([
                runAsync(query),
                createTimeout('DELETE operation timed out after 10 seconds', 10000)
            ]);
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
