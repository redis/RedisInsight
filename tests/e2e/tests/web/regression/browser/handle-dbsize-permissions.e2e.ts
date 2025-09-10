import { t } from 'testcafe';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage } from '../../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneNoPermissionsConfig
} from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';

const browserPage = new BrowserPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const createUserCommand = 'acl setuser noperm nopass on +@all ~* -dbsize';
const keyName = Common.generateWord(20);
const createKeyCommand = `set ${keyName} ${Common.generateWord(20)}`;
const noPermDatabase = {
    ...ossStandaloneBigConfig,
    databaseName: ossStandaloneNoPermissionsConfig.databaseName,
}

fixture `Handle user permissions`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
        await browserPage.Cli.sendCommandInCli(createUserCommand);
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await databaseAPIRequests.addNewStandaloneDatabaseApi(noPermDatabase);
        await browserPage.reloadPage();
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(noPermDatabase);
    });

test('Verify that user without dbsize permissions can connect to DB', async t => {
    // Connect to DB
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneNoPermissionsConfig.databaseName);
    // Check that user can see total number of key is overview
    await t.expect(browserPage.OverviewPanel.overviewTotalKeys.find('div').withExactText('18 M').exists).ok('Total keys are not displayed');
    // Check that user can see total number of keys in browser
    await t.expect(browserPage.keysSummary.find('b').withText('18 00').exists).ok('Total number is not displayed');
    // Check that user can search per key
    await browserPage.Cli.sendCommandInCli(createKeyCommand);
    await browserPage.searchByKeyName(keyName);
    await t.expect(browserPage.keysNumberOfResults.textContent).eql('1', 'Found keys number not correct');
    await t.expect(browserPage.scannedValue.textContent).contains('18 000', 'Number of scanned not correct');
    await t.expect(browserPage.totalKeysNumber.textContent).contains('18 000', 'Number of total keys not correct');
    // Check bulk delete
    await browserPage.Cli.sendCommandInCli(createKeyCommand);
    await browserPage.searchByKeyName(keyName);
    await t.click(browserPage.bulkActionsButton);
    await browserPage.BulkActions.startBulkDelete();
    await t.expect(browserPage.BulkActions.bulkStatusCompleted.visible).ok('Bulk deletion is not completed', { timeout: 60000 });
});
