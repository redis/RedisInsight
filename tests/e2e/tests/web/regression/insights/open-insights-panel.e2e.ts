import { BrowserPage, MyRedisDatabasePage, WorkbenchPage } from '../../../../pageObjects';
import { Compatibility, ExploreTabs, rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import {
    commonUrl,
    ossStandaloneConfig,
    ossStandaloneV5Config
} from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const workbenchPage = new WorkbenchPage();
const myRedisDatabasePage = new MyRedisDatabasePage();

const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

fixture `Open insights panel`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test
    .before(async() => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.deleteAllDatabasesApi();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneV5Config);
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneConfig, true);
        await browserPage.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneV5Config.databaseName);
    })
    .after(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
    })
    .skip('Verify that insights panel is opened in cloud db if users db does not have some module', async t => {
        await t.click(browserPage.redisearchModeBtn);
        await t.click(browserPage.Modal.closeModalButton);
        await t.click(browserPage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.expect(browserPage.InsightsPanel.sidePanel.exists).ok('Insights panel is not opened');
        await t.expect(await browserPage.InsightsPanel.existsCompatibilityPopover.textContent).contains('Redis Query Engine', 'popover is not displayed');
        const tab = await browserPage.InsightsPanel.setActiveTab(ExploreTabs.Tutorials);
        await t.expect(tab.preselectArea.textContent).contains('How To Query Your Data', 'the tutorial is incorrect');

        await t.click(browserPage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneV5Config.databaseName);
        await t.click(browserPage.NavigationTabs.workbenchButton);
        await workbenchPage.sendCommandInWorkbench('TS.');

        await t.click(browserPage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.expect(browserPage.InsightsPanel.sidePanel.exists).ok('Insights panel is not opened');
        await t.expect(await browserPage.InsightsPanel.existsCompatibilityPopover.textContent).contains('Time series data structure', 'popover is not displayed');
        await t.expect(tab.preselectArea.textContent).contains('Time Series', 'the tutorial is incorrect');
    });
