import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossClusterConfig, ossStandaloneBigConfig, ossStandaloneConfig } from '../../../../helpers/conf';
import { Common } from '../../../../helpers/common';
import { KeyTypesTexts, rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

let keys: string[];

fixture `Filtering iteratively in Browser page`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        await browserPage.Cli.sendCommandInCli('flushdb');
    })
    .afterEach(async() => {
        // Clear and delete database
        await browserPage.Cli.sendCommandInCli(`DEL ${keys.join(' ')}`);
    });
test
    .meta({ rte: rte.standalone })('Verify that user can see search results per 500 keys if number of results is 500', async t => {
        // Create new keys
        keys = await Common.createArrayWithKeyValue(500);
        await browserPage.Cli.sendCommandInCli(`MSET ${keys.join(' ')}`);
        // Search all keys
        await browserPage.searchByKeyName('*');
        const keysNumberOfResults = await browserPage.keysNumberOfResults.textContent;
        // Verify that number of results is 500
        await t.expect(keysNumberOfResults).match(/50[0-9]/, 'Number of results is not 500');
    });
test
    .meta({ rte: rte.standalone })('Verify that user can search iteratively via Scan more for search pattern and selected data type', async t => {
        // Create new keys
        keys = await Common.createArrayWithKeyValue(1000);
        await browserPage.Cli.sendCommandInCli(`MSET ${keys.join(' ')}`);
        // Search all string keys
        await browserPage.selectFilterGroupType(KeyTypesTexts.String);
        await browserPage.searchByKeyName('*');
        // Verify that scan more button is shown
        await t.expect(browserPage.scanMoreButton.exists).ok('Scan more is not shown');
        await t.click(browserPage.scanMoreButton);
        // Verify that number of results is 1000
        const keysNumberOfResults = await browserPage.keysNumberOfResults.textContent;
        await t.expect(keysNumberOfResults).match(/1 00[0-9]/, 'Number of results is not 1 000');
    });
test
    .meta({ rte: rte.ossCluster })
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddOSSClusterDatabase(ossClusterConfig);
    })
    .after(async() => {
        // Clear and delete database
        await browserPage.Cli.sendCommandInCli(`DEL ${keys.join(' ')}`);
    })('Verify that user can search via Scan more for search pattern and selected data type in OSS Cluster DB', async t => {
        // Create new keys
        keys = await Common.createArrayWithKeyValueForOSSCluster(1000);
        await browserPage.Cli.sendCommandInCli(`MSET ${keys.join(' ')}`);
        // Search all string keys
        await browserPage.selectFilterGroupType(KeyTypesTexts.String);
        await browserPage.searchByKeyName('*');
        // Verify that scan more button is shown
        await t.expect(browserPage.scanMoreButton.exists).ok('Scan more is not shown');
        await t.click(browserPage.scanMoreButton);
        const regExp = new RegExp('1 0' + '.');
        // Verify that number of results is 1000
        const scannedValueText = await browserPage.scannedValue.textContent;
        await t.expect(scannedValueText).match(regExp, 'Number of results is not 1 000');
    });
test
    .meta({ rte: rte.standalone })
    .before(async() => {
        // Add Big standalone DB
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
    })('Verify that user use Scan More in DB with 10-50 millions of keys (when search by pattern/)', async t => {
        // Search all string keys
        await browserPage.searchByKeyName('*');
        // Verify that scan more button is shown
        await t.expect(browserPage.scanMoreButton.exists).ok('Scan more is not shown');
        await t.click(browserPage.scanMoreButton);
        const regExp = new RegExp('1 0' + '.');
        // Verify that number of results is 1000
        const scannedValueText = await browserPage.scannedValue.textContent;
        await t.expect(scannedValueText).match(regExp, 'Number of results is not 1 000');
    });
