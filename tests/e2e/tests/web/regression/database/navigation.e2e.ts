import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage } from '../../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig, ossStandaloneV7Config
} from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
//import { AddNewRdiParameters } from '../../../../helpers/api/api-rdi';
//import { RdiApiRequests } from '../../../../helpers/api/api-rdi';

const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();

//const rdiApiRequests = new RdiApiRequests();

// const rdiInstance: AddNewRdiParameters = {
//     name: 'testInstance',
//     url: 'https://11.111.111.111',
//     username: 'username',
//     password: '111'
// };

fixture `Database Navigation`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(
            ossStandaloneConfig
        );
        await databaseAPIRequests.addNewStandaloneDatabaseApi(
            ossStandaloneV7Config
        );
        await myRedisDatabasePage.reloadPage();
        // TODO: uncomment when RDI e2e starts running
        //await rdiApiRequests.addNewRdiApi(rdiInstance);

    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteAllDatabasesApi();
    });
test('Verify that user can navigate to instances using navigation widget', async t => {
    const dbListPageNames = await myRedisDatabasePage.getAllDatabases()
    await myRedisDatabasePage.clickOnDBByName(
        ossStandaloneConfig.databaseName
    );
    await t.click(browserPage.NavigationHeader.dbName)
    let dbWidgetNames = await browserPage.NavigationHeader.getAllDatabases();
    // todo: check if it is a bug default sorting in db list vs db popover are not the same
    await t.expect(dbListPageNames.sort()).eql(dbWidgetNames.sort(), 'DB Lists have the same names');
    await t.click(browserPage.NavigationHeader.dbListInstance.withText(ossStandaloneV7Config.databaseName));
    await t.expect(browserPage.NavigationHeader.dbNameExactText.textContent).eql(ossStandaloneV7Config.databaseName, 'user can not be navigated');
    await t.click(browserPage.NavigationHeader.dbName)
    await t.click(browserPage.NavigationHeader.homeLinkNavigation);
    await t.expect(myRedisDatabasePage.hostPort.exists).ok('Db list page is not opened');
    await myRedisDatabasePage.clickOnDBByName(
        ossStandaloneConfig.databaseName
    )
    await t.click(browserPage.NavigationHeader.dbName)
    await t.typeText(browserPage.NavigationHeader.dbListInput, ossStandaloneV7Config.databaseName);
    dbWidgetNames = await browserPage.NavigationHeader.getAllDatabases();
    await t.expect(dbWidgetNames.length).eql(1, 'DB List is not searched');
    await t.click(browserPage.NavigationHeader.rdiNavigationTab);

    // TODO: uncomment when RDI e2e starts running
    //await t.expect(dbListPageNames.length).eql(1, 'RDI List is not searched');
});
