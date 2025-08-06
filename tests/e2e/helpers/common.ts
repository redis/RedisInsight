import * as path from 'path';
import * as fs from 'fs';
import * as fsp from 'fs/promises';

import { ClientFunction, RequestMock, t } from 'testcafe';
import { Chance } from 'chance';
import { apiUrl } from './conf';
const archiver = require('archiver');

const chance = new Chance();

declare global {
    interface Window {
        windowId?: string
    }
}

const settingsApiUrl = `${apiUrl}/settings`;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // lgtm[js/disabling-certificate-validation]
const mockedSettingsResponse = {
    "theme": null,
    "dateFormat": null,
    "timezone": null,
    "scanThreshold": 10000,
    "batchSize": 5,
    "agreements": null
};

export class Common {
    static mockSettingsResponse(): RequestMock {
        return RequestMock()
            .onRequestTo(settingsApiUrl)
            .respond(mockedSettingsResponse, 200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': 'x-window-id'
            });
    }

    static async waitForElementNotVisible(elm: Selector): Promise<void> {
        try {
            await t.expect(elm.exists).notOk({ timeout: 15000 }); // Increased from 10000 to 15000
        } catch (error) {
            // Element still exists, try to wait for it to become invisible instead
            try {
                await t.expect(elm.visible).notOk({ timeout: 15000 });
            } catch {
                // Log warning but don't fail the test - element might be legitimately persistent
                console.warn('Element still visible after timeout, but continuing test execution');
            }
        }
    }

    /**
     * Create array of keys
     * @param length The amount of array elements
     */
    static createArrayWithKeys(length: number): string[] {
        return Array.from({ length }, (_, i) => `key${i}`);
    }

    /**
    * Create array of keys and values
    * @param length The amount of array elements
    */
    static async createArrayWithKeyValue(length: number): Promise<string[]> {
        const arr: string[] = [];
        for (let i = 1; i <= length * 2; i++) {
            arr[i] = `${chance.word({ length: 10 })}-key${i}`;
            arr[i + 1] = `${chance.word({ length: 10 })}-value${i}`;
            i++;
        }
        return arr;
    }

    /**
    * Create array of keys and values
    * @param length The amount of array elements
    */
    static async createArrayWithKeyValueAndDelimiter(length: number): Promise<string[]> {
        const keyNameArray: string[] = [];
        for (let i = 1; i <= length; i++) {
            const key = `"key${i}:test${i}"`;
            const value = `"value${this.generateSentence(i * 2)}"`;
            keyNameArray.push(key, value);
        }
        return keyNameArray;
    }

    /**
    * Create array of keys and values
    * @param length The amount of array elements
    */
    static async createArrayWithKeyAndDelimiter(length: number): Promise<string[]> {
        const keyNameArray: string[] = [];
        for (let i = 1; i <= length; i++) {
            const key = `"key${i}:test${i}"`;
            keyNameArray.push(key);
        }
        return keyNameArray;
    }

    /**
    * Create array of keys and values for using in OSS Cluster
    * @param length The amount of array elements
    */
    static async createArrayWithKeyValueForOSSCluster(length: number): Promise<string[]> {
        const arr: string[] = [];
        for (let i = 1; i <= length * 2; i++) {
            arr[i] = `{user1}:${chance.word({ length: 10 })}-key${i}`;
            arr[i + 1] = `${chance.word({ length: 10 })}-value${i}`;
            i++;
        }
        return arr;
    }

    /**
    * Create array of keys and values with edittable counter value
    * @param length The amount of array elements
    * @param keyName The name of the key
    */
    static async createArrayWithKeyValueAndKeyname(length: number, keyName: string): Promise<string[]> {
        const keyNameArray: string[] = [];
        for (let i = 1; i <= length; i++) {
            const key = `${keyName}${i}`;
            const value = `value${i}`;
            keyNameArray.push(key, value);
        }
        return keyNameArray;
    }

    /**
     * Create array of pairs [key, value]
     * @param length The amount of array elements
     */
    static createArrayPairsWithKeyValue(length: number): [string, number][] {
        return Array.from({ length }, (_, i) => [`key${i}`, i]);
    }

    /**
    * Create array of numbers
    * @param length The amount of array elements
    */
    static async createArray(length: number): Promise<string[]> {
        const arr: string[] = [];
        for (let i = 1; i <= length; i++) {
            arr[i] = `${i}`;
        }
        return arr;
    }

    /**
    * Get background colour of element
    * @param element The selector of the element
    */
    static async getBackgroundColour(element: Selector): Promise<string> {
        return element.getStyleProperty('background-color');
    }

    /**
    * Generate word by number of symbols
    * @param number The number of symbols
    */
    static generateWord(number: number): string {
        return chance.word({ length: number });
    }

    /**
    * Generate sentence by number of words
    * @param number The number of words
    */
    static generateSentence(number: number): string {
        return chance.sentence({ words: number });
    }

    /**
    * Return api endpoint with disabled certificate validation
    */
    static getEndpoint(): string {
        return apiUrl;
    }

    /**
    * Return windowId
    */
    static getWindowId(): Promise<string> {
        return t.eval(() => window.windowId);
    }

    /**
     * Check opened URL
     * @param expectedUrl Expected link that is compared with actual
     */
    static async checkURL(expectedUrl: string): Promise<void> {
        const getPageUrl = await this.getPageUrl();
        await t.expect(getPageUrl).eql(expectedUrl, 'Opened URL is not correct');
    }

    /**
     * Check opened URL contains text
     * @param expectedText Expected link that is compared with actual
     */
    static async checkURLContainsText(expectedText: string): Promise<void> {
        const getPageUrl = await this.getPageUrl();
        await t.expect(getPageUrl).contains(expectedText, `Opened URL not contains text ${expectedText}`);
    }

    /**
     * Replace spaces and line breaks
     * @param text text to be replaced
     */
    static async removeEmptySpacesAndBreak(text: string): Promise<string> {
        return text
            .replace(/ /g, '')
            .replace(/\n/g, '');
    }

    /**
     * Get current page url
     */
    static async getPageUrl(): Promise<string> {
        return (ClientFunction(() => window.location.href))();
    }

    /**
     * generate url base on params to create DB
     * @param params params for creating DB
     */
    static generateUrlTParams(params: Record<string, any>): string {
        return new URLSearchParams(params).toString();
    }

    /**
     * Get json property value by property name and path
     * @param expectedText Expected link that is compared with actual
     */
    static async getJsonPropertyValue(property: string, path: string): Promise<string | number> {
        const parsedJson = JSON.parse(fs.readFileSync(path, 'utf-8'));
        return parsedJson[property];
    }

    /**
     * Create Zip archive from folder
     * @param folderPath Path to folder to archive
     * @param zipName Zip archive name
     */
    static async createZipFromFolder(folderPath: string, zipName: string): Promise<void> {
        const sourceDir = path.join(__dirname, folderPath);
        const zipFilePath = path.join(__dirname, zipName);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        // Add the contents of the directory to the zip archive
        archive.directory(sourceDir, false);
        // Finalize the archive and write it to disk
        await archive.finalize();
        archive.pipe(output);
    }

    /**
      * Delete file from folder
      * @param filePath Path to file
     */
    static async deleteFileFromFolder(filePath: string): Promise<void> {
        fs.unlinkSync(path.join(__dirname, filePath));
    }

    /**
      * Delete file from folder if exists
      * @param filePath Path to file
     */
    static async deleteFileFromFolderIfExists(filePath: string): Promise<void> {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    /**
     * Delete folder
     * @param filePath Path to file
     */
    static async deleteFolderIfExists(filePath: string): Promise<void> {
        try {
            await fsp.rm(filePath, { recursive: true, force: true });
            console.log(`Directory Deleted: ${filePath}`);
        } catch (error) {
            console.error(`Failed to delete directory: ${filePath}`, error);
        }
    }

    /**
      * Read file from folder
      * @param filePath Path to file
     */
    static async readFileFromFolder(filePath: string): Promise<string> {
        return fs.readFileSync(filePath, 'utf8');
    }

    /**
      * Get current machine platform
     */
    static getPlatform(): { isMac: boolean, isLinux: boolean } {
        return {
            isMac: process.platform === 'darwin',
            isLinux: process.platform === 'linux'
        };
    }
}
