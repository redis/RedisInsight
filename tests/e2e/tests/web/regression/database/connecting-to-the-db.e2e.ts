import { ClientFunction } from 'testcafe';
import { DatabaseHelper } from '../../../../helpers/database';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import {
    commonUrl,
    ossClusterConfig,
    ossSentinelConfig
} from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();

const getPageUrl = ClientFunction(() => window.location.href);

fixture `Connecting to the databases verifications`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    });
// TODO : More investigation needed around the connection
test.skip
    .meta({ rte: rte.sentinel, skipComment: "Skipped because of failure to connect to local sentinel DB"})
    .after(async() => {
        // Delete database
        await myRedisDatabasePage.deleteDatabaseByName(ossSentinelConfig.masters[0].name);
        await myRedisDatabasePage.deleteDatabaseByName(ossSentinelConfig.masters[1].name);
    })('Verify that user can connect to Sentinel DB', async t => {
        // Add OSS Sentinel DB
        await databaseHelper.discoverSentinelDatabase(ossSentinelConfig);

        // Get groups & their count
        const sentinelGroups = myRedisDatabasePage.dbNameList.withText('primary-group');
        const sentinelGroupsCount = await sentinelGroups.count;

        // Verify new connection badge for Sentinel db
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(ossSentinelConfig.masters[0].name);
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(ossSentinelConfig.masters[1].name);

        // Verify all groups for connection
        for (let i = 0; i < sentinelGroupsCount; i++) {
            const groupSelector = sentinelGroups.nth(i);
            // Connect to DB
            await myRedisDatabasePage.clickOnDBByName(await groupSelector.textContent);
            // Check that browser page was opened
            await t.expect(getPageUrl()).contains('browser', 'Browser page not opened');
            // Go to databases list
            await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        }
    });
test
    .meta({ rte: rte.ossCluster })
    .after(async() => {
        await databaseHelper.deleteDatabase(ossClusterConfig.ossClusterDatabaseName);
    })
    .skip('Verify that user can connect to OSS Cluster DB', async t => {
        // Add OSS Cluster DB
        await databaseHelper.addOSSClusterDatabase(ossClusterConfig);
        await myRedisDatabasePage.clickOnDBByName(ossClusterConfig.ossClusterDatabaseName);
        // Check that browser page was opened
        await t.expect(getPageUrl()).contains('browser', 'Browser page not opened');
    });
