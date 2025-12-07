import { t } from 'testcafe';

import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';
import { BrowserActions } from '../../../../common-actions/browser-actions';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { commonUrl } from '../../../../helpers/conf';
import { RdiPopoverOptions, RedisOverviewPage } from '../../../../helpers/constants';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { Common, DatabaseHelper, Telemetry } from '../../../../helpers';
import { RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { goBackHistory } from '../../../../helpers/utils';
import { RdiInstance } from '../../../../pageObjects/dialogs/add-rdi-instance-dialog';

const rdiInstancesListPage = new RdiInstancesListPage();
const browserActions = new BrowserActions();
const rdiInstancePage = new RdiInstancePage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const rdiApiRequests = new RdiApiRequests();

const telemetry = new Telemetry();

const logger = telemetry.createLogger();

const telemetryEvents = ['RDI_INSTANCE_LIST_SEARCHED','RDI_START_OPTION_SELECTED'];

const instanceExpectedProperties = [
    'instancesFullCount',
    'instancesSearchedCount'
];

const pipelineExpectedProperties = [
    'id',
    'option'
];

const rdiInstance: RdiInstance = {
    alias: 'Alias',
    url: 'https://11.111.111.111',
    username: 'username',
    password: '111',
    version: '1.2'
};
const rdiInstance2: RdiInstance = {
    alias: 'test',
    url: 'https://11.111.111.111',
    username: 'name',
    password: '111',
    version: '1.2'
};

const rdiInstance3: RdiInstance = {
    alias: 'first',
    url: 'https://11.111.111.111',
    username: 'name',
    password: '111',
    version: '1.2'
};
const urlTooltipText = 'The RDI machine servers REST API via port 443. Ensure that Garnet Insight can access the RDI host over port 443.';
const usernameTooltipText = 'The RDI REST API authentication is using the RDI REDIS username and password.';
const passwordTooltipText = 'The RDI REST API authentication is using the RDI REDIS username and password.';
//skip the tests until rdi integration is added

fixture.skip `Rdi instance`
    .meta({ type: 'critical_path', feature: 'rdi' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await rdiApiRequests.deleteAllRdiApi();
        await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);

    })
    .afterEach(async() => {
        await rdiInstancesListPage.deleteAllInstance();

    });
test('Verify that user can add and remove RDI', async() => {
    await t.click(rdiInstancesListPage.addRdiInstanceButton);
    // Verify that URL input contains placeholder "Enter the RDI host IP as: https://[IP-Address]" on adding RDI panel
    await t.expect(rdiInstancesListPage.AddRdiInstanceDialog.urlInput.getAttribute('placeholder')).eql('Enter the RDI host IP as: https://[IP-Address]', 'Invalid placeholder for URL input');
    // Verify that URL input contains icon with tooltip "The RDI machine servers REST API via port 443. Ensure that Garnet Insight can access the RDI host over port 443." on adding RDI panel
    await t.hover(rdiInstancesListPage.AddRdiInstanceDialog.urlInputInfoIcon);
    await browserActions.verifyTooltipContainsText(urlTooltipText, true);

    // Verify that Username input default value prepopulated by "default" on adding RDI panel
    await t.expect(rdiInstancesListPage.AddRdiInstanceDialog.usernameInput.textContent).eql('default', 'No default value for username');
    await t.typeText(rdiInstancesListPage.AddRdiInstanceDialog.usernameInput, '');
    // Verify that Username input contains placeholder "Enter the RDI Redis username" on adding RDI panel
    await t.expect(rdiInstancesListPage.AddRdiInstanceDialog.usernameInput.getAttribute('placeholder')).eql('Enter the RDI Redis username', 'Invalid placeholder for Username input');
    // Verify that Username input contains icon with tooltip "The RDI REST API authentication is using the RDI REDIS username and password." on adding RDI panel
    await t.hover(rdiInstancesListPage.AddRdiInstanceDialog.usernameInputInfoIcon);
    await browserActions.verifyTooltipContainsText(usernameTooltipText, true);

    // Verify that Password input contains placeholder "Enter the RDI Redis password" on adding RDI panel
    await t.expect(rdiInstancesListPage.AddRdiInstanceDialog.passwordInput.getAttribute('placeholder')).eql('Enter the RDI Redis password', 'Invalid placeholder for Password input');
    // Verify that Password input contains icon with tooltip "The RDI REST API authentication is using the RDI REDIS username and password." on adding RDI panel
    await t.hover(rdiInstancesListPage.AddRdiInstanceDialog.passwordInputInfoIcon);
    await browserActions.verifyTooltipContainsText(passwordTooltipText, true);

    await t
        .typeText(rdiInstancesListPage.AddRdiInstanceDialog.rdiAliasInput, rdiInstance.alias)
        .typeText(rdiInstancesListPage.AddRdiInstanceDialog.urlInput, rdiInstance.url)
        .typeText(rdiInstancesListPage.AddRdiInstanceDialog.usernameInput, rdiInstance.username as string)
        .typeText(rdiInstancesListPage.AddRdiInstanceDialog.passwordInput, rdiInstance.password as string);
    await t.click(rdiInstancesListPage.AddRdiInstanceDialog.addInstanceButton);
    const addRdiInstance = await rdiInstancesListPage.getRdiInstanceValuesByIndex(0);

    await t.expect(addRdiInstance.alias).eql(rdiInstance.alias, 'added alias is not corrected');
    await t.expect(addRdiInstance.lastConnection?.length).gt(1, 'last connection is not displayed');
    await t.expect(addRdiInstance.url).eql(rdiInstance.url, 'added alias is not corrected');
    await t.expect(addRdiInstance.version).eql(rdiInstance.version, 'added alias is not corrected');

    let notification = rdiInstancesListPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Instance has been added', 'The notification not displayed');
    await t.click(rdiInstancesListPage.Toast.toastCloseButton);
    await rdiInstancesListPage.deleteRdiByName(rdiInstance.alias);

    notification = rdiInstancesListPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Instance has been deleted', 'The notification not displayed');

    await t.expect(rdiInstancesListPage.emptyRdiList.textContent).contains('Redis Data Integration', 'The instance is not removed');
});
test.requestHooks(logger)
    .after(async() => {
        await rdiInstancesListPage.deleteAllInstance();
    })('Verify that user can search by RDI', async() => {
        await rdiInstancesListPage.addRdi(rdiInstance);
        await rdiInstancesListPage.addRdi(rdiInstance2);
        await t.typeText(rdiInstancesListPage.searchInput, rdiInstance2.alias);

        //Verify telemetry event
        await telemetry.verifyEventHasProperties(telemetryEvents[0], instanceExpectedProperties, logger);

        const addedRdiInstance = await rdiInstancesListPage.getRdiInstanceValuesByIndex(0);
        await t.expect(addedRdiInstance.alias).eql(rdiInstance2.alias, 'correct item is displayed');

        await t.expect(await rdiInstancesListPage.rdiInstanceRow.count).eql(1, 'search works incorrectly');
    });
test.requestHooks(logger)
('Verify that sorting on the list of rdi saved when rdi opened', async t => {
    // Sort by Connection Type
    await rdiInstancesListPage.addRdi(rdiInstance);
    await rdiInstancesListPage.addRdi(rdiInstance3);
    await rdiInstancesListPage.addRdi(rdiInstance2);

    const sortedByAlias = [rdiInstance.alias, rdiInstance3.alias, rdiInstance2.alias];
    await rdiInstancesListPage.sortByColumn('RDI Alias');
    let actualDatabaseList = await rdiInstancesListPage.getAllRdiNames();
    await rdiInstancesListPage.compareInstances(actualDatabaseList, sortedByAlias);
    await rdiInstancesListPage.clickRdiByName(rdiInstance.alias);
    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Pipeline);

    //verify telemetry event
    await telemetry.verifyEventHasProperties(telemetryEvents[1], pipelineExpectedProperties, logger);

    await t.click(rdiInstancePage.RdiHeader.breadcrumbsLink);
    actualDatabaseList = await rdiInstancesListPage.getAllRdiNames();
    await rdiInstancesListPage.compareInstances(actualDatabaseList, sortedByAlias);
});
test('Verify that user has the same sorting if db name is changed', async t => {
    const newAliasName  = 'New alias';

    await rdiInstancesListPage.addRdi(rdiInstance);
    await rdiInstancesListPage.addRdi(rdiInstance3);
    await rdiInstancesListPage.addRdi(rdiInstance2);

    // Sort by  name
    const sortedByAliasType = [rdiInstance.alias, rdiInstance3.alias, rdiInstance2.alias];
    await rdiInstancesListPage.sortByColumn('RDI Alias');
    let actualDatabaseList = await rdiInstancesListPage.getAllRdiNames();
    await rdiInstancesListPage.compareInstances(actualDatabaseList, sortedByAliasType);
    // Change DB name insides of sorted list
    await rdiInstancesListPage.clickEditRdiByName(rdiInstance.alias);
    // Verify that inputs info is displayed on Edit RDI panel
    await t.expect(rdiInstancesListPage.AddRdiInstanceDialog.urlInput.getAttribute('placeholder')).eql('Enter the RDI host IP as: https://[IP-Address]', 'Invalid placeholder for URL input');
    await t.hover(rdiInstancesListPage.AddRdiInstanceDialog.urlInputInfoIcon);
    await browserActions.verifyTooltipContainsText(urlTooltipText, true);
    await t.expect(rdiInstancesListPage.AddRdiInstanceDialog.usernameInput.getAttribute('placeholder')).eql('Enter the RDI Redis username', 'Invalid placeholder for Username input');
    await t.hover(rdiInstancesListPage.AddRdiInstanceDialog.usernameInputInfoIcon);
    await browserActions.verifyTooltipContainsText(usernameTooltipText, true);
    await t.expect(rdiInstancesListPage.AddRdiInstanceDialog.passwordInput.getAttribute('placeholder')).eql('Enter the RDI Redis password', 'Invalid placeholder for Password input');
    await t.hover(rdiInstancesListPage.AddRdiInstanceDialog.passwordInputInfoIcon);
    await browserActions.verifyTooltipContainsText(passwordTooltipText, true);

    await t.typeText(rdiInstancesListPage.AddRdiInstanceDialog.rdiAliasInput, newAliasName, { replace: true });
    await t.click(rdiInstancesListPage.AddRdiInstanceDialog.addInstanceButton);

    rdiInstance.alias = newAliasName;
    const addRdiInstance = await rdiInstancesListPage.getRdiInstanceValuesByIndex(1);

    await t.expect(addRdiInstance.alias).eql(rdiInstance.alias, 'added alias is not corrected');
    await t.expect(addRdiInstance.lastConnection?.length).gt(1, 'last connection is not displayed');
    await t.expect(addRdiInstance.url).eql(rdiInstance.url, 'added alias is not corrected');
    await t.expect(addRdiInstance.version).eql(rdiInstance.version, 'added alias is not corrected');

    const sortedByAliasTypeUpdated = [rdiInstance3.alias, rdiInstance.alias, rdiInstance2.alias];
    actualDatabaseList = await rdiInstancesListPage.getAllRdiNames();
    await rdiInstancesListPage.compareInstances(actualDatabaseList, sortedByAliasTypeUpdated);
});
test('Verify that button is displayed if user does not enter all mandatory information', async t => {

    const tooltipText = [
        'URL'
    ];

    await t.click(rdiInstancesListPage.addRdiInstanceButton);
    await t.typeText(rdiInstancesListPage.AddRdiInstanceDialog.rdiAliasInput, rdiInstance.alias);

    await t.click(rdiInstancesListPage.AddRdiInstanceDialog.addInstanceButton);

    for (const text of tooltipText) {
        await browserActions.verifyTooltipContainsText(text, true);
    }
});
test('Verify that user can see the Redis Data Integration message on the empty RDI list', async t => {
    const noInstancesMessage = 'Redis Data Integration (RDI) synchronizes data from your existing database into Redis in near-real-time. We\'ve done the heavy lifting so you can turn slow data into fast data without coding.';
    const externalPageLink = 'https://redis.io/docs/latest/integrate/redis-data-integration/ingest/quick-start-guide/?utm_source=redisinsight&utm_medium=rdi&utm_campaign=rdi_list';

    await t.expect(rdiInstancesListPage.emptyRdiList.withText(noInstancesMessage).exists).ok('Empty RDI page message not displayed');

    await t.click(rdiInstancesListPage.addRdiFromEmptyListBtn);
    await t.expect(rdiInstancesListPage.AddRdiInstanceDialog.connectToRdiForm.exists).ok('Add rdi form not opened');
    await t.click(rdiInstancesListPage.AddRdiInstanceDialog.cancelInstanceBtn);

    await t.click(rdiInstancesListPage.quickstartBtn);
    await Common.checkURL(externalPageLink);
    await goBackHistory();
});
