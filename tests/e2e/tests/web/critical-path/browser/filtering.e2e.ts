import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneConfigEmpty
} from '../../../../helpers/conf';
import { keyLength, KeyTypesTexts, rte } from '../../../../helpers/constants';
import { addKeysViaCli, deleteKeysViaCli, keyTypes } from '../../../../helpers/keys';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyName = Common.generateWord(10);
const keysData = keyTypes.map(object => ({ ...object }));
keysData.forEach(key => key.keyName = `${key.keyName}` + '-' + `${Common.generateWord(keyLength)}`);

fixture `Filtering per key name in Browser page`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfigEmpty);
    });
test
    .after(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfigEmpty.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfigEmpty);
    })('Verify that user can search a key with selected data type is filters', async t => {
        keyName = Common.generateWord(10);
        // Add new key
        await browserPage.addStringKey(keyName);
        // Search by key with full name & specified type
        await browserPage.selectFilterGroupType(KeyTypesTexts.String);
        await browserPage.searchByKeyName(keyName);
        // Verify that key was found
        const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
        await t.expect(isKeyIsDisplayedInTheList).ok('The key was not found');

        // Verify that key not found when selecting other key type
        await browserPage.selectFilterGroupType(KeyTypesTexts.List);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).notOk('The key was found by invalid filter');

        // Verify that user can see filtering per key name starts when he press Enter or clicks the control to filter per key name
        // Clear filter
        await t.click(browserPage.clearFilterButton);
        // Check the filtering starts by press Enter
        await t.typeText(browserPage.filterByPatterSearchInput, 'InvalidText', { replace: true, paste: true });
        await t.pressKey('enter');
        await t.expect(browserPage.searchAdvices.exists).ok('The filtering is not set');
        // Check the filtering starts by clicks the control
        await browserPage.reloadPage();
        await t.typeText(browserPage.filterByPatterSearchInput, 'InvalidText', { replace: true, paste: true });
        await t.click(browserPage.searchButton);
        await t.expect(browserPage.searchAdvices.exists).ok('The filtering is not set');
    });
test
    .after(async() => {
        // Clear keys and database
        await deleteKeysViaCli(keysData);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfigEmpty);
    })('Verify that user can filter keys per data type in Browser page', async t => {
        keyName = Common.generateWord(10);
        // Create new keys
        await addKeysViaCli(keysData);
        for (const { textType, keyName } of keysData) {
            await browserPage.selectFilterGroupType(textType);
            await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok(`The key of type ${textType} was found`);
            textType !== KeyTypesTexts.Graph
            ? await t.expect(browserPage.filteringLabel.textContent).contains(textType, 'Keys not filtered by key type')
            : await t.expect(browserPage.filteringLabel.textContent).contains('graphdata', 'Keys not filtered by key type')
            const regExp = new RegExp('[1-9]');
            await t.expect(browserPage.keysNumberOfResults.textContent).match(regExp, 'Number of found keys');
        }
        // Check for tree view
        await t.click(browserPage.treeViewButton);
        for (const { textType, keyName } of keysData) {
            await browserPage.selectFilterGroupType(textType);
            await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok(`The key of type ${textType} was found`);
            textType !== KeyTypesTexts.Graph
            ? await t.expect(browserPage.filteringLabel.textContent).contains(textType, 'Keys not filtered by key type')
            : await t.expect(browserPage.filteringLabel.textContent).contains('graphdata', 'Keys not filtered by key type')
            const regExp = new RegExp('[1-9]');
            await t.expect(browserPage.keysNumberOfResults.textContent).match(regExp, 'Number of found keys');
        }
    });
test
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
    })('Verify that user see the key type label when filtering per key types and when removes label the filter is removed on Browser page', async t => { //Check filtering labels
        for (const { textType } of keyTypes) {
            await browserPage.selectFilterGroupType(textType);
            // Check key type label
            await t.expect((await browserPage.filterByKeyTypeDropDown.innerText).toUpperCase).eql(textType.toUpperCase, `The label of type ${textType} is displayed`);
            if (['Stream', 'Graph', 'Time Series'].includes(textType)) {
                await t.expect(browserPage.keysNumberOfResults.textContent).eql('0', 'Number of found keys');
            }
            else {
                const regExp = new RegExp('5..');
                await t.expect(browserPage.keysNumberOfResults.textContent).match(regExp, 'Number of found keys');
            }
        }
    });
