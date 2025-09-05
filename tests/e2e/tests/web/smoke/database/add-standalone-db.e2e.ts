// todo: verify why skipped and move to other place
// import { t } from 'testcafe';
// import { Chance } from 'chance';
// import { DatabaseHelper } from '../../../../helpers/database';
// import {
//     commonUrl,
//     ossStandaloneConfig,
//     ossClusterConfig
// } from '../../../../helpers/conf';
// import { rte } from '../../../../helpers/constants';
// import { BrowserPage, MyRedisDatabasePage } from '../../../../pageObjects';
// import { Telemetry } from '../../../../helpers/telemetry';
//
// const browserPage = new BrowserPage();
// const myRedisDatabasePage = new MyRedisDatabasePage();
// const telemetry = new Telemetry();
// const chance = new Chance();
// const databaseHelper = new DatabaseHelper();
//
// const logger = telemetry.createLogger();
// const telemetryEvents = ['CONFIG_DATABASES_OPEN_DATABASE','CONFIG_DATABASES_CLICKED'];
// const expectedProperties = [
//     'databaseId',
//     'RediSearch',
//     'RedisAI',
//     'RedisGraph',
//     'RedisGears',
//     'RedisBloom',
//     'RedisJSON',
//     'RedisTimeSeries',
//     'customModules'
// ];
// const clickButtonExpectedProperties = [
//     'source'
// ];
// let databaseName = `test_standalone-${chance.string({ length: 10 })}`;
//
// fixture `Add database`
//     .meta({ type: 'smoke' })
//     .page(commonUrl)
//     .beforeEach(async() => {
//         await databaseHelper.acceptLicenseTerms();
//     });
// test
//     .meta({ rte: rte.standalone })
//     .requestHooks(logger)
//     .after(async() => {
//         await databaseHelper.deleteDatabase(databaseName);
//     })
//     .skip('Verify that user can add Standalone Database', async() => {
//         const connectionTimeout = '20';
//         databaseName = `test_standalone-${chance.string({ length: 10 })}`;
//
//         // Fill the add database form
//         await myRedisDatabasePage.AddRedisDatabaseDialog.addDatabaseButton.with({ visibilityCheck: true, timeout: 10000 })();
//         await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.addDatabaseButton);
//         // TODO : event not found in the request needs further investigation test is failing on this check same fot he other event bellow
//         // Verify that telemetry event 'CONFIG_DATABASES_CLICKED' sent and has all expected properties
//         // await telemetry.verifyEventHasProperties(telemetryEvents[1], clickButtonExpectedProperties, logger);
//         await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.customSettingsButton);
//         await t
//             .typeText(myRedisDatabasePage.AddRedisDatabaseDialog.hostInput, ossStandaloneConfig.host, { replace: true, paste: true })
//             .typeText(myRedisDatabasePage.AddRedisDatabaseDialog.portInput, ossStandaloneConfig.port, { replace: true, paste: true })
//             .typeText(myRedisDatabasePage.AddRedisDatabaseDialog.databaseAliasInput, databaseName, { replace: true, paste: true })
//             // Verify that user can customize the connection timeout for the manual flow
//             .typeText(myRedisDatabasePage.AddRedisDatabaseDialog.timeoutInput, connectionTimeout, { replace: true, paste: true });
//         await t
//             .click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton)
//             // Wait for database to be exist
//             .expect(myRedisDatabasePage.dbNameList.withExactText(databaseName).exists).ok('The database not displayed', { timeout: 10000 })
//             // Close message
//             .click(myRedisDatabasePage.Toast.toastCloseButton);
//
//         // Verify that user can see an indicator of databases that are added manually and not opened yet
//         await t.expect(myRedisDatabasePage.starFreeDbCheckbox.exists).ok('free trial db link is not displayed when db is added')
//         await myRedisDatabasePage.verifyDatabaseStatusIsVisible(databaseName);
//         await myRedisDatabasePage.clickOnDBByName(databaseName);
//
//         // Verify that telemetry event 'CONFIG_DATABASES_OPEN_DATABASE' sent and has all expected properties
//        // await telemetry.verifyEventHasProperties(telemetryEvents[0], expectedProperties, logger);
//
//         await t.click(browserPage.OverviewPanel.myRedisDBLink);
//         // Verify that user can't see an indicator of databases that were opened
//         await myRedisDatabasePage.verifyDatabaseStatusIsNotVisible(databaseName);
//
//         // Verify that connection timeout value saved
//         await myRedisDatabasePage.clickOnEditDBByName(databaseName);
//         await t.expect(myRedisDatabasePage.AddRedisDatabaseDialog.timeoutInput.value).eql(connectionTimeout, 'Connection timeout is not customized');
//         await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cancelButton);
//     });
// test
//     .meta({ rte: rte.ossCluster })
//     .after(async() => {
//         await databaseHelper.deleteDatabase(ossClusterConfig.ossClusterDatabaseName);
//     })
//     .skip('Verify that user can add OSS Cluster DB', async() => {
//         await databaseHelper.addOSSClusterDatabase(ossClusterConfig);
//         // Verify new connection badge for OSS cluster
//         await myRedisDatabasePage.verifyDatabaseStatusIsVisible(ossClusterConfig.ossClusterDatabaseName);
//     });
