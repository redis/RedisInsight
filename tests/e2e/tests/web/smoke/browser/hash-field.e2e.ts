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
const keyFieldValue = 'hashField11111';
const keyValue = 'hashValue11111!';

fixture `Hash Key fields verification`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can add field to Hash', async t => {
    keyName = Common.generateWord(10);
    await browserPage.addHashKey(keyName, keyTTL);
    // Add field to the hash key
    await browserPage.addFieldToHash(keyFieldValue, keyValue);
    // Search the added field
    await browserPage.searchByTheValueInKeyDetails(keyFieldValue);
    // Check the added field
    await t.expect(browserPage.hashValuesList.withExactText(keyValue).exists).ok('The value is not displayed', { timeout: 10000 });
    await t.expect(browserPage.hashFieldsList.withExactText(keyFieldValue).exists).ok('The field is not displayed', { timeout: 10000 });

    // Verify that user can remove field from Hash
    await t.click(browserPage.removeHashFieldButton);
    await t.click(browserPage.confirmRemoveHashFieldButton);
    // Check the notification message
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Field has been removed', 'The notification is not displayed');
});
