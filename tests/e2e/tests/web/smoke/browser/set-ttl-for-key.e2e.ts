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

fixture `Set TTL for Key`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can specify TTL for Key', async t => {
    keyName = Common.generateWord(10);
    const ttlValue = '2147476121';

    // Create new key without TTL
    await browserPage.addStringKey(keyName);
    // Open Key details
    await browserPage.openKeyDetails(keyName);
    // Click on TTL button to edit TTL
    await t.click(browserPage.editKeyTTLButton);
    // Set TTL value
    await t.typeText(browserPage.editKeyTTLInput, ttlValue, { replace: true, paste: true });
    // Save the TTL value
    await t.click(browserPage.EditorButton.applyBtn);
    // Refresh the page in several seconds
    await t.wait(3000);
    await t.click(browserPage.refreshKeyButton);
    // Verify that TTL was updated
    const newTtlValue = await browserPage.ttlText.innerText;
    await t.expect(Number(ttlValue)).gt(Number(newTtlValue), 'ttlValue is not greater than newTTLValue');
});
