import { DatabaseHelper } from '../../../../helpers/database';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { Common } from '../../../../helpers/common';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const database = Object.assign({}, ossStandaloneConfig);
const previousDatabaseName = Common.generateWord(20);
const newDatabaseName = Common.generateWord(20);
database.databaseName = previousDatabaseName;

fixture `List of Databases`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(database);
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteAllDatabasesApi();
    });
test
    .skip('Verify that user can edit DB alias of Standalone DB', async t => {
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
    // Edit alias of added database
    await databaseHelper.clickOnEditDatabaseByName(database.databaseName);

    // Verify that timeout input is displayed for edit db window with default value when it wasn't specified
    await t.expect(myRedisDatabasePage.AddRedisDatabaseDialog.timeoutInput.value).eql('30', 'Timeout is not defaulted to 30');

    await t.typeText(myRedisDatabasePage.AddRedisDatabaseDialog.databaseAliasInput, newDatabaseName, { replace: true, paste: true });
    await t.click(myRedisDatabasePage.submitChangesButton);
    // Verify that database has new alias
    await t.expect(myRedisDatabasePage.dbNameList.withExactText(newDatabaseName).exists).ok('The database with new alias is in not the list', { timeout: 10000 });
    await t.expect(myRedisDatabasePage.dbNameList.withExactText(previousDatabaseName).exists).notOk('The database with previous alias is still in the list', { timeout: 10000 });
});
