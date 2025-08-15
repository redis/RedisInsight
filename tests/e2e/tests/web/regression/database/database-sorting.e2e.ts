import { DatabaseHelper } from '../../../../helpers/database';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { MyRedisDatabasePage, BrowserPage } from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import {
    commonUrl,
    ossStandaloneConfig,
    ossSentinelConfig,
    ossClusterConfig
} from '../../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const databases = [
    { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port, databaseName: ossStandaloneConfig.databaseName },
    { host: ossClusterConfig.ossClusterHost, port: ossClusterConfig.ossClusterPort, databaseName: ossClusterConfig.ossClusterDatabaseName },
    { host: ossSentinelConfig.sentinelHost, port: ossSentinelConfig.sentinelPort, databaseName: ossSentinelConfig.masters[0].alias }
];
let actualDatabaseList: string[] = [];
const oldDBName = ossStandaloneConfig.databaseName;
const newDBName = '! Edited Standalone DB name';
const sortList = async(): Promise<string[]> => {
    const sortedByName = databases.sort((a, b) => a.databaseName > b.databaseName ? 1 : -1);
    const sortedDatabaseNames: string[] = [];
    for (let i = 0; i < sortedByName.length; i++) {
        sortedDatabaseNames.push(sortedByName[i].databaseName);
    }
    return sortedDatabaseNames;
};

fixture `Remember database sorting`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        // Delete all existing databases
        await databaseAPIRequests.deleteAllDatabasesApi();
        // Add new databases using API
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await databaseAPIRequests.addNewOSSClusterDatabaseApi(ossClusterConfig);
        await databaseAPIRequests.discoverSentinelDatabaseApi(ossSentinelConfig, 1);
        // Reload Page
        await browserPage.reloadPage();
    })
    .afterEach(async() => {
        // Clear and delete databases
        await databaseAPIRequests.deleteAllDatabasesByConnectionTypeApi('STANDALONE');
        await databaseAPIRequests.deleteAllDatabasesByConnectionTypeApi('CLUSTER');
        await databaseAPIRequests.deleteAllDatabasesByConnectionTypeApi('SENTINEL');
    });
test('Verify that sorting on the list of databases saved when database opened', async t => {
    // Sort by Connection Type
    const sortedByConnectionType = [ossClusterConfig.ossClusterDatabaseName, ossSentinelConfig.masters[0].alias, ossStandaloneConfig.databaseName];
    await t.click(myRedisDatabasePage.sortByConnectionType);
    actualDatabaseList = await myRedisDatabasePage.getAllDatabases();
    await myRedisDatabasePage.compareInstances(actualDatabaseList, sortedByConnectionType);
    // Connect to DB and check sorting
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await t.expect(browserPage.refreshKeysButton.visible).ok('Browser page is not opened');
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
    actualDatabaseList = await myRedisDatabasePage.getAllDatabases();
    await myRedisDatabasePage.compareInstances(actualDatabaseList, sortedByConnectionType);
    // Sort by Host and Port
    await t.click(myRedisDatabasePage.sortByHostAndPort);
    actualDatabaseList = await myRedisDatabasePage.getAllDatabases();
    const sortedDatabaseHost = [ossClusterConfig.ossClusterDatabaseName, ossSentinelConfig.masters[0].alias, ossStandaloneConfig.databaseName];
    await myRedisDatabasePage.compareInstances(actualDatabaseList, sortedDatabaseHost);
    // Verify that sorting on the list of databases saved when databases list refreshed
    await myRedisDatabasePage.reloadPage();
    actualDatabaseList = await myRedisDatabasePage.getAllDatabases();
    await myRedisDatabasePage.compareInstances(actualDatabaseList, sortedDatabaseHost);
});
test
    .skip('Verify that user has the same sorting if db name is changed', async t => {
    // Sort by Database name
    await t.click(myRedisDatabasePage.sortByDatabaseAlias);
    actualDatabaseList = await myRedisDatabasePage.getAllDatabases();
    await myRedisDatabasePage.compareInstances(actualDatabaseList, await sortList());
    // Change DB name inside of sorted list
    await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
    await t.typeText(myRedisDatabasePage.AddRedisDatabaseDialog.databaseAliasInput, newDBName, { replace: true, paste: true });
    await t.click(myRedisDatabasePage.submitChangesButton);
    // Change DB is control list
    const index = databases.findIndex((item) => {
        return item.databaseName === oldDBName;
    });
    databases[index].databaseName = newDBName;
    // Compare sorting with expected list
    actualDatabaseList = await myRedisDatabasePage.getAllDatabases();
    await myRedisDatabasePage.compareInstances(actualDatabaseList, await sortList());
});
