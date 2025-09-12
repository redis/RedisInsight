import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage, WorkbenchPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfigEmpty } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const workbenchPage = new WorkbenchPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyName = Common.generateWord(10);
const dataTypes: string[] = [
    'RedisTimeSeries',
    'RedisGraph'
];

fixture `Key messages`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfigEmpty);
    })
test('Verify that user can see updated message in Browser for TimeSeries and Graph data types', async t => {
    for(let i = 0; i < dataTypes.length; i++) {
        keyName = Common.generateWord(10);
        const commands: string[] = [
            `TS.CREATE ${keyName}`,
            `GRAPH.QUERY ${keyName} "CREATE ()"`
        ];
        const messages: string[] = [
            `This is a ${dataTypes[i]} key`,
            'Use Redis commands in the ',
            'Workbench',
            ' tool to view the value.'
        ];

        // Add key and verify message in Browser
        await browserPage.Cli.sendCommandInCli(commands[i]);
        await browserPage.searchByKeyName(keyName);
        await t.click(browserPage.keyNameInTheList);
        for(const message of messages) {
            await t.expect(browserPage.modulesTypeDetails.textContent).contains(message, `The message for ${dataTypes[i]} key is not displayed`);
        }
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfigEmpty.databaseName);
    }
});
test('Verify that user can see link to Workbench under word “Workbench” in the RedisTimeSeries and Graph key details', async t => {
    for(let i = 0; i < dataTypes.length; i++) {
        keyName = Common.generateWord(10);
        const commands: string[] = [
            `TS.CREATE ${keyName}`,
            `GRAPH.QUERY ${keyName} "CREATE ()"`
        ];

        // Add key and verify Workbench link
        await browserPage.Cli.sendCommandInCli(commands[i]);
        await t.click(browserPage.NavigationTabs.browserButton);
        await browserPage.searchByKeyName(keyName);
        await t.click(browserPage.keyNameInTheList);
        await t.click(browserPage.internalLinkToWorkbench);
        await t.expect(workbenchPage.queryInput.visible).ok(`The message for ${dataTypes[i]} key is not displayed`);
        await t.click(browserPage.NavigationTabs.browserButton);
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfigEmpty.databaseName);
    }
});
