import { DatabaseHelper } from '../../../../helpers/database';
import {
    MyRedisDatabasePage,
    WorkbenchPage,
    BrowserPage
} from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import { cloudDatabaseConfig, commonUrl, ossStandaloneRedisearch } from '../../../../helpers/conf';
import { Common } from '../../../../helpers/common';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { BrowserActions } from '../../../../common-actions/browser-actions';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const browserPage = new BrowserPage();
const browserActions = new BrowserActions();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keys: string[];
const keyName = Common.generateWord(10);
const keysAmount = 5;
const index = '1';

fixture `Database overview`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async t => {
        // Create databases and keys
        await databaseHelper.acceptLicenseTermsAndAddDatabase(ossStandaloneRedisearch);
        await browserPage.addStringKey(keyName);
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.AddRedisDatabaseDialog.addLogicalRedisDatabase(ossStandaloneRedisearch, index);
        await myRedisDatabasePage.clickOnDBByName(`${ossStandaloneRedisearch.databaseName} [db${index}]`);
        keys = await Common.createArrayWithKeyValue(keysAmount);
        await browserPage.Cli.sendCommandInCli(`MSET ${keys.join(' ')}`);
    })
    .afterEach(async t => {
        // Clear and delete databases
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(`${ossStandaloneRedisearch.databaseName} [db${index}]`);
        await browserPage.Cli.sendCommandInCli(`DEL ${keys.join(' ')}`);
        await databaseHelper.deleteCustomDatabase(`${ossStandaloneRedisearch.databaseName} [db${index}]`);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneRedisearch.databaseName);
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneRedisearch.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneRedisearch);
    });
test
    .meta({ rte: rte.standalone })
    .skip('Verify that user can see total and current logical database number of keys (if there are any keys in other logical DBs)', async t => {
        // Wait for Total Keys number refreshed
        await t.expect(browserPage.OverviewPanel.overviewTotalKeys.withText(`${keysAmount + 1}`).exists).ok('Total keys are not changed', { timeout: 10000 });
        await t.hover(workbenchPage.OverviewPanel.overviewTotalKeys);
        // Verify that user can see total number of keys and number of keys in current logical database
        await t.expect(browserPage.tooltip.visible).ok('Total keys tooltip not displayed');
        await browserActions.verifyTooltipContainsText(`${keysAmount + 1}\nTotal Keys\ndb1:\n${keysAmount}\nKeys`, true);

        // Open Database
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneRedisearch.databaseName);
        await t.hover(workbenchPage.OverviewPanel.overviewTotalKeys);
        // Verify that user can see total number of keys and not it current logical database (if there are no any keys in other logical DBs)
        await t.expect(browserPage.tooltip.visible).ok('Total keys tooltip not displayed');
        await browserActions.verifyTooltipContainsText(`${keysAmount + 1}\nTotal Keys`, true);
        await browserActions.verifyTooltipContainsText('db1', false);
    });
test('Verify that when users hover over keys icon in Overview for Cloud DB, they see only total number of keys in tooltip', async t => {
        await t.hover(workbenchPage.OverviewPanel.overviewTotalKeys);
        // Verify that user can see only total number of keys
        await t.expect(browserPage.tooltip.visible).ok('Total keys tooltip not displayed');
        await browserActions.verifyTooltipContainsText('Total Keys', true);
        await browserActions.verifyTooltipContainsText('db1', false);
    })
    .skip
    .meta({ rte: rte.reCloud, skipComment: "Unstable CI execution, assertion failure, needs investigation" })
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddRECloudDatabase(cloudDatabaseConfig);
    })
    .after(async() => {
        // Delete database
        await databaseHelper.deleteDatabase(cloudDatabaseConfig.databaseName);
    });
