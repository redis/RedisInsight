import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { Common } from '../../../../helpers/common';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyName = `KeyForSearch*?[]789${Common.generateWord(10)}`;
let keyName2 = Common.generateWord(10);
let randomValue = Common.generateWord(10);
const valueWithEscapedSymbols = 'KeyFor[A-G]*(';
const searchedKeyName = 'KeyForSearch\\*\\?\\[]789';
const searchedValueWithEscapedSymbols = 'KeyFor\\[A-G\\]\*\(';

fixture `Filtering per key name in Browser page`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(`${searchedKeyName}${randomValue}`);
    });
test('Verify that user can search per full key name', async t => {
    randomValue = Common.generateWord(10);
    keyName = `KeyForSearch*?[]789${randomValue}`;
    // Add new key
    await apiKeyRequests.addStringKeyApi({ keyName, value: 'a' }, ossStandaloneConfig)
    // Search by key with full name
    await browserPage.searchByKeyName(`${searchedKeyName}${randomValue}`);
    // Verify that key was found
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The key was not found');
});
test('Verify that user can filter per exact key without using any patterns', async t => {
    randomValue = Common.generateWord(10);
    keyName = `KeyForSearch*?[]789${randomValue}`;

    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Create new key for search
    await t.typeText(browserPage.Cli.cliCommandInput, `APPEND ${keyName} 1`, { replace: true, paste: true });
    await t.pressKey('enter');
    await t.click(browserPage.Cli.cliCollapseButton);
    // Filter per exact key without using any patterns
    await browserPage.searchByKeyName(`${searchedKeyName}${randomValue}`);
    // Verify that key was found
    await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was not found');
});
test
    .after(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await apiKeyRequests.deleteKeyByNameApi(keyName2, ossStandaloneConfig.databaseName);
        await apiKeyRequests.deleteKeyByNameApi(valueWithEscapedSymbols, ossStandaloneConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can filter per combined pattern with ?, *, [xy], [^x], [a-z] and escaped special symbols', async t => {
        keyName = `KeyForSearch${Common.generateWord(10)}`;
        keyName2 = `KeyForSomething${Common.generateWord(10)}`;

        // Add keys
        await apiKeyRequests.addStringKeyApi({ keyName, value: 'a' }, ossStandaloneConfig)
        await apiKeyRequests.addHashKeyApi({ keyName: keyName2, fields: [{ field: 'f', value: 'v' }] }, ossStandaloneConfig)
        await apiKeyRequests.addHashKeyApi({ keyName: valueWithEscapedSymbols, fields: [{ field: 'f', value: 'v' }] }, ossStandaloneConfig)

        // Filter per pattern with ?, *, [xy], [^x], [a-z]
        const searchedValue = 'Key?[A-z]rS[^o][ae]*';
        await browserPage.searchByKeyName(searchedValue);
        // Verify that key was found
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was not found');
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName2)).notOk('The key is found');
        // Filter with escaped special symbols
        await browserPage.searchByKeyName(searchedValueWithEscapedSymbols);
        // Verify that key was found
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(valueWithEscapedSymbols)).ok('The key was not found');
    });
