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
const keyTTL = 2147476121;
const keyFieldValue = 'hashField11111';
const keyValue = 'hashValue11111!';

fixture `Hash Key fields verification`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can search by full field name in Hash', async t => {
    keyName = Common.generateWord(10);

    await apiKeyRequests.addHashKeyApi({
        keyName,
        ttl: keyTTL,
        fields: [{
            field: keyFieldValue,
            value: keyValue
        }]
    }, ossStandaloneConfig);
    await browserPage.navigateToKey(keyName);

    // Search by full field name
    await browserPage.searchByTheValueInKeyDetails(keyFieldValue);
    // Check the search result
    const result = browserPage.hashFieldsList.nth(0).textContent;
    await t.expect(result).contains(keyFieldValue, 'The hash field not found by full field name');
    // Verify that user can search by part field name in Hash with pattern * in Hash
    await browserPage.secondarySearchByTheValueInKeyDetails('hashField*');
    // Check the search result
    await t.expect(result).eql(keyFieldValue, 'The hash field');
    // Search by part field name and the * in the beggining
    await browserPage.secondarySearchByTheValueInKeyDetails('*11111');
    // Check the search result
    await t.expect(result).eql(keyFieldValue, 'The hash field');
    // Search by part field name and the * in the middle
    await browserPage.secondarySearchByTheValueInKeyDetails('hash*11111');
    // Check the search result
    await t.expect(result).eql(keyFieldValue, 'The hash field not found by pattern');
});
