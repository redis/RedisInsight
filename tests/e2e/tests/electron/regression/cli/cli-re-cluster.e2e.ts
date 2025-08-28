import { Selector, t } from 'testcafe';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import {
    commonUrl,
    redisEnterpriseClusterConfig
} from '../../../../helpers/conf';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
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

fixture `Work with CLI in RE Cluster`
    .meta({ type: 'regression' })
    .page(commonUrl);
test.skip
    .meta({ rte: rte.reCluster })
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddRedisSoftwareDatabase(redisEnterpriseClusterConfig);
    })
    .after(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, redisEnterpriseClusterConfig.databaseName);
        await databaseHelper.deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })('Verify that user can add data via CLI in RE Cluster DB', async() => {
        // Verify that database index switcher not displayed for RE Cluster
        await t.expect(browserPage.OverviewPanel.changeIndexBtn.exists).notOk('Change Db index control displayed for RE Cluster DB');

        await verifyCommandsInCli();
    });
