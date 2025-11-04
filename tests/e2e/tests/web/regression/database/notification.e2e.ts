import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage, WorkbenchPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig, ossStandaloneV5Config } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { DatabaseScripts, DbTableParameters } from '../../../../helpers';
import { format, subDays } from 'date-fns';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

const currentDate = new Date();
const fiveDaysAgo = subDays(currentDate, 5);
const rowValue5 = format(fiveDaysAgo, 'yyyy-MM-dd HH:mm:ss');

const seventeenDaysAgo = subDays(currentDate, 17);
const rowValue16 = format(seventeenDaysAgo, 'yyyy-MM-dd HH:mm:ss');

const dbTableParams5days: DbTableParameters = {
    tableName: 'database_instance',
    columnName: 'lastConnection',
    rowValue: rowValue5,
    conditionWhereColumnName: 'name',
    conditionWhereColumnValue: ossStandaloneConfig.databaseName
};

const dbTableParams16days: DbTableParameters = {
    tableName: 'database_instance',
    columnName: 'lastConnection',
    rowValue: rowValue16,
    conditionWhereColumnName: 'name',
    conditionWhereColumnValue: ossStandaloneConfig.databaseName
};

fixture `DB expire notifications`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl);

test.before(async() => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.deleteAllDatabasesApi();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneV5Config);
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneConfig, true);
        await browserPage.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneV5Config.databaseName);
    })
    .after(async() => {
      //  await databaseAPIRequests.deleteAllDatabasesApi();
    })
    .skip('Verify that notifications are displayed if the db will be expired soon', async t => {
        await t.click(browserPage.NavigationTabs.workbenchButton);
        await workbenchPage.sendCommandInWorkbench('CMS.INITBYDIM');

        await DatabaseScripts.updateColumnValueInDBTable(dbTableParams5days);
        await t.click(browserPage.NavigationPanel.myRedisDBButton);
        await t.hover(myRedisDatabasePage.iconNotUsedDatabase);
        await t.expect(myRedisDatabasePage.notificationUnusedDbMessage.textContent).contains('Probabilistic data structures', 'there is no info about module');
        await t.expect(myRedisDatabasePage.notificationUnusedDbMessage.textContent).contains('free Redis Cloud databases will be deleted after 15 days of inactivity.', 'there is no expected info');

        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.click(browserPage.NavigationPanel.myRedisDBButton);
        await DatabaseScripts.updateColumnValueInDBTable(dbTableParams16days);
        await myRedisDatabasePage.reloadPage();

        await t.hover(myRedisDatabasePage.iconDeletedDatabase);
        await t.expect(myRedisDatabasePage.notificationUnusedDbMessage.textContent).contains('Build your app with Redis Cloud', 'there is no common');
        await t.expect(myRedisDatabasePage.notificationUnusedDbMessage.textContent).contains('Free Redis Cloud DBs auto-delete after 15 days', 'there is no expected info');
    });
