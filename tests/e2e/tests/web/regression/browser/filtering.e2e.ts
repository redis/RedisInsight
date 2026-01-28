import { Selector } from 'testcafe';
import { KeyTypesTexts, rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig, ossStandaloneBigConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { keyTypes } from '../../../../helpers/keys';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyName = Common.generateWord(20);
let keyName2 = Common.generateWord(20);
const COMMAND_GROUP_SET = 'Set';

fixture `Filtering per key name in Browser page`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that when user searches not existed key, he can see the standard screen when there are no keys found', async t => {
    keyName = `KeyForSearch*${Common.generateWord(10)}?[]789`;
    const searchedKeyName = 'key00000qwertyuiop[asdfghjkl';
    const searchedValue = 'KeyForSear*';

    // Add new key
    await apiKeyRequests.addStringKeyApi({
        keyName,
        value: 'v',
    }, ossStandaloneConfig);

    // Search not existed key
    await browserPage.searchByKeyName(searchedKeyName);
    // Verify the standard screen when there are no keys found
    const noResultsFound = await browserPage.noResultsFound.textContent;
    const searchAdvices = await browserPage.searchAdvices.textContent;
    await t.expect(noResultsFound).eql('No results found.', 'The no results text not displayed');
    await t.expect(searchAdvices).eql('Check the spelling.Check upper and lower cases.Use an asterisk (*) in your request for more generic results.', 'The advices text not displayed');

    // Filter per pattern with *
    await browserPage.searchByKeyName(searchedValue);
    // Verify that user can filter per pattern with * (matches keys with any number of characters instead of *)
    await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was not found');
});
test('Verify that user can filter per pattern with ? (matches keys with any character (only one) instead of ?)', async t => {
    const randomValue = Common.generateWord(10);
    const searchedValue = `?eyForSearch\\*\\?\\[]789${randomValue}`;
    keyName = `KeyForSearch*?[]789${randomValue}`;

    // Add new key
    await apiKeyRequests.addStringKeyApi({
        keyName,
        value: 'v',
    }, ossStandaloneConfig);
    // Filter per pattern with ?
    await browserPage.searchByKeyName(searchedValue);
    // Verify that key was found
    await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was not found');
});
test
    .after(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await apiKeyRequests.deleteKeyByNameApi(keyName2, ossStandaloneConfig.databaseName);
    })('Verify that user can filter per pattern with [xy] (matches one symbol: either x or y))', async t => {
        keyName = `KeyForSearch${Common.generateWord(10)}`;
        keyName2 = `KeyForFearch${Common.generateWord(10)}`;
        const searchedValue1 = 'KeyFor[SF]*';
        const searchedValue2 = 'KeyFor[^F]*';
        const searchedValue3 = 'KeyFor[A-G]*';

        // Add keys
        await apiKeyRequests.addStringKeyApi({
            keyName,
            value: 'v',
        }, ossStandaloneConfig);
        await apiKeyRequests.addHashKeyApi({
            keyName: keyName2,
            fields: [{
                field: 'f',
                value: 'v',
            }],
        }, ossStandaloneConfig);
        // Filter per pattern with [XY]
        await browserPage.searchByKeyName(searchedValue1);
        // Verify that key was found with filter per pattern with [xy]
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was not found');
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName2)).ok('The key was not found');

        await browserPage.searchByKeyName(searchedValue2);
        // Verify that user can filter per pattern with [^x] (matches one symbol except x)
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The key was not found');
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName2)).notOk('The wrong key found');

        await browserPage.searchByKeyName(searchedValue3);
        // Verify that user can filter per pattern with [a-z] (matches any symbol in range from A till Z)
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName2)).ok('The key was not found');
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).notOk('The wrong key found');
    });
test('Verify that when user clicks on “clear” control with no filter per key name applied all characters and filter per key type are removed, “clear” control is disappeared', async t => {
    keyName = `KeyForSearch${Common.generateWord(10)}`;

    // Set filter by key type and filter per key name
    await browserPage.searchByKeyName(keyName);
    await browserPage.selectFilterGroupType(COMMAND_GROUP_SET);
    // Verify that when user clicks on “clear” control and filter per key name is applied all characters and filter per key type are removed, “clear” control is disappeared
    await t.click(browserPage.clearFilterButton);
    await t.expect(browserPage.multiSearchArea.find(browserPage.cssFilteringLabel).visible).notOk('The filter per key type is not removed');
    await t.expect(browserPage.filterByPatterSearchInput.getAttribute('value')).eql('', 'All characters from filter input are not removed');
    await t.expect(browserPage.clearFilterButton.visible).notOk('The clear control is not disappeared');
    await apiKeyRequests.addStringKeyApi({
        keyName,
        value: 'v',
    }, ossStandaloneConfig);
    // Search for not existed key name
    await browserPage.searchByKeyName(keyName2);
    await t.expect(browserPage.keysContainer.textContent).contains('No results found.', 'Key is not found message not displayed');
    // Verify that when user clicks on “clear” control and filter per key name is applied filter is reset and rescan initiated
    await t.click(browserPage.clearFilterButton);
    await t.expect(browserPage.filterByPatterSearchInput.getAttribute('value')).eql('', 'The filtering is not reset');
    await t.expect(browserPage.noResultsFound.exists).notOk('No results found message is not hidden');

    // Set filter by key type and type characters
    await t.typeText(browserPage.filterByPatterSearchInput, keyName);
    await browserPage.selectFilterGroupType(COMMAND_GROUP_SET);
    // Verify the clear control with no filter per key name
    await t.click(browserPage.clearFilterButton);
    await t.expect(browserPage.multiSearchArea.find(browserPage.cssFilteringLabel).visible).notOk('The filter per key type is not removed');
    await t.expect(browserPage.filterByPatterSearchInput.getAttribute('value')).eql('', 'All characters from filter input are not removed');
    await t.expect(browserPage.clearFilterButton.visible).notOk('The clear control is not disappeared');
});
test
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
    })
    .after(async() => {
        // Delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneBigConfig.databaseName);
    })('Verify that user can filter per exact key without using any patterns in DB with 10 millions of keys', async t => {
        // Create new key
        keyName = `KeyForSearch-${Common.generateWord(10)}`;
        await apiKeyRequests.addSetKeyApi({
            keyName,
            members: ['m'],
        }, ossStandaloneBigConfig);
        // Search by key name
        await browserPage.searchByKeyName(keyName);
        // Verify that required key is displayed
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('Key not found');
        // Check searched key in tree view
        await t.click(browserPage.treeViewButton);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('Key not found');
    });
test
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
    })('Verify that user can filter per key name using patterns in DB with 10-50 millions of keys', async t => {
        keyName = 'device*';
        await browserPage.selectFilterGroupType(KeyTypesTexts.Set);
        await browserPage.searchByKeyName(keyName);
        for (let i = 0; i < 10; i++) {
            // Verify that keys are filtered
            await t.expect(browserPage.keyNameInTheList.nth(i).textContent).contains('device', 'Keys filtered incorrectly by key name')
                .expect(browserPage.keyNameInTheList.nth(i).textContent).contains('set', 'Keys filtered incorrectly by key type');
        }
        await t.click(browserPage.treeViewButton);
        // Verify that user can use the "Scan More" button to search per another 10000 keys
        await browserPage.verifyScannningMore();

        // Verify that user can filter per key type in DB with 10-50 millions of keys
        await t.click(browserPage.browserViewButton);
        await t.click(browserPage.clearFilterButton);
        for (let i = 0; i < keyTypes.length - 2; i++) {
            await browserPage.selectFilterGroupType(keyTypes[i].textType);
            const filteredTypeKeys = keyTypes[i].keyName === 'json'
                ? Selector('[data-testid^=badge-ReJSON]')
                : Selector(`[data-testid^=badge-${keyTypes[i].keyName}]`);
            // Verify that all results have the same type as in filter
            await t.expect(browserPage.filteringLabel.count).eql(await filteredTypeKeys.count, `The keys of type ${keyTypes[i].textType} not filtered correctly`);
        }
    });
