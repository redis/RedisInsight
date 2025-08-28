import * as path from 'path';
import { ClientFunction, t } from 'testcafe';
import * as yaml from 'js-yaml';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { cloudDatabaseConfig, commonUrl } from '../../../../helpers/conf';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';
import {
    RdiPopoverOptions,
    RdiTemplateDatabaseType,
    RedisOverviewPage,
    TextConnectionSection
} from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers';
import { goBackHistory } from '../../../../helpers/utils';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const rdiInstancePage = new RdiInstancePage();
const rdiInstancesListPage = new RdiInstancesListPage();
const rdiApiRequests = new RdiApiRequests();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const rdiInstance: AddNewRdiParameters = {
    name: 'testInstance',
    url: 'https://11.111.111.111',
    username: 'username',
    password: '111'
};

const getPageUrl = ClientFunction(() => window.location.href);

const filePath = path.join('..', '..', '..', '..', 'test-data', 'rdi', 'RDI_pipelineConfigurations.zip');

//skip the tests until rdi integration is added
fixture.skip `Pipeline`
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
    // Delete databases
    await databaseAPIRequests.deleteAllDatabasesApi();
})('Verify that user can test connection', async() => {
    await myRedisDatabasePage.setActivePage(RedisOverviewPage.DataBase);
    await databaseHelper.autodiscoverRedisCloudDatabase(
        cloudDatabaseConfig.accessKey,
        cloudDatabaseConfig.secretKey
    );
    const [host, port] = (await myRedisDatabasePage.hostPort.textContent).split(':');
    const password = cloudDatabaseConfig.databasePassword;
    const errorText = 'Failed to connect to RDI database. Please verify host and port information.';

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

    await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Pipeline);
    await t.click(rdiInstancePage.templateCancelButton);

    await t.click(rdiInstancePage.configurationInput);
    const lines = config.split('\n');
    // the variable shows the level of object depth for input by line in monaco
    const maxLevelDepth = 4;
    const targetName = 'target';

    await rdiInstancePage.MonacoEditor.insertTextByLines(rdiInstancePage.configurationInput, lines, maxLevelDepth);
    await t.click(rdiInstancePage.textConnectionBtn);
    await rdiInstancePage.TestConnectionPanel.expandOrCollapseSection(TextConnectionSection.Success, true);

    await t.expect(await rdiInstancePage.TestConnectionPanel.targetName.textContent).eql(targetName);

    await t.click(rdiInstancePage.RdiHeader.uploadFromFileButton);
    await rdiInstancePage.RdiHeader.uploadPipeline(filePath);
    await t.click(rdiInstancePage.okUploadPipelineBtn);
    await t.click(rdiInstancePage.textConnectionBtn);
    await rdiInstancePage.TestConnectionPanel.expandOrCollapseSection(TextConnectionSection.Failed, true);

    await t.expect(await rdiInstancePage.TestConnectionPanel.resultText.textContent).eql(errorText);

});
test('Verify that link on configuration is valid', async() => {

    const link = 'https://redis.io/docs/latest/integrate/redis-data-integration/ingest/data-pipelines/data-pipelines/?utm_source=redisinsight&utm_medium=rdi&utm_campaign=config_file';
    // Verify the link
    await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
    await t.click(rdiInstancePage.PipelineManagementPanel.configurationTab);
    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Server);
    await t.click(rdiInstancePage.configurationLink);
    await t.expect(getPageUrl()).eql(link, 'Build from homebrew page is not valid');
    await goBackHistory();
});

test('Verify that user can insert template', async() => {
    const disabledAttribute = 'isDisabled';
    const defaultValue = 'mongodb';
    const templateWords = 'type: mysql';
    // should be empty config
    await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Pipeline);
    await t.expect(rdiInstancePage.templateApplyButton.visible).ok('The template popover is not expanded');
    const buttonClass = rdiInstancePage.templateApplyButton.getAttribute('class');
    await t.expect(buttonClass).notContains(disabledAttribute, 'Apply button is disabled');
    await t.click(rdiInstancePage.templateCancelButton);
    await t.expect(rdiInstancePage.templateApplyButton.exists).notOk('The template popover is not closed');

    await t.click(rdiInstancePage.templateButton);
    await t.expect(rdiInstancePage.templateApplyButton.visible).ok('The template popover is not expanded');
    await t.expect(rdiInstancePage.databaseDropdown.textContent).eql(defaultValue, 'The default value is set incorrectly');
    await rdiInstancePage.setTemplateDropdownValue(RdiTemplateDatabaseType.MySql);

    const enteredText = await rdiInstancePage.MonacoEditor.getTextFromMonaco();
    await t.expect(enteredText).contains(templateWords, 'Template is incorrect');

    await t.click(rdiInstancePage.templateButton);
    await t.expect(buttonClass).contains(disabledAttribute, 'Apply button is active');
    await t.expect(rdiInstancePage.databaseDropdown.textContent).eql(defaultValue, 'the value is set incorrectly');
});
