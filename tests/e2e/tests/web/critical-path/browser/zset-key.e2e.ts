import { DatabaseHelper } from '../../../../helpers/database';
import { Common } from '../../../../helpers/common';
import { rte } from '../../../../helpers/constants';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyName = Common.generateWord(10);
const keyTTL = 2147476121;
const keyMember = '1111ZsetMember11111';

fixture `ZSet Key fields verification`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can search by member in Zset', async t => {
    keyName = Common.generateWord(10);
    await apiKeyRequests.addSortedSetKeyApi({
        keyName,
        ttl: keyTTL,
        members: [{
            name: '12345qwerty',
            score: 0,
        }]
    }, ossStandaloneConfig);
    await browserPage.navigateToKey(keyName);

    // Add member to the ZSet key
    await browserPage.addMemberToZSet(keyMember, '3');
    // Search by member name
    await browserPage.searchByTheValueInKeyDetails(keyMember);
    // Check the search result
    const result = await browserPage.zsetMembersList.nth(0).textContent;
    await t.expect(result).eql(keyMember, 'The Zset member');
});
test('Verify that user can sort Zset members by score by DESC and ASC', async t => {
    keyName = Common.generateWord(10);
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    //Create new key with a lot of members
    const arr = await Common.createArray(100);
    await t.typeText(browserPage.Cli.cliCommandInput, `ZADD ${keyName} ${arr.join(' ')}`, { paste: true });
    await t.pressKey('enter');
    await t.click(browserPage.Cli.cliCollapseButton);
    // Open key details
    await browserPage.openKeyDetails(keyName);
    // Sort Zset members by score by DESC and verify result
    await t.click(browserPage.scoreButton);
    let result = await browserPage.zsetScoresList.textContent;
    await t.expect(result).eql(arr[100 - 1], 'The Zset sort by desc');
    // Sort Zset members by score by ASC and verify result
    await t.click(browserPage.scoreButton);
    result = await browserPage.zsetScoresList.textContent;
    await t.expect(result).eql(arr[1], 'The Zset sort by desc');
});
