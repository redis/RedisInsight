import { MyRedisDatabasePage, MemoryEfficiencyPage, BrowserPage, WorkbenchPage } from '../../../../pageObjects';
import { ExploreTabs, RecommendationIds, rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import {
    commonUrl,
    ossSentinelConfig,
    ossStandaloneBigConfig,
    ossStandaloneConfig,
    ossStandaloneV5Config
} from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { RecommendationsActions } from '../../../../common-actions/recommendations-actions';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';
import { Telemetry } from '../../../../helpers';

const memoryEfficiencyPage = new MemoryEfficiencyPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const recommendationsActions = new RecommendationsActions();
const workbenchPage = new WorkbenchPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();
const telemetry = new Telemetry();

const logger = telemetry.createLogger();

const telemetryEvent = 'DATABASE_ANALYSIS_TIPS_COLLAPSED';
const expectedProperties = [
    'databaseId',
    'provider',
    'recommendation'
];

// const externalPageLink = 'https://docs.redis.com/latest/ri/memory-optimizations/';
let keyName = `recomKey-${Common.generateWord(10)}`;
const stringKeyName = `smallStringKey-${Common.generateWord(5)}`;
const index = '1';
const luaScriptRecommendation = RecommendationIds.luaScript;
const useSmallerKeysRecommendation = RecommendationIds.useSmallerKeys;
const avoidLogicalDbRecommendation = RecommendationIds.avoidLogicalDatabases;
const redisVersionRecommendation = RecommendationIds.redisVersion;
const searchJsonRecommendation = RecommendationIds.searchJson;

fixture(`Memory Efficiency Recommendations`)
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        // Go to Analysis Tools page
        await t.click(browserPage.NavigationTabs.analysisButton);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test
    .requestHooks(logger)
    .before(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
        // Go to Analysis Tools page
        await t.click(browserPage.NavigationTabs.analysisButton);
        // Add cached scripts and generate new report
        await memoryEfficiencyPage.Cli.addCachedScripts(11);
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Go to Recommendations tab
        await t.click(memoryEfficiencyPage.recommendationsTab);
    })
    .after(async() => {
        await browserPage.Cli.sendCommandInCli('SCRIPT FLUSH');
    })('Recommendations displaying', async t => {
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Verify that user can see Avoid dynamic Lua script recommendation when number_of_cached_scripts> 10
        await t.expect(await memoryEfficiencyPage.getRecommendationByName(luaScriptRecommendation).exists)
            .ok('Avoid dynamic lua script recommendation not displayed');
        // Verify that user can see type of recommendation badge
        await t.expect(memoryEfficiencyPage.getRecommendationLabelByName(luaScriptRecommendation, 'code').exists)
            .ok('Avoid dynamic lua script recommendation not have Code Changes label');
        await t.expect(memoryEfficiencyPage.getRecommendationLabelByName(luaScriptRecommendation, 'configuration').exists)
            .notOk('Avoid dynamic lua script recommendation have Configuration Changes label');

        // Verify that user can see Use smaller keys recommendation when database has 1M+ keys
        await t.expect(await memoryEfficiencyPage.getRecommendationByName(useSmallerKeysRecommendation).exists).ok('Use smaller keys recommendation not displayed');

        // Verify that user can see all the recommendations expanded by default
        await t.expect(memoryEfficiencyPage.getRecommendationButtonByName(luaScriptRecommendation).getAttribute('aria-expanded'))
            .eql('true', 'Avoid dynamic lua script recommendation not expanded');
        await t.expect(memoryEfficiencyPage.getRecommendationButtonByName(useSmallerKeysRecommendation).getAttribute('aria-expanded'))
            .eql('true', 'Use smaller keys recommendation not expanded');

        // Verify that user can expand/collapse recommendation
        const expandedTextContaiterSize = await memoryEfficiencyPage.getRecommendationByName(luaScriptRecommendation).offsetHeight;
        await t.click(memoryEfficiencyPage.getRecommendationButtonByName(luaScriptRecommendation));

        //Verify telemetry event
        await telemetry.verifyEventHasProperties(telemetryEvent, expectedProperties, logger);

        await t.expect(memoryEfficiencyPage.getRecommendationByName(luaScriptRecommendation).offsetHeight)
            .lt(expandedTextContaiterSize, 'Lua script recommendation not collapsed');
        await t.click(memoryEfficiencyPage.getRecommendationButtonByName(luaScriptRecommendation));
        await t.expect(memoryEfficiencyPage.getRecommendationByName(luaScriptRecommendation).offsetHeight)
            .eql(expandedTextContaiterSize, 'Lua script recommendation not expanded');
    });
// skipped due to inability to receive no recommendations for now
test.skip('No recommendations message', async t => {
    keyName = `recomKey-${Common.generateWord(10)}`;
    const noRecommendationsMessage = 'No Tips at the moment,keep up the good work!';
    const command = `HSET ${keyName} field value`;

    // Create Hash key and create report
    await browserPage.Cli.sendCommandInCli(command);
    // Go to Analysis Tools page
    await t.click(browserPage.NavigationTabs.analysisButton);
    await t.click(memoryEfficiencyPage.newReportBtn);
    // Go to Recommendations tab
    await t.click(memoryEfficiencyPage.recommendationsTab);
    // No recommendations message
    await t.expect(memoryEfficiencyPage.noRecommendationsMessage.textContent).eql(noRecommendationsMessage, 'No recommendations message not displayed');
});
test
    .before(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        keyName = `recomKey-${Common.generateWord(10)}`;
        await apiKeyRequests.addStringKeyApi({
            keyName: stringKeyName,
            value: 'field',
            ttl: 2147476121,
        }, ossStandaloneConfig);
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.AddRedisDatabaseDialog.addLogicalRedisDatabase(ossStandaloneConfig, index);
        await myRedisDatabasePage.clickOnDBByName(`${ossStandaloneConfig.databaseName} [db${index}]`);
        await browserPage.Cli.sendCommandInCli(`SET ${keyName} 1`);
    })
    .after(async t => {
        // Clear and delete database
        await t.click(browserPage.NavigationTabs.browserButton);
        await browserPage.deleteKeyByName(keyName);
        await databaseHelper.deleteCustomDatabase(`${ossStandaloneConfig.databaseName} [${index}]`);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await browserPage.deleteKeyByName(stringKeyName);
    })('Avoid using logical databases recommendation', async t => {
        // Go to Analysis Tools page
        await t.click(browserPage.NavigationTabs.analysisButton);
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Go to Recommendations tab
        await t.click(memoryEfficiencyPage.recommendationsTab);
        // Verify that user can see Avoid using logical databases recommendation when the database supports logical databases and there are keys in more than 1 logical database
        await t.expect(await memoryEfficiencyPage.getRecommendationByName(avoidLogicalDbRecommendation).exists)
            .ok('Avoid using logical databases recommendation not displayed');
        await t.expect(memoryEfficiencyPage.getRecommendationLabelByName(avoidLogicalDbRecommendation, 'code').exists)
            .ok('Avoid using logical databases recommendation not have Code Changes label');
    });
test
    .before(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config);
        // Go to Analysis Tools page and create new report and open recommendations
        await t.click(browserPage.NavigationTabs.analysisButton);
        await t.click(memoryEfficiencyPage.newReportBtn);
        await t.click(memoryEfficiencyPage.recommendationsTab);
    })('Verify that user can upvote recommendations', async t => {
        const notUsefulVoteOption = 'not useful';
        const usefulVoteOption = 'useful';
        await recommendationsActions.voteForRecommendation(redisVersionRecommendation, notUsefulVoteOption);
        // Verify that user can rate recommendations with one of 2 existing types at the same time
        await recommendationsActions.verifyVoteIsSelected(redisVersionRecommendation, notUsefulVoteOption);

        // Verify that user can see the popup with link when he votes for “Not useful”
        await recommendationsActions.verifyVotePopUpIsDisplayed(redisVersionRecommendation, notUsefulVoteOption);

        // Verify that user can see previous votes when reload the page
        await memoryEfficiencyPage.reloadPage();
        await t.click(memoryEfficiencyPage.recommendationsTab);
        await recommendationsActions.verifyVoteIsSelected(redisVersionRecommendation, notUsefulVoteOption);

        await t.click(memoryEfficiencyPage.newReportBtn);
        await recommendationsActions.voteForRecommendation(redisVersionRecommendation, usefulVoteOption);
        await recommendationsActions.verifyVoteIsSelected(redisVersionRecommendation, usefulVoteOption);
    });
test
    .before(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        keyName = `recomKey-${Common.generateWord(10)}`;
        const jsonValue = '{"name":"xyz"}';
        await browserPage.addJsonKey(keyName, jsonValue);
        // Check that new key is displayed in the list
        await browserPage.searchByKeyName(keyName);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The JSON key is not added');
        // Go to Analysis Tools page
        await t.click(browserPage.NavigationTabs.analysisButton);
        await t.click(memoryEfficiencyPage.newReportBtn);
        // Go to Recommendations tab
        await t.click(memoryEfficiencyPage.recommendationsTab);
    })
    .after(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can see the Tutorial opened when clicking on "Tutorial" for recommendations', async t => {
        const recommendation = memoryEfficiencyPage.getRecommendationByName(searchJsonRecommendation);
        for (let i = 0; i < 5; i++) {
            if (!(await recommendation.exists)) {
                await t.click(memoryEfficiencyPage.newReportBtn);
            }
        }
        // Verify that Optimize the use of time series recommendation displayed
        await t.expect(recommendation.exists).ok('Query and search JSON documents recommendation not displayed');
        // Verify that tutorial opened
        await t.click(memoryEfficiencyPage.getToTutorialBtnByRecomName(searchJsonRecommendation));
        await workbenchPage.NavigationHeader.togglePanel(true);
        const tutorial = await workbenchPage.InsightsPanel.setActiveTab(ExploreTabs.Tutorials);
        await t.expect(tutorial.preselectArea.visible).ok('Workbench Enablement area not opened');
        // Verify that REDIS FOR TIME SERIES tutorial expanded
        await t.expect(tutorial.getTutorialByName('INTRODUCTION').visible).ok('INTRODUCTION tutorial is not expanded');
    });
