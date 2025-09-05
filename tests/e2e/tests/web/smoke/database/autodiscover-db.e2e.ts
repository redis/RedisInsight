// todo: verify why skipped and move to another place
// import { t } from 'testcafe';
// import { DatabaseHelper } from '../../../../helpers/database';
// import {
//     commonUrl,
//     cloudDatabaseConfig
// } from '../../../../helpers/conf';
// import { rte } from '../../../../helpers/constants';
// import { AutoDiscoverREDatabases, MyRedisDatabasePage } from '../../../../pageObjects';
//
// const myRedisDatabasePage = new MyRedisDatabasePage();
// const autoDiscoverREDatabases = new AutoDiscoverREDatabases();
// const databaseHelper = new DatabaseHelper();
//
// fixture(`Add database`)
//     .meta({ type: 'smoke' })
//     .page(commonUrl)
//     .beforeEach(async() => {
//         await databaseHelper.acceptLicenseTerms();
//     });
// test.skip
//     .meta({ rte: rte.reCloud, skipComment: "Skipped since environment has changed needs rework" })
//     .after(async() => {
//         await databaseHelper.deleteDatabase(cloudDatabaseConfig.databaseName);
//     })('Verify that user can add database from RE Cloud', async() => {
//         await databaseHelper.addRedisCloudDatabase(cloudDatabaseConfig);
//         // Verify new connection badge for RE cloud
//         await myRedisDatabasePage.verifyDatabaseStatusIsVisible(cloudDatabaseConfig.databaseName);
//         // Verify redis stack icon for RE Cloud with all 5 modules
//         await t.expect(myRedisDatabasePage.redisStackIcon.visible).ok('Redis Stack icon not found for RE Cloud db with all 5 modules');
//     });
// // unskip after closing https://redislabs.atlassian.net/browse/RI-5768
// test.skip
//     .meta({ rte: rte.reCloud })('Verify that user can add a subscription via auto-discover flow', async t => {
//         await myRedisDatabasePage.AddRedisDatabaseDialog.addAutodiscoverRedisCloudDatabase(
//             cloudDatabaseConfig.accessKey,
//             cloudDatabaseConfig.secretKey
//         );
//         await t.click(
//             myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton);
//         await t.expect(autoDiscoverREDatabases.title.withExactText('Redis Cloud Subscriptions').exists)
//             .ok('Subscriptions list not displayed', { timeout: 120000 });
//         // Select subscriptions
//         await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.selectAllCheckbox);
//         await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.showDatabasesButton);
//         await t.expect(autoDiscoverREDatabases.title.withExactText('Redis Cloud Databases').exists)
//             .ok('database page is not displayed', { timeout: 120000 });
//     });
