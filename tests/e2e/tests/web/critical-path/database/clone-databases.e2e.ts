import { rte } from '../../../../helpers/constants';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { commonUrl, ossClusterConfig, ossSentinelConfig, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseHelper } from '../../../../helpers/database';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const newOssDatabaseAlias = 'cloned oss cluster';

fixture `Clone databases`
    .meta({ type: 'critical_path' })
    .page(commonUrl);
test
    .before(async() => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await myRedisDatabasePage.reloadPage();
    })
    .after(async() => {
        // Delete databases
        const dbNumber = await myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).count;
        for (let i = 0; i < dbNumber; i++) {
            await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
        }
    })
    .meta({ rte: rte.standalone })
    .skip('Verify that user can clone Standalone db', async t => {
        await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);

        // Verify that user can test Standalone connection on edit and see the success message
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.testConnectionBtn);
        await t.expect(myRedisDatabasePage.Toast.toastHeader.textContent).contains('Connection is successful', 'Standalone connection is not successful');

        // Verify that user can cancel the Clone by clicking the “Cancel” or the “x” button
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cloneDatabaseButton);
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cancelButton);
        await t.expect(myRedisDatabasePage.popoverHeader.withText('Clone ').exists).notOk('Clone panel is still displayed', { timeout: 2000 });
        await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cloneDatabaseButton);
        // Verify that user see the “Add Database Manually” form pre-populated with all the connection data when cloning DB
        await t
            // Verify that name in the header has the prefix “Clone”
            .expect(myRedisDatabasePage.popoverHeader.withText('Clone ').exists).ok('Clone panel is not displayed')
            .expect(myRedisDatabasePage.AddRedisDatabaseDialog.hostInput.getAttribute('value')).eql(ossStandaloneConfig.host, 'Wrong host value')
            .expect(myRedisDatabasePage.AddRedisDatabaseDialog.portInput.getAttribute('value')).eql(ossStandaloneConfig.port, 'Wrong port value')
            .expect(myRedisDatabasePage.AddRedisDatabaseDialog.databaseAliasInput.getAttribute('value')).eql(ossStandaloneConfig.databaseName, 'Wrong host value')
            // Verify that timeout input is displayed for clone db window
            .expect(myRedisDatabasePage.AddRedisDatabaseDialog.timeoutInput.value).eql('30', 'Timeout is not defaulted to 30 on clone window');
        // Verify that user can confirm the creation of the database by clicking “Clone Database”
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).count).eql(2, 'DB was not cloned');

        // Verify new connection badge for cloned database
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(ossStandaloneConfig.databaseName);
    });
test
    .before(async() => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewOSSClusterDatabaseApi(ossClusterConfig);
        await myRedisDatabasePage.reloadPage();
    })
    .after(async() => {
        // Delete database
        await databaseAPIRequests.deleteOSSClusterDatabaseApi(ossClusterConfig);
        await myRedisDatabasePage.deleteDatabaseByName(newOssDatabaseAlias);
    })
    .meta({ rte: rte.ossCluster })
    .skip('Verify that user can clone OSS Cluster', async t => {
        await databaseHelper.clickOnEditDatabaseByName(ossClusterConfig.ossClusterDatabaseName);

        // Verify that user can test OSS Cluster connection on edit and see the success message
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.testConnectionBtn);
        await t.expect(myRedisDatabasePage.Toast.toastHeader.textContent).contains('Connection is successful', 'OSS Cluster connection is not successful');

        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cloneDatabaseButton);
        await t
            .expect(myRedisDatabasePage.popoverHeader.withText('Clone ').exists).ok('Clone panel is not displayed')
            .expect(myRedisDatabasePage.AddRedisDatabaseDialog.portInput.getAttribute('value')).eql(ossClusterConfig.ossClusterPort, 'Wrong port value')
            .expect(myRedisDatabasePage.AddRedisDatabaseDialog.databaseAliasInput.getAttribute('value')).eql(ossClusterConfig.ossClusterDatabaseName, 'Wrong host value');
        // Edit Database alias before cloning
        await t.typeText(myRedisDatabasePage.AddRedisDatabaseDialog.databaseAliasInput, newOssDatabaseAlias, { replace: true });
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(newOssDatabaseAlias).exists).ok('DB was not closed');
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossClusterConfig.ossClusterDatabaseName).exists).ok('Original DB is not displayed');

        // New connections indicator
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(ossClusterConfig.ossClusterDatabaseName);
    });
test
    .before(async() => {
        await databaseHelper.acceptLicenseTerms();
        // Add Sentinel databases
        await databaseAPIRequests.discoverSentinelDatabaseApi(ossSentinelConfig);
        await myRedisDatabasePage.reloadPage();
    })
    .after(async() => {
        // Delete all primary groups
        await databaseAPIRequests.deleteAllDatabasesByConnectionTypeApi('SENTINEL');
        await myRedisDatabasePage.reloadPage();
    })
    .meta({ rte: rte.sentinel })
    .skip('Verify that user can clone Sentinel', async t => {
        const hiddenPassword = '••••••••••••';

        await databaseHelper.clickOnEditDatabaseByName(ossSentinelConfig.masters[1].alias);
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cloneDatabaseButton);

        // Verify that user can test Sentinel connection on edit and see the success message
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.testConnectionBtn);
        await t.expect(myRedisDatabasePage.Toast.toastHeader.textContent).contains('Connection is successful', 'Sentinel connection is not successful');

        // Verify that for Sentinel Host and Port fields are replaced with editable Primary Group Name field
        await t
            .expect(myRedisDatabasePage.popoverHeader.withText('Clone ').exists).ok('Clone panel is not displayed')
            .expect(myRedisDatabasePage.AddRedisDatabaseDialog.databaseAliasInput.getAttribute('value')).eql(ossSentinelConfig.masters[1].alias, 'Invalid primary group alias value')
            .expect(myRedisDatabasePage.AddRedisDatabaseDialog.primaryGroupNameInput.getAttribute('value')).eql(ossSentinelConfig.masters[1].name, 'Invalid primary group name value');
        // Validate Databases section
        await t.expect(myRedisDatabasePage.AddRedisDatabaseDialog.masterGroupPassword.getAttribute('value')).eql(hiddenPassword, 'Invalid sentinel database password');
        // Validate Sentinel section
        await t
            .expect(myRedisDatabasePage.AddRedisDatabaseDialog.portInput.getAttribute('value')).eql(ossSentinelConfig.sentinelPort, 'Invalid sentinel port')
            .expect(myRedisDatabasePage.AddRedisDatabaseDialog.passwordInput.getAttribute('value')).eql(hiddenPassword, 'Invalid sentinel password');
        // Clone Sentinel Primary Group
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossSentinelConfig.masters[1].alias).count).gt(1, 'Primary Group was not cloned');

        // Verify new connection badge for Sentinel db
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(ossSentinelConfig.masters[1].alias);
    });
