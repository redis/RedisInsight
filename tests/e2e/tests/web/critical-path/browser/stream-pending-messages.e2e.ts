import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyName = Common.generateWord(20);
let consumerGroupName = Common.generateWord(20);

// todo: enable after RI-7447 will be fixed
fixture.skip `Acknowledge and Claim of Pending messages`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async t => {
        // Clear and delete database
        if (await browserPage.closeKeyButton.exists){
            await t.click(browserPage.closeKeyButton);
        }
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can acknowledge any message in the list of pending messages', async t => {
    keyName = Common.generateWord(20);
    consumerGroupName = Common.generateWord(20);
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XREADGROUP GROUP ${consumerGroupName} Alice COUNT 1 STREAMS ${keyName} >`
    ];

    // Add New Stream Key with pending message
    await browserPage.Cli.sendCommandsInCli(cliCommands);

    // Open Stream pending view
    await browserPage.openStreamPendingsView(keyName);
    // Acknowledge message and check result
    await t.click(browserPage.acknowledgeButton);
    await t.expect(browserPage.confirmationMessagePopover.textContent).contains('will be acknowledged and removed from the pending messages list', 'The confirmation message');
    await t.click(browserPage.confirmAcknowledgeButton);
    await t.expect(browserPage.streamMessagesContainer.textContent).contains('Your Consumer has no pending messages.', 'The messages is acknowledged from the table');
});
test('Verify that user can claim any message in the list of pending messages', async t => {
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
    // Claim message and check result
    await t.click(browserPage.claimPendingMessageButton);
    await t.expect(browserPage.pendingCount.textContent).eql('pending: 1', 'The number of pending messages for selected consumer');
    await t.click(browserPage.submitButton);
    await t.expect(browserPage.streamMessagesContainer.textContent).contains('Your Consumer has no pending messages.', 'The messages is claimed and removed from the table');
    await t.click(browserPage.streamTabConsumers);
    await t.click(browserPage.streamConsumerName.nth(1));
    await t.expect(browserPage.streamMessage.count).eql(2, 'The claimed messages is in the selected Consumer');
});
test('Verify that claim with optional parameters, the message removed from this Consumer and appeared in the selected Consumer', async t => {
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
    // Claim message with optional parameters and check result
    await t.click(browserPage.claimPendingMessageButton);
    await t.expect(browserPage.optionalParametersSwitcher.withAttribute('aria-checked', 'false').exists).ok('By default toggle for optional parameters is off');
    await t.click(browserPage.optionalParametersSwitcher);
    await t.typeText(browserPage.claimIdleTimeInput, '100', { replace: true, paste: true });
    await t.click(browserPage.forceClaimCheckbox);
    await t.click(browserPage.submitButton);
    await t.expect(browserPage.streamMessagesContainer.textContent).contains('Your Consumer has no pending messages.', 'The messages is claimed and removed from the table');
    await t.click(browserPage.streamTabConsumers);
    await t.click(browserPage.streamConsumerName.nth(1));
    await t.expect(browserPage.streamMessage.count).eql(2, 'The claimed messages is in the selected Consumer');
});
