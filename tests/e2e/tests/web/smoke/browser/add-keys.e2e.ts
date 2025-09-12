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

let keyName = Common.generateWord(10);

fixture `Add keys`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can add Hash Key', async t => {
    keyName = Common.generateWord(10);
    // Add Hash key
    await browserPage.addHashKey(keyName);
    // Check the notification message
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Key has been added', 'The notification not displayed');
    // Check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The Hash key is not added');
});
test('Verify that user can add Set Key', async t => {
    keyName = Common.generateWord(10);
    // Add Set key
    await browserPage.addSetKey(keyName);
    // Check the notification message
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Key has been added', 'The notification not displayed');
    // Check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The Set key is not added');
});
test('Verify that user can add List Key', async t => {
    keyName = Common.generateWord(10);
    // Add List key
    await browserPage.addListKey(keyName);
    // Check the notification message
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Key has been added', 'The notification not displayed');
    // Check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The List key is not added');
});
test('Verify that user can add String Key', async t => {
    keyName = Common.generateWord(10);
    // Add String key
    await browserPage.addStringKey(keyName);
    // Check the notification message
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Key has been added', 'The notification not displayed');
    // Check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The String key is not added');
});
test('Verify that user can add ZSet Key', async t => {
    keyName = Common.generateWord(10);
    // Add ZSet key
    await browserPage.addZSetKey(keyName, '111');
    // Check the notification message
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Key has been added', 'The notification not displayed');
    // Check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The ZSet key is not added');
});
test('Verify that user can add JSON Key', async t => {
    keyName = Common.generateWord(10);
    const keyTTL = '2147476121';
    const value = '{"name":"xyz"}';

    // Add JSON key
    await browserPage.addJsonKey(keyName, value, keyTTL);
    // Check the notification message
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Key has been added', 'The notification not displayed');
    // Check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The JSON key is not added');
});
