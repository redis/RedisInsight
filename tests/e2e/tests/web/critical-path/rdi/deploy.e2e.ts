import * as path from 'path';
import { t } from 'testcafe';
import * as yaml from 'js-yaml';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { cloudDatabaseConfig, commonUrl } from '../../../../helpers/conf';
import { BrowserPage, MyRedisDatabasePage } from '../../../../pageObjects';
import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';
import {
    RdiPopoverOptions,
    RedisOverviewPage
} from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { RdiStatusPage } from '../../../../pageObjects/rdi-status-page';

const myRedisDatabasePage = new MyRedisDatabasePage();
const rdiInstancePage = new RdiInstancePage();
const rdiInstancesListPage = new RdiInstancesListPage();
const rdiApiRequests = new RdiApiRequests();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const browserPage = new BrowserPage();
const rdiStatusPage = new RdiStatusPage();

const rdiInstance: AddNewRdiParameters = {
    name: 'testInstance',
    url: 'https://11.111.111.111',
    username: 'username',
    password: '111'
};

const cloudName = 'Redis-Cloud';

const filePath = path.join('..', '..', '..', '..', 'test-data', 'rdi', 'RDI_pipelineConfigurations.zip');

//skip the tests until rdi integration is added
fixture.skip `Deploy`
    .meta({ type: 'critical_path', feature: 'rdi' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await rdiApiRequests.addNewRdiApi(rdiInstance);

    })
    .afterEach(async() => {
        await rdiApiRequests.deleteAllRdiApi();
    });

test.after(async() => {

    await t.click(browserPage.Cli.cliExpandButton);
    await browserPage.Cli.sendCommandInCli('flushdb');

    // Delete databases
    await databaseAPIRequests.deleteAllDatabasesApi();
    await rdiApiRequests.deleteAllRdiApi();
})('Verify that deploy and reset work', async() => {
    await myRedisDatabasePage.setActivePage(RedisOverviewPage.DataBase);
    await databaseHelper.autodiscoverRedisCloudDatabase(
        cloudDatabaseConfig.accessKey,
        cloudDatabaseConfig.secretKey
    );
    const [host, port] = (await myRedisDatabasePage.hostPort.textContent).split(':');
    const password = cloudDatabaseConfig.databasePassword;

    const configData = {
        sources: {
            mysql: {
                type: 'cdc',
                logging: {
                    level: 'info'
                },
                connection: {
                    type: 'mysql',
                    host: 'localhost',
                    port: 3306,
                    user: 'root',
                    password: '1111',
                    database: 'mydatabase'
                }
            }
        },
        targets: {
            target: {
                connection: {
                    type: 'redis',
                    host,
                    port,
                    password: password
                }
            }
        }
    };
    const config = yaml.dump(configData, { indent: 2 });

    // clear added db
    await myRedisDatabasePage.clickOnDBByName(cloudName);

    await t.click(browserPage.Cli.cliExpandButton);
    await browserPage.Cli.sendCommandInCli('flushdb');
    await t.click(browserPage.NavigationPanel.myRedisDBButton);

    //deploy pipeline
    await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Pipeline);
    await t.click(rdiInstancePage.templateCancelButton);

    await t.click(rdiInstancePage.configurationInput);
    const lines = config.split('\n');
    // the variable shows the level of object depth for input by line in monaco
    const maxLevelDepth = 4;
    await rdiInstancePage.MonacoEditor.insertTextByLines(rdiInstancePage.configurationInput, lines, maxLevelDepth);
    await t.click(rdiInstancePage.RdiHeader.deployPipelineBtn);
    await t.click(rdiInstancePage.RdiHeader.deployConfirmBtn);
    await t.expect(rdiInstancePage.loadingIndicator.exists).notOk({ timeout: 20000 });
    await t.click(rdiInstancePage.NavigationPanel.myRedisDBButton);

    //verify that keys are added
    await rdiInstancePage.setActivePage(RedisOverviewPage.DataBase);
    await myRedisDatabasePage.clickOnDBByName(
        cloudName);
    await t
        .expect(browserPage.keysSummary.exists)
        .ok('Key list not loaded', { timeout: 5000 });

    await t.click(browserPage.Cli.cliExpandButton);
    await browserPage.Cli.sendCommandInCli('flushdb');
    await t.click(browserPage.NavigationPanel.myRedisDBButton);
    // reset pipeline
    await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Server);
    await t.click(rdiInstancePage.RdiHeader.resetPipelineButton);

    // keys is added again after reset
    await rdiInstancePage.setActivePage(RedisOverviewPage.DataBase);
    await myRedisDatabasePage.clickOnDBByName(
        cloudName);
    await t
        .expect(browserPage.keysSummary.exists)
        .ok('Key list not loaded', { timeout: 5000 });
});

test('Verify stop and start works', async() => {

    await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);

    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.File);
    await rdiInstancePage.RdiHeader.uploadPipeline(filePath);
    await t.click(rdiInstancePage.RdiHeader.deployPipelineBtn);
    await t.click(rdiInstancePage.RdiHeader.deployConfirmBtn);
    await t.expect(rdiInstancePage.loadingIndicator.exists).notOk({ timeout: 20000 });

    // verify stop button
    await t.click(rdiInstancePage.RdiHeader.stopPipelineButton);
    await t.expect(rdiInstancePage.RdiHeader.stopPipelineButton.hasAttribute('disabled')).ok('the stop button is not disabled');
    // wait until disabled
    await t.expect(rdiInstancePage.RdiHeader.stopPipelineButton.hasAttribute('disabled')).notOk('the stop button is not disabled');
    await t.expect(rdiInstancePage.RdiHeader.startPipelineButton.hasAttribute('disabled')).notOk('the start button is not disabled');

    await t.expect(rdiInstancePage.RdiHeader.stopPipelineButton.exists).notOk('the stop button is displayed');
    await t.expect(rdiInstancePage.RdiHeader.startPipelineButton.exists).ok('the start button is not displayed');

    await t.click(rdiInstancePage.NavigationPanel.statusPageButton);
    await t.expect(rdiStatusPage.refreshStreamsButton.exists).ok('status is not loaded');
    await t.click(rdiInstancePage.NavigationPanel.managementPageButton);

    // verify start button
    await t.click(rdiInstancePage.RdiHeader.startPipelineButton);
    await t.expect(rdiInstancePage.RdiHeader.startPipelineButton.hasAttribute('disabled')).ok('the start button is not disabled');
    // wait until disabled
    await t.expect(rdiInstancePage.RdiHeader.startPipelineButton.hasAttribute('disabled')).notOk('the start button is not disabled');
    await t.expect(rdiInstancePage.RdiHeader.stopPipelineButton.hasAttribute('disabled')).notOk('the stop button is not disabled');

    await t.expect(rdiInstancePage.RdiHeader.startPipelineButton.exists).notOk('the start button is displayed');
    await t.expect(rdiInstancePage.RdiHeader.stopPipelineButton.exists).ok('the stop button is not displayed');

    await t.click(rdiInstancePage.NavigationPanel.statusPageButton);
    await t.expect(rdiStatusPage.refreshStreamsButton.exists).notOk('status is loaded');

    await t.expect(rdiInstancePage.RdiHeader.pipelineStatus.exists).ok('status is not displayed');

    //TODO if it possible add a record to verify that the buttons work

});
