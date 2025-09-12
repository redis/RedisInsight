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
const keyMember = '1111ZsetMember11111';
const score = '0';

fixture `ZSet Key fields verification`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can remove member from ZSet', async t => {
    keyName = Common.generateWord(10);
    await browserPage.addZSetKey(keyName, '6', keyTTL);
    // Add member to the ZSet key
    await browserPage.addMemberToZSet(keyMember, score);
    // Verify that user can add members to Zset
    await t.expect(browserPage.zsetMembersList.withExactText(keyMember).exists).ok('The Zset member not found', { timeout: 10000 });
    await t.expect(browserPage.zsetScoresList.withExactText(score).exists).ok('The Zset score not found', { timeout: 10000 });

    // Remove member from the key
    await t.click(browserPage.removeZsetMemberButton);
    await t.click(browserPage.confirmRemoveZSetMemberButton);
    // Check the notification message
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Member has been removed', 'The notification not found');
});
