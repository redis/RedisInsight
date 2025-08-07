import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage } from '../../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig,
    ossStandaloneConfig
} from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { Common } from '../../../../helpers/common';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

const database = Object.assign({}, ossStandaloneConfig);
const previousDatabaseName = Common.generateWord(20);
database.databaseName = previousDatabaseName;
const keyName = Common.generateWord(10);

fixture `List of Databases`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async t => {
        // Clear and delete database
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
        await t.typeText(myRedisDatabasePage.AddRedisDatabaseDialog.portInput, ossStandaloneConfig.port, { replace: true, paste: true });
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await databaseAPIRequests.deleteAllDatabasesApi();
    });
test.skip('Verify that context for previous database not saved after editing port/username/password/certificates/SSH', async t => {
    const command = 'HSET';

    // Create context modificaions and navigate to db list
    await browserPage.addStringKey(keyName);
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.Cli.cliExpandButton);
    await t.typeText(browserPage.Cli.cliCommandInput, command, { replace: true, paste: true });
    await t.pressKey('enter');
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
    // Edit port of added database
    await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
    await t.typeText(myRedisDatabasePage.AddRedisDatabaseDialog.portInput, ossStandaloneBigConfig.port, { replace: true, paste: true });
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton);
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    // Verify that keys from the database with new port are displayed
    await t.expect(browserPage.keysSummary.find('b').withText('18 00').exists).ok('DB with new port not opened');
    // Verify that context not saved
    await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).exists).notOk('The key details is still selected');
    await t.expect(browserPage.Cli.cliCommandExecuted.withExactText(command).exists).notOk(`Executed command '${command}' in CLI is still displayed`);
});
