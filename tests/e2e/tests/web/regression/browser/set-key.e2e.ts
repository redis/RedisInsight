import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { populateSetWithMembers } from '../../../../helpers/keys';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

const dbParameters = { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port };
const keyName = `TestSetKey-${ Common.generateWord(10) }`;
const memberForSearch = `SearchField-${ Common.generateWord(5) }`;
const keyToAddParameters = { membersCount: 500000, keyName, memberStartWith: 'setMember' };

fixture `Set Key verification`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        await apiKeyRequests.addSetKeyApi({
            keyName,
            ttl: 2147476121,
            members: ['testMember']
        }, ossStandaloneConfig);
        await browserPage.navigateToKey(keyName);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can search per exact member name in Set key in DB with 1 million of members', async t => {
    // Add 1000000 members to the set key
    await populateSetWithMembers(dbParameters.host, dbParameters.port, keyToAddParameters);
    await populateSetWithMembers(dbParameters.host, dbParameters.port, keyToAddParameters);
    // Add custom member to the set key
    await browserPage.openKeyDetails(keyName);
    await browserPage.addMemberToSet(memberForSearch);
    // Search by full member name
    await browserPage.searchByTheValueInSetKey(memberForSearch);
    // Check the search result
    const result = await browserPage.setMembersList.nth(0).textContent;
    await t.expect(result).eql(memberForSearch, 'Set member not found');
});
