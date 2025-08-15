import { Selector, t } from 'testcafe';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import {
    cloudDatabaseConfig,
    commonUrl, ossClusterConfig,
    ossSentinelConfig
} from '../../../../helpers/conf';
import { Common } from '../../../../helpers/common';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyName = Common.generateWord(10);
const verifyCommandsInCli = async(): Promise<void> => {
    keyName = Common.generateWord(10);
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Add key from CLI
    await t.typeText(browserPage.Cli.cliCommandInput, `SADD ${keyName} "chinese" "japanese" "german"`, { replace: true, paste: true });
    await t.pressKey('enter');
    // Check that the key is added
    await browserPage.searchByKeyName(keyName);
    const keyNameInTheList = Selector(`[data-testid="key-${keyName}"]`);
    await Common.waitForElementNotVisible(browserPage.loader);
    await t.expect(keyNameInTheList.exists).ok(`${keyName} key is not added`);
};

fixture `Work with CLI in all types of databases`
    .meta({ type: 'regression' })
    .page(commonUrl);
test('Verify that user can add data via CLI in RE Cloud DB', async() => {
        // Verify that database index switcher not displayed for RE Cloud
        await t.expect(browserPage.OverviewPanel.changeIndexBtn.exists).notOk('Change Db index control displayed for RE Cloud DB');

        await verifyCommandsInCli();
    }).skip
    .meta({ rte: rte.reCloud, skipComment: "Unstable in CI, assertion error, needs investigation" })
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddRedisCloudDatabase(cloudDatabaseConfig);
    })
    .after(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, cloudDatabaseConfig.databaseName);
        await databaseHelper.deleteDatabase(cloudDatabaseConfig.databaseName);
    });
test
    .meta({ rte: rte.ossCluster })
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddOSSClusterDatabase(ossClusterConfig);
    })
    .after(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossClusterConfig.ossClusterDatabaseName);
        await databaseAPIRequests.deleteOSSClusterDatabaseApi(ossClusterConfig);
    })('Verify that user can add data via CLI in OSS Cluster DB', async() => {
        // Verify that database index switcher not displayed for RE Cloud
        await t.expect(browserPage.OverviewPanel.changeIndexBtn.exists).notOk('Change Db index control displayed for OSS Cluster DB');

        await verifyCommandsInCli();
    });
test
    .meta({ rte: rte.sentinel })
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddSentinelDatabaseApi(ossSentinelConfig);
    })
    .after(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await databaseAPIRequests.deleteAllDatabasesByConnectionTypeApi('SENTINEL');
    })('Verify that user can add data via CLI in Sentinel Primary Group', async() => {
        // Verify that database index switcher displayed for Sentinel
        await t.expect(browserPage.OverviewPanel.changeIndexBtn.exists).ok('Change Db index control not displayed for Sentinel DB');

        await verifyCommandsInCli();
    });
