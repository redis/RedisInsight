import { rte } from '../../../../helpers/constants';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseHelper } from '../../../../helpers/database';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

fixture `Clone databases`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await myRedisDatabasePage.reloadPage();
    })
    .afterEach(async() => {
        // Delete databases
        const dbNumber = await myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).count;
        for (let i = 0; i < dbNumber; i++) {
            await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
        }
    });
test.skip('Verify that user can clone Standalone db', async t => {
    await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);

    // Verify that user can test Standalone connection on edit and see the success message
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.testConnectionBtn);
    await t.expect(myRedisDatabasePage.Toast.toastHeader.textContent).contains('Connection is successful', 'Standalone connection is not successful');

    // Verify that user can cancel the Clone by clicking the "Cancel" or the "x" button
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cloneDatabaseButton);
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cancelButton);
    await t.expect(myRedisDatabasePage.popoverHeader.withText('Clone ').exists).notOk('Clone panel is still displayed', { timeout: 2000 });
    await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cloneDatabaseButton);
    // Verify that user see the "Add Database Manually" form pre-populated with all the connection data when cloning DB
    await t
    // Verify that name in the header has the prefix "Clone"
        .expect(myRedisDatabasePage.popoverHeader.withText('Clone ').exists).ok('Clone panel is not displayed')
        .expect(myRedisDatabasePage.AddRedisDatabaseDialog.hostInput.getAttribute('value')).eql(ossStandaloneConfig.host, 'Wrong host value')
        .expect(myRedisDatabasePage.AddRedisDatabaseDialog.portInput.getAttribute('value')).eql(ossStandaloneConfig.port, 'Wrong port value')
        .expect(myRedisDatabasePage.AddRedisDatabaseDialog.databaseAliasInput.getAttribute('value')).eql(ossStandaloneConfig.databaseName, 'Wrong host value')
    // Verify that timeout input is displayed for clone db window
        .expect(myRedisDatabasePage.AddRedisDatabaseDialog.timeoutInput.value).eql('30', 'Timeout is not defaulted to 30 on clone window');
    // Verify that user can confirm the creation of the database by clicking "Clone Database"
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton);
    await t.expect(myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).count).eql(2, 'DB was not cloned');

    // Verify new connection badge for cloned database
    await myRedisDatabasePage.verifyDatabaseStatusIsVisible(ossStandaloneConfig.databaseName);
});
