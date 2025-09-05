import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyName = Common.generateWord(10);
const keyTTL = '2147476121';
const value = '{"name":"xyz"}';

fixture `JSON Key verification`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can not add invalid JSON structure inside of created JSON', async t => {
    keyName = Common.generateWord(10);
    // Add Json key with json object
    await browserPage.addJsonKey(keyName, value, keyTTL);
    // Check the notification message
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Key has been added', 'The notification');
    await t.click(browserPage.Toast.toastCloseButton);
    // Add key with value on the same level
    await browserPage.addJsonKeyOnTheSameLevel('"key1"', '{}');
    // Add invalid JSON structure
    await browserPage.addJsonStructure('{"name": "Joe", "age": null, }');
    // Check the added key contains json object with added key
    await t.expect(browserPage.jsonError.textContent).eql('Value should have JSON format.', 'The json object error not displayed');
    // Add another invalid JSON structure
    await t.click(browserPage.refreshKeyButton);
    await browserPage.addJsonStructure('{"name": "Joe", "age": null]');
    // Check the added key contains json object with added key
    await t.expect(browserPage.jsonError.textContent).eql('Value should have JSON format.', 'The json object error not displayed');
    // Add another invalid JSON structure
    await t.click(browserPage.refreshKeyButton);
    await browserPage.addJsonStructure('{"name": "Joe", "age": null, }');
    // Check the added key contains json object with added key
    await t.expect(browserPage.jsonError.textContent).eql('Value should have JSON format.', 'The json object error not displayed');
});
