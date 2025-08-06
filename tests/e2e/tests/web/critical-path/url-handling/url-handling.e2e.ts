import { commonUrl, ossStandaloneRedisGears } from '../../../../helpers/conf';
import { ClientFunction } from 'testcafe';
import { ExploreTabs, rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import { BrowserPage, MyRedisDatabasePage, WorkbenchPage } from '../../../../pageObjects';
import { DatabaseHelper } from '../../../../helpers/database';
import { OnboardingCardsDialog } from '../../../../pageObjects/dialogs';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const browserPage = new BrowserPage();

const databaseAPIRequests = new DatabaseAPIRequests();
const databaseHelper = new DatabaseHelper();
const onboardingCardsDialog = new OnboardingCardsDialog();

const { host, port, databaseName, databaseUsername = '', databasePassword = '' } = ossStandaloneRedisGears;
const username = 'alice&&';
const password = 'p1pp0@&';

function generateLink(params: Record<string, any>, connectType: string, url: string ): string {
    const params1 = Common.generateUrlTParams(params);
    const from = encodeURIComponent(`${connectType}?${params1}`);
    return (new URL(`?from=${from}`, url)).toString();
}

const redisConnect = 'redisinsight://databases/connect';
const redisOpen = 'redisinsight://open';

fixture `Add DB from SM`
    .meta({ type: 'critical_path', rte: rte.none })
    .afterEach(async() => {
        // Delete all existing connections
        await databaseAPIRequests.deleteAllDatabasesApi();
    })
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    });
test
    .page(commonUrl)
    .skip('Add DB using url via manual flow', async t => {
        const connectUrlParams = {
            redisUrl: `redis://${databaseUsername}:${databasePassword}@${host}:${port}`,
            databaseAlias: databaseName,
            redirect: 'workbench'
        };
        await t.navigateTo(generateLink(connectUrlParams, redisConnect,commonUrl));
        await t.expect(myRedisDatabasePage.AddRedisDatabaseDialog.disabledDatabaseInfo.nth(0).getAttribute('title')).contains(host, 'Wrong host value');
        await t.expect(myRedisDatabasePage.AddRedisDatabaseDialog.disabledDatabaseInfo.nth(1).getAttribute('title')).contains(port, 'Wrong port value');
        await t.wait(5_000);
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton);
        // wait for db is added
        await t.wait(10_000);
        await t.expect(workbenchPage.submitCommandButton.exists).ok('Redirection to Workbench is not correct');
    });

//Verify that RedisInsight can work with the encoded redis URLs passed from Cloud via deep linking.
test
    .before(async()  => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisGears);
        await browserPage.Cli.sendCommandInCli(`acl DELUSER ${username}`);
        await browserPage.Cli.sendCommandInCli(`ACL SETUSER ${username} on >${password} +@all ~*`);
    })
    .after(async t => {
        // Delete all existing connections
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(databaseName);
        await browserPage.Cli.sendCommandInCli(`acl DELUSER ${username}`);
        await databaseAPIRequests.deleteAllDatabasesApi();
    })
    .page(commonUrl)('Add DB using url automatically', async t => {
        const codedUrl = `redis://${username}:${password}@${host}:${port}`;
        const connectUrlParams = {
            redisUrl: codedUrl,
            databaseAlias: databaseName,
            redirect: 'workbench?tutorialId=ds-json-intro',
            cloudBdbId: '1232',
            subscriptionType: 'fixed',
            planMemoryLimit: '30',
            memoryLimitMeasurementUnit: 'mb',
            free: 'true'
        };

        const connectUrlParams2 = {
            redirect: '/_',
            onboarding: 'true',
            copilot: 'false'
        };

        await t.navigateTo(generateLink(connectUrlParams, redisConnect,commonUrl));
        await t.wait(10_000);
        await t.expect(workbenchPage.submitCommandButton.exists).ok('Redirection to Workbench is not correct');
        const tab = await workbenchPage.InsightsPanel.setActiveTab(ExploreTabs.Tutorials);
        await t.expect(tab.preselectArea.textContent).contains('INTRODUCTION', 'the tutorial page is incorrect');
        await t.expect(tab.preselectArea.textContent).contains('JSON', 'the tutorial is incorrect');

        const getPageUrl = ClientFunction(() => window.location.href);
        const url = await getPageUrl();

        await t.navigateTo(generateLink(connectUrlParams2, redisOpen, url));
        await t.wait(10_000);
        await t.expect(workbenchPage.submitCommandButton.exists).ok('Redirection to the same page is not correct');
        await t.click(workbenchPage.NavigationPanel.browserButton);
        await t.expect(onboardingCardsDialog.showMeAroundButton.exists).ok('onboarding is nor reset');
        await t.click(onboardingCardsDialog.skipTourButton);

        //Verify that the same db is not added
        await t.navigateTo(generateLink(connectUrlParams, redisConnect,commonUrl));
        await t.wait(10_000);
        await t.click(workbenchPage.NavigationPanel.myRedisDBButton);
        await t.expect(browserPage.notification.exists).notOk({ timeout: 10000 });
        await t.expect(myRedisDatabasePage.dbNameList.child('span').withExactText(databaseName).count).eql(2, 'the same db is added twice');
    });
