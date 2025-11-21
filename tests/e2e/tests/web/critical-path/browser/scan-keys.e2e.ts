import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import {
    MyRedisDatabasePage,
    BrowserPage,
    SettingsPage
} from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { Common } from '../../../../helpers/common';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const settingsPage = new SettingsPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

let keys: string[] = [];

const explicitErrorHandler = (): void => {
    window.addEventListener('error', e => {
        if(e.message === 'ResizeObserver loop limit exceeded') {
            e.stopImmediatePropagation();
        }
    });
};

fixture `Browser - Specify Keys to Scan`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .clientScripts({ content: `(${explicitErrorHandler.toString()})()` })
    .beforeEach(async(t) => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        // Force switch to list view
        await t.click(browserPage.browserViewButton);
    })
    .afterEach(async t => {
        //Clear and delete database
        await browserPage.Cli.sendCommandInCli(`DEL ${keys.join(' ')}`);
        await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
        await t.click(settingsPage.accordionAdvancedSettings);
        await settingsPage.changeKeysToScanValue('10000');
    });
test('Verify that the user can see this number of keys applied to new filter requests and to "scan more" functionality in Browser page', async t => {
    const searchPattern = 'key[12]*';
    // Go to Settings page
    await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
    // Specify keys to scan
    await t.click(settingsPage.accordionAdvancedSettings);
    await settingsPage.changeKeysToScanValue('1000');
    // Go to Browser Page
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
    // Connect to DB
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Create new keys
    keys = await Common.createArrayWithKeyValue(2500);
    await t.typeText(browserPage.Cli.cliCommandInput, `MSET ${keys.join(' ')}`, { paste: true });
    await t.pressKey('enter');
    await t.click(browserPage.Cli.cliCollapseButton);
    // Search keys
    await browserPage.searchByKeyName(searchPattern);
    const keysNumberOfScanned = await browserPage.scannedValue.textContent;
    // Verify that number of scanned is 1000
    await t.expect(keysNumberOfScanned).contains('1 000', 'Number of scanned is not 1000');
    // Scan more
    await t.click(browserPage.scanMoreButton);
    const keysNumberOfScannedScanMore = await browserPage.scannedValue.textContent;
    // Verify that number of results is 2000
    await t.expect(keysNumberOfScannedScanMore).contains('2 000', 'Number of scanned is not 2000');
});
