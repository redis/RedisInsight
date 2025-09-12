import { DatabaseHelper } from '../../../../helpers/database';
import {
    MyRedisDatabasePage,
    WorkbenchPage,
    BrowserPage
} from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import { cloudDatabaseConfig, commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { Common } from '../../../../helpers/common';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

let keys: string[];

fixture `Database overview`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    });
test.after(async() => {
    // Delete database
    await browserPage.Cli.sendCommandInCli(`DEL ${keys.join(' ')}`);
    await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);

})('Verify that user can connect to DB and see breadcrumbs at the top of the application', async t => {
    // Create new keys
    keys = await Common.createArrayWithKeyValue(10);
    await browserPage.Cli.sendCommandInCli(`MSET ${keys.join(' ')}`);

    // Verify that user can see breadcrumbs in Browser and Workbench views
    await t.expect(browserPage.breadcrumbsContainer.visible).ok('User can not see breadcrumbs in Browser page', { timeout: 10000 });
    await t.click(browserPage.NavigationTabs.workbenchButton);
    await t.expect(browserPage.breadcrumbsContainer.visible).ok('User can not see breadcrumbs in Workbench page', { timeout: 10000 });

    // Verify that user can see total memory and total number of keys updated in DB header in Workbench page
    await t.expect(workbenchPage.OverviewPanel.overviewTotalKeys.exists).ok('User can not see total keys');
    await t.expect(workbenchPage.OverviewPanel.overviewTotalMemory.exists).ok('User can not see total memory');
});
test('Verify that user can set overview refresh', async t => {
    const common_command = 'info';

    await t.click(browserPage.OverviewPanel.autoRefreshArrow);
    // todo: review UI component. in fact eql to "5 sEdit" due to <title> inside this span. span -> div -> svg -> title
    await t.expect(browserPage.OverviewPanel.autoRefreshRateInput.textContent).contains('5 s', 'default value is incorrect');
    await t.click(browserPage.OverviewPanel.autoRefreshCheckbox);
    //Start Monitor
    await browserPage.Profiler.startMonitor();
    //Wait for 6 sec
    await t.wait(6000);
    await browserPage.Profiler.checkCommandInMonitorResults(common_command, undefined, false);

    await browserPage.Profiler.stopMonitor();
    await browserPage.OverviewPanel.setAutoRefreshValue('10');
    await t.click(browserPage.OverviewPanel.autoRefreshCheckbox);
    //Start Monitor
    await t.click( browserPage.Profiler.resetProfilerButton);
    await browserPage.Profiler.startMonitor();
    // verify that the info is not displayed after default value
    await t.wait(5000);
    await workbenchPage.Profiler.checkCommandInMonitorResults(common_command, undefined, false);
    // verify that the info is displayed after set value
    await workbenchPage.Profiler.checkCommandInMonitorResults(common_command);
});
