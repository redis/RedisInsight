import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const browserPage = new BrowserPage();

fixture `Github functionality`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneConfig);
        // Reload Page
        await myRedisDatabasePage.reloadPage();
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can work with Github link in the application', async t => {
    // Verify that user can see the icon for GitHub reference at the bottom of the left side bar in the List of DBs
    await t.expect(myRedisDatabasePage.NavigationPanel.githubButton.visible).ok('Github button not found');
    //Verify that user can see the icon for GitHub reference at the bottom of the left side bar on the Browser page
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await t.expect(myRedisDatabasePage.NavigationPanel.githubButton.visible).ok('Github button not found');
    // Verify that user can see the icon for GitHub reference at the bottom of the left side bar on the Workbench page
    await t.click(browserPage.NavigationTabs.workbenchButton);
    await t.expect(myRedisDatabasePage.NavigationPanel.githubButton.visible).ok('Github button');
    // Verify that when user clicks on Github icon he redirects to the URL: https://github.com/RedisInsight/RedisInsight
    await t.click(myRedisDatabasePage.NavigationPanel.githubButton);

    await Common.checkURLContainsText('https://github.com/redis/RedisInsight');
});
