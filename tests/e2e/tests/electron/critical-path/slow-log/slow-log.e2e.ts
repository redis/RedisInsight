import { SlowLogPage, MyRedisDatabasePage, BrowserPage, ClusterDetailsPage } from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { commonUrl, ossStandaloneBigConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const slowLogPage = new SlowLogPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const overviewPage = new ClusterDetailsPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const slowerThanParameter = 1;
let maxCommandLength = 50;
const command = `slowlog get ${maxCommandLength}`;

fixture `Slow Log`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
        await t.click(slowLogPage.NavigationTabs.analysisButton);
        await t.click(slowLogPage.slowLogTab);
    })
    .afterEach(async() => {
        await slowLogPage.resetToDefaultConfig();
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    });
test('Verify that user can open new Slow Log page using new icon on left app panel', async t => {
    // Verify that user see "Slow Log" page by default for non OSS Cluster
    await t.expect(overviewPage.overviewTab.withAttribute('aria-selected', 'true').exists).notOk('The Overview tab is displayed for non OSS Cluster db');
    // Verify that user can configure slowlog-max-len for Slow Log and see whole set of commands according to the setting
    await slowLogPage.changeSlowerThanParameter(slowerThanParameter, slowLogPage.slowLogConfigureMicroSecondsUnit);
    await slowLogPage.Cli.sendCommandInCli(command);
    await t.click(slowLogPage.slowLogRefreshButton);
    const duration = await slowLogPage.slowLogCommandValue.withExactText(command).parent(3).find(slowLogPage.cssSelectorDurationValue).textContent;
    await t.expect(parseInt(duration)).gte(slowerThanParameter, 'Displayed command time execution is more than specified');
    // Verify that user can see 3 columns with timestamp, duration and command in Slow Log
    await t.expect(slowLogPage.slowLogTimestampValue.exists).ok('Timestamp column');
    await t.expect(slowLogPage.slowLogDurationValue.exists).ok('Duration column');
    await t.expect(slowLogPage.slowLogCommandValue.exists).ok('Command column');
});
test('Verify that user can see "No Slow Logs found" message when slowlog-max-len=0', async t => {
    // Set slowlog-max-len=0
    maxCommandLength = 0;
    await slowLogPage.changeMaxLengthParameter(maxCommandLength);
    await t.click(slowLogPage.slowLogRefreshButton);
    // Check that no records are displayed in SlowLog table
    await t.expect(slowLogPage.slowLogEmptyResult.exists).ok('Empty results not found');
    // Verify that user can see not more that number of commands that was specified in configuration
    maxCommandLength = 30;
    await slowLogPage.changeSlowerThanParameter(slowerThanParameter, slowLogPage.slowLogConfigureMicroSecondsUnit);
    await slowLogPage.changeMaxLengthParameter(maxCommandLength);
    // Go to Browser page to scan keys and turn back
    await t.click(slowLogPage.NavigationTabs.browserButton);
    await t.click(browserPage.refreshKeysButton);
    await t.click(browserPage.NavigationTabs.analysisButton);
    await t.click(slowLogPage.slowLogTab);
    // Compare number of logged commands with maxLength
    await t.expect(slowLogPage.slowLogCommandStatistics.withText(`${maxCommandLength} entries`).exists).ok(`Number of displayed commands is less than selected ${maxCommandLength}`);
});
