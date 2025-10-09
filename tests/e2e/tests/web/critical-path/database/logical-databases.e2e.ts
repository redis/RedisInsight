import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();

fixture `Logical databases`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    })
    .afterEach(async() => {
        //Delete database
        await databaseHelper.deleteDatabase(ossStandaloneConfig.databaseName);
    });
test.skip('Verify that user can add DB with logical index via host and port from Add DB manually form', async t => {
    const index = '10';

    await myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDataBase(ossStandaloneConfig);

    // Verify that user can test database connection and see success message
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.testConnectionBtn);
    await t.expect(myRedisDatabasePage.Toast.toastHeader.textContent).contains('Connection is successful', 'Standalone connection is not successful');

    // Enter logical index
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.databaseIndexCheckbox);
    await t.typeText(myRedisDatabasePage.AddRedisDatabaseDialog.databaseIndexInput, index, { replace: true, paste: true });
    // *** - outdated - Verify that user when users select DB index they can see info message how to work with DB index in add DB screen
    // Verify that logical db message not displayed in add database form
    await t.expect(myRedisDatabasePage.AddRedisDatabaseDialog.databaseIndexMessage.exists).notOk('Index message is still displayed')
        .expect(myRedisDatabasePage.AddRedisDatabaseDialog.databaseIndexCheckbox.parent().withExactText('Select Logical Database').exists).ok('Checkbox text not displayed');
    // Click for saving
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton);
    // Verify that the database is in the list
    await t.expect(myRedisDatabasePage.dbNameList.withText(ossStandaloneConfig.databaseName).exists).ok('Database not exist', { timeout: 10000 });
    // Verify that if user adds DB with logical DB > 0, DB name contains postfix "space+[{database index}]"
    // Verify that user can see the db{index} instead of {index} in database alias
    await t.expect(myRedisDatabasePage.dbNameList.textContent).eql(`${ossStandaloneConfig.databaseName} [db${index}]`, 'The postfix is not added to the database name', { timeout: 10000 });
});
