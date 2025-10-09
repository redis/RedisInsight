import * as path from 'path';
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
const keyTTL = '2147476121';
const value = '{"name":"xyz"}';
const jsonObjectValue = '{name:"xyz"}';
const jsonFilePath = path.join('..', '..', '..', '..', 'test-data', 'big-json', 'big-json.json');

fixture `JSON Key verification`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can add key with value to any level of JSON structure', async t => {
    keyName = Common.generateWord(10);
    // Add Json key with json object
    await browserPage.addJsonKey(keyName, value, keyTTL);
    // Check the notification message
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Key has been added', 'The notification not found');
    // Verify that user can create JSON object
    await t.expect(browserPage.addJsonObjectButton.exists).ok('The add Json object button not found', { timeout: 10000 });
    await t.expect(browserPage.jsonKeyValue.textContentWithoutButtons).eql(jsonObjectValue, 'The json object value not found');

    // Add key with value on the same level
    await browserPage.addJsonKeyOnTheSameLevel('"key1"', '"value1"');
    // Check the added key contains json object with added key
    await t.expect(browserPage.addJsonObjectButton.exists).ok('The add Json object button not found', { timeout: 10000 });
    await t.expect(browserPage.jsonKeyValue.textContentWithoutButtons).eql('{name:"xyz"key1:"value1"}', 'The json object value not found');
    // Add key with value inside the json
    await browserPage.addJsonKeyOnTheSameLevel('"key2"', '{}');
    await browserPage.addJsonKeyInsideStructure('"key2222"', '12345');
    // Check the added key contains json object with added key
    await t.expect(browserPage.jsonKeyValue.textContentWithoutButtons).eql('{name:"xyz"key1:"value1"key2:{key2222:12345}}', 'The json object value not found');
});
test('Verify that user can add key with value to any level of JSON structure for big JSON object', async t => {
    keyName = Common.generateWord(10);
    // Add Json key with json object
    await t.click(browserPage.plusAddKeyButton);
    await t.click(browserPage.keyTypeDropDown);
    await t.click(browserPage.jsonOption);
    await t.click(browserPage.addKeyNameInput);
    await t.typeText(browserPage.addKeyNameInput, keyName, { replace: true, paste: true });
    await t.setFilesToUpload(browserPage.jsonUploadInput, [jsonFilePath]);
    await t.click(browserPage.addKeyButton);
    // Check the notification message
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Key has been added', 'The notification not found');
    // Add key with value on the same level
    await browserPage.addJsonKeyOnTheSameLevel('"key1"', '"value1"');
    // Check the added key contains json object with added key
    await t.expect(browserPage.addJsonObjectButton.exists).ok('The add Json object button not found', { timeout: 10000 });
    await t.expect(browserPage.jsonKeyValue.textContentWithoutButtons).contains('"key1:"value1"}', 'The json object value not found');
    // Add value inside the json array
    await browserPage.addJsonValueInsideStructure('12345');
    // Check the added key contains json object with added key
    await t.expect(browserPage.jsonKeyValue.textContentWithoutButtons).contains('"70:12345]', 'The json object value not found');
});
