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
const keyMember = '1111setMember11111';

fixture `Set Key fields verification`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can search by full member name in Set', async t => {
    keyName = Common.generateWord(10);

    await apiKeyRequests.addSetKeyApi({
        keyName,
        ttl: keyTTL,
        members: ['1111', keyMember],
    }, ossStandaloneConfig);
    await browserPage.navigateToKey(keyName)

    await browserPage.searchByTheValueInSetKey(keyMember);
    // Verify search by full member name
    let result = await browserPage.setMembersList.nth(0).textContent;
    await t.expect(result).eql(keyMember, 'The set member not found');

    // Verify that user can search by part member name with pattern * in Set
    await browserPage.searchByTheValueInSetKey('1111set*');
    // Verify search by part member name in the end
    await t.expect(result).eql(keyMember, 'The set member by part member name in the end not found');

    await browserPage.searchByTheValueInSetKey('*Member11111');
    // Verify search by part member name in the beggining
    result = await browserPage.setMembersList.nth(0).textContent;
    await t.expect(result).eql(keyMember, 'The set member by part member name in the beggining not found');

    await browserPage.searchByTheValueInSetKey('1111*11111');
    // Verify search by part member name in the middle
    result = await browserPage.setMembersList.nth(0).textContent;
    await t.expect(result).eql(keyMember, 'The set member by part member name in the middle not found');
});
