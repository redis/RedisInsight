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
let keyNames: string[] = [];
const keyTTL = '2147476121';

fixture `List of keys verifications`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test
    .after(async() => {
        // Clear and delete database
        for(const name of keyNames) {
            await apiKeyRequests.deleteKeyByNameApi(name, ossStandaloneConfig.databaseName);
        }
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can scroll List of Keys in DB', async t => {
        keyNames = [
            `key-${Common.generateWord(10)}`,
            `key-${Common.generateWord(10)}`,
            `key-${Common.generateWord(10)}`,
            `key-${Common.generateWord(10)}`
        ];

        await browserPage.addStringKey(keyNames[0]);
        await browserPage.addHashKey(keyNames[1]);
        await browserPage.addListKey(keyNames[2]);
        await browserPage.addStringKey(keyNames[3]);
        await t.click(browserPage.refreshKeysButton);
        // Verify that user can see List of Keys in DB
        await t.expect(browserPage.keyNameInTheList.exists).ok('The list of keys is not displayed');

        // Scroll to the key element
        await t.hover(browserPage.keyNameInTheList);
        await t.expect(browserPage.keyNameInTheList.exists).ok('The list of keys is not displayed');
    });
test('Verify that user can open key details', async t => {
    keyName = Common.generateWord(10);
    const keyValue = 'StringValue!';

    // Add String key
    await browserPage.addStringKey(keyName, keyTTL, keyValue);
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Key has been added', 'The notification is not displayed');
    await t.click(browserPage.closeKeyButton);
    // Search for the added key
    await browserPage.searchByKeyName(keyName);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('The key is not in the list');
    // Open the key details
    await t.click(browserPage.keyNameInTheList);
    const keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyName, 'The Key details is not opened');
});
