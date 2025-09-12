import { MyRedisDatabasePage, MemoryEfficiencyPage, BrowserPage } from '../../../../pageObjects';
import { RecommendationIds, rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneV5Config
} from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { RecommendationsActions } from '../../../../common-actions/recommendations-actions';

const memoryEfficiencyPage = new MemoryEfficiencyPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const recommendationsActions = new RecommendationsActions();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const luaScriptRecommendation = RecommendationIds.luaScript;
const useSmallerKeysRecommendation = RecommendationIds.useSmallerKeys;
const redisVersionRecommendation = RecommendationIds.redisVersion;

fixture `Database Analysis Recommendations`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl);
test
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
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
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
        await t.expect(memoryEfficiencyPage.getRecommendationByName(luaScriptRecommendation).offsetHeight)
            .lt(expandedTextContaiterSize, 'Lua script recommendation not collapsed');
        await t.click(memoryEfficiencyPage.getRecommendationButtonByName(luaScriptRecommendation));
        await t.expect(memoryEfficiencyPage.getRecommendationByName(luaScriptRecommendation).offsetHeight)
            .eql(expandedTextContaiterSize, 'Lua script recommendation not expanded');
    });
test
    .before(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config);
        // Go to Analysis Tools page and create new report and open recommendations
        await t.click(browserPage.NavigationTabs.analysisButton);
        await t.click(memoryEfficiencyPage.newReportBtn);
        await t.click(memoryEfficiencyPage.recommendationsTab);
    }).after(async() => {
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneV5Config);
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
