import * as path from 'path';
import { BrowserPage, MyRedisDatabasePage, SettingsPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig, ossStandaloneV5Config } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { ExploreTabs, rte, RecommendationIds } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { DatabaseScripts, DbTableParameters } from '../../../../helpers/database-scripts';
import { modifyFeaturesConfigJson, refreshFeaturesTestData, updateControlNumber } from '../../../../helpers/insights';
import { Common } from '../../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const settingsPage = new SettingsPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const featuresConfigTable = 'features_config';
const redisVersionRecom = RecommendationIds.redisVersion;
const pathes = {
    invalidConfig: path.join('.', 'test-data', 'features-configs', 'insights-invalid.json'),
    validConfig: path.join('.', 'test-data', 'features-configs', 'insights-valid.json'),
    analyticsConfig: path.join('.', 'test-data', 'features-configs', 'insights-analytics-filter-off.json'),
    buildTypeConfig: path.join('.', 'test-data', 'features-configs', 'insights-build-type-filter.json'),
    flagOffConfig: path.join('.', 'test-data', 'features-configs', 'insights-flag-off.json')
};
const dbTableParams: DbTableParameters = {
    tableName: featuresConfigTable,
    columnName: 'data',
    conditionWhereColumnName: 'id',
    conditionWhereColumnValue: '1'
};

// the tests are skipped due to story https://redislabs.atlassian.net/browse/RI-5089
fixture.skip `Feature flag`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config);
        await refreshFeaturesTestData();
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneV5Config);
        await refreshFeaturesTestData();
    });
test('Verify that default config applied when remote config version is lower', async t => {
    await updateControlNumber(19.2);

    const featureVersion = await JSON.parse(await DatabaseScripts.getColumnValueFromTableInDB(dbTableParams)).version;

    await t.expect(featureVersion).eql(2.3403, 'Config with lowest version applied');
    await browserPage.NavigationHeader.togglePanel(true);
    await t.expect(browserPage.InsightsPanel.getInsightsPanel().exists).ok('Insights panel displayed when disabled in default config');
});
test('Verify that invaid remote config not applied even if its version is higher than in the default config', async t => {
    // Update remote config .json to invalid
    await modifyFeaturesConfigJson(pathes.invalidConfig);
    await updateControlNumber(19.2);

    const featureVersion = await JSON.parse(await DatabaseScripts.getColumnValueFromTableInDB(dbTableParams)).version;

    await t.expect(featureVersion).eql(2.3403, 'Config highest version not applied');
    await browserPage.NavigationHeader.togglePanel(true);
    await t.expect(browserPage.InsightsPanel.getInsightsPanel().exists).ok('Insights panel displayed when disabled in default config');
});
test
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneV5Config);
        await refreshFeaturesTestData();
    })
    .after(async t => {
        // Turn on telemetry
        await t.click(browserPage.NavigationPanel.settingsButton);
        await settingsPage.changeAnalyticsSwitcher(true);
        // Delete databases connections
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneV5Config);
        // Update remote config .json to default
        await refreshFeaturesTestData();
    })('Verify that valid remote config applied with version higher than in the default config', async t => {
        // Update remote config .json to valid
        await modifyFeaturesConfigJson(pathes.validConfig);
        await updateControlNumber(48.2);
        let featureVersion = await JSON.parse(await DatabaseScripts.getColumnValueFromTableInDB(dbTableParams)).version;
        let versionFromConfig = await Common.getJsonPropertyValue('version', pathes.validConfig);

        await t.expect(featureVersion).eql(versionFromConfig, 'Config with invalid data applied');
        // Verify that Insights panel displayed if user's controlNumber is in range from config file
        await browserPage.NavigationHeader.togglePanel(true);
        await t.expect(browserPage.InsightsPanel.getInsightsPanel().exists).ok('Insights panel not displayed when enabled from remote config');

        // Verify that recommendations displayed for all databases if option enabled
        await t.click(browserPage.OverviewPanel.myRedisDBLink);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneV5Config.databaseName);
        await browserPage.NavigationHeader.togglePanel(true);
        await t.expect(browserPage.InsightsPanel.getInsightsPanel().exists).ok('Insights panel not displayed for the other db connection');
        await browserPage.NavigationHeader.togglePanel(true);
        const tab = await browserPage.InsightsPanel.setActiveTab(ExploreTabs.Tips);
        await t.expect(tab.getRecommendationByName(redisVersionRecom).exists).ok('Redis Version recommendation not displayed');

        await browserPage.NavigationHeader.togglePanel(false);
        // Verify that Insights panel can be displayed for Telemetry enabled/disabled according to filters
        await t.click(browserPage.NavigationPanel.settingsButton);
        await settingsPage.changeAnalyticsSwitcher(false);
        await myRedisDatabasePage.navigateToDatabase(ossStandaloneV5Config.databaseName);
        await browserPage.NavigationHeader.togglePanel(true);
        await t.expect(browserPage.InsightsPanel.getInsightsPanel().exists).notOk('Insights panel displayed without analytics when its filter is on');

        // Update remote config .json to config without analytics filter
        await modifyFeaturesConfigJson(pathes.analyticsConfig);
        await updateControlNumber(48.2);
        await browserPage.NavigationHeader.togglePanel(true);
        // Verify that Insights panel can be displayed for WebStack app according to filters
        await t.expect(browserPage.InsightsPanel.getInsightsPanel().exists).ok('Insights panel not displayed without analytics when its filter is off');

        // Verify that Insights panel not displayed if user's controlNumber is out of range from config file
        await updateControlNumber(30.1);
        await t.expect(browserPage.InsightsPanel.getInsightsPanel().exists).notOk('Insights panel displayed for user with control number out of the config');

        // Update remote config .json to config with buildType filter excluding current app build
        await modifyFeaturesConfigJson(pathes.buildTypeConfig);
        await updateControlNumber(48.2);
        await browserPage.NavigationHeader.togglePanel(true);
        // Verify that buildType filter applied
        featureVersion = await JSON.parse(await DatabaseScripts.getColumnValueFromTableInDB(dbTableParams)).version;
        versionFromConfig = await Common.getJsonPropertyValue('version', pathes.buildTypeConfig);
        await t.expect(featureVersion).eql(versionFromConfig, 'Config highest version not applied');
        await t.expect(browserPage.InsightsPanel.getInsightsPanel().exists).notOk('Insights panel displayed when filter excludes this buildType');

        // Update remote config .json to config with insights feature disabled
        await modifyFeaturesConfigJson(pathes.flagOffConfig);
        await updateControlNumber(48.2);
        await browserPage.NavigationHeader.togglePanel(true);
        // Verify that Insights panel not displayed if the remote config file has it disabled
        featureVersion = await JSON.parse(await DatabaseScripts.getColumnValueFromTableInDB(dbTableParams)).version;
        versionFromConfig = await Common.getJsonPropertyValue('version', pathes.flagOffConfig);
        await t.expect(featureVersion).eql(versionFromConfig, 'Config highest version not applied');
        await t.expect(browserPage.InsightsPanel.getInsightsPanel().exists).notOk('Insights panel displayed when filter excludes this buildType');
    });
