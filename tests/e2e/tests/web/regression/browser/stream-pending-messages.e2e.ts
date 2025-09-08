import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyName = Common.generateWord(20);
let consumerGroupName = Common.generateWord(20);

fixture `Pending messages`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async t => {
        // Clear and delete database
        if (await browserPage.closeKeyButton.visible){
            await t.click(browserPage.closeKeyButton);
        }
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can\'t select currently selected Consumer to Claim message in the drop-down', async t => {
    keyName = Common.generateWord(20);
    consumerGroupName = Common.generateWord(20);
    const consumerNames = [
        'Alice',
        'Bob'
    ];
    const cliCommandsForStream = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XADD ${keyName} * message orange`,
        `XREADGROUP GROUP ${consumerGroupName} ${consumerNames[0]} COUNT 1 STREAMS ${keyName} >`,
        `XREADGROUP GROUP ${consumerGroupName}  ${consumerNames[1]} COUNT 1 STREAMS ${keyName} >`
    ];

    // Add New Stream Key with pending message
    await browserPage.Cli.sendCommandsInCli(cliCommandsForStream);
    // Open Stream pending view
    await browserPage.openStreamPendingsView(keyName);
    // Click on Claim message and check result
    await t.click(browserPage.claimPendingMessageButton);
    await t.click(browserPage.consumerDestinationSelect);
    await t.expect(browserPage.consumerOption.textContent).notContains(consumerNames[0], 'The currently selected Consumer is in the drop-down');
});
// todo: enable after RI-7447 will be fixed
test.skip('Verify that the message is claimed only if its idle time is greater than the Min Idle Time', async t => {
    keyName = Common.generateWord(20);
    consumerGroupName = Common.generateWord(20);
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XADD ${keyName} * message orange`,
        `XREADGROUP GROUP ${consumerGroupName} Alice COUNT 1 STREAMS ${keyName} >`,
        `XREADGROUP GROUP ${consumerGroupName} Bob COUNT 1 STREAMS ${keyName} >`
    ];

    // Add New Stream Key with pending message
    await browserPage.Cli.sendCommandsInCli(cliCommands);
    // Open Stream pendings view
    await browserPage.openStreamPendingsView(keyName);
    const streamMessageBefore = await browserPage.streamMessage.count;
    // Claim message and check result when Min Idle Time is greater than the idle time
    await t.click(browserPage.claimPendingMessageButton);
    await t.typeText(browserPage.streamMinIdleTimeInput, '100000000', { replace: true, paste: true });
    await t.click(browserPage.submitButton);
    await t.expect(browserPage.Toast.toastHeader.textContent).contains('No messages claimed', 'The message is not claimed notification');
    await t.expect(browserPage.streamMessage.count).eql(streamMessageBefore, 'The number of pendings in the table not correct');
});
// todo: enable after RI-7447 will be fixed
test.skip('Verify that when user toggle optional parameters on, he can see optional fields', async t => {
    keyName = Common.generateWord(20);
    consumerGroupName = Common.generateWord(20);
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XADD ${keyName} * message orange`,
        `XREADGROUP GROUP ${consumerGroupName} Alice COUNT 1 STREAMS ${keyName} >`,
        `XREADGROUP GROUP ${consumerGroupName} Bob COUNT 1 STREAMS ${keyName} >`
    ];

    // Add New Stream Key with pending message
    await browserPage.Cli.sendCommandsInCli(cliCommands);
    // Open Stream pendings view
    await browserPage.openStreamPendingsView(keyName);
    // Click Claim message with optional parameters and check fields
    await t.click(browserPage.claimPendingMessageButton);
    await t.click(browserPage.optionalParametersSwitcher);
    await t.expect(browserPage.claimIdleTimeInput.visible).ok('The Idle Time field is not displayed in optional parameters');
    await t.expect(browserPage.claimRetryCountInput.visible).ok('The Retry Count field is not displayed in optional parameters');
    await t.expect(browserPage.claimTimeOptionSelect.visible).ok('The Idle Time Format is not displayed in optional parameters');
    await t.expect(browserPage.forceClaimCheckbox.visible).ok('The Force Claim is not displayed in optional parameters');
    await t.click(browserPage.claimTimeOptionSelect);
    await t.expect(browserPage.relativeTimeOption.textContent).eql('Relative Time', 'The first option in the time format select list not displayed');
    await t.expect(browserPage.timestampOption.textContent).eql('Timestamp', 'The second option in the time format select list not displayed');
});
test('Verify that user see the column names in the Pending messages table and navigate by tabs', async t => {
    keyName = Common.generateWord(20);
    consumerGroupName = Common.generateWord(20);
    const columns = [
        'Entry ID',
        'Last Message Delivered',
        'Times Message Delivered'
    ];
    const cliCommandsForStream = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XREADGROUP GROUP ${consumerGroupName} Alice COUNT 1 STREAMS ${keyName} >`
    ];

    // Add New Stream Key with pending message
    await browserPage.Cli.sendCommandsInCli(cliCommandsForStream);
    // Open Stream pendings view and check columns
    await browserPage.openStreamPendingsView(keyName);
    // Click Claim message with optional parameters and check fields
    for(const column of columns){
        await t.expect(browserPage.streamMessagesContainer.textContent).contains(column, `The column name ${column} not correct`);
    }
    // Check navigation
    await t.click(browserPage.streamTabConsumers);
    await t.expect(browserPage.scoreButton.textContent).eql('Consumer Name', 'The Conusmer view is not opened');
    await t.click(browserPage.streamTabGroups);
    await t.expect(browserPage.scoreButton.textContent).eql('Group Name', 'The Consumer Groups view is not opened');
});
