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

fixture `Keys refresh functionality`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test.skip('Verify that user can refresh Keys', async t => {
    keyName = Common.generateWord(10);
    const newKeyName = 'KeyNameAfterEdit!testKey';

    // Add hash key
    await browserPage.addHashKey(keyName);
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Key has been added', 'The notification is not displayed');
    await t.click(browserPage.closeKeyButton);
    // Search for the added key
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).eql(true, 'The key is not in the list');
    // Edit the key name in details
    await t.click(browserPage.keyNameInTheList);
    await browserPage.editKeyName(newKeyName);
    // Refresh Keys
    await t.click(browserPage.refreshKeysButton);
    await browserPage.searchByKeyName(keyName);
    const isKeyIsNotDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsNotDisplayedInTheList).eql(false, 'The key is still in the list');
});
