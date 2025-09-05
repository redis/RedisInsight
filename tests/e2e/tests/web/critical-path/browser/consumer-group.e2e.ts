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
const keyField = Common.generateWord(20);
const keyValue = Common.generateWord(20);
const entryIds = [
    '0',
    '$',
    '1654594146318-0'
];

fixture `Consumer group`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async t => {
        // Clear and delete database
        if (await browserPage.closeKeyButton.exists, { timeout: 500 }) {
            await t.click(browserPage.closeKeyButton);
        }
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        // await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can create a new Consumer Group in the current Stream', async t => {
    const toolTip = [
        'Enter Valid ID, 0 or $',
        '\nSpecify the ID of the last delivered entry in the stream from the new group\'s perspective.',
        '\nOtherwise,',
        '$',
        'represents the ID of the last entry in the stream,',
        '0',
        'fetches the entire stream from the beginning.'
    ];
    keyName = Common.generateWord(20);
    consumerGroupName = `qwerty123456${Common.generateWord(20)}!@#$%^&*()_+=`;

    // Add New Stream Key
    await apiKeyRequests.addStreamKeyApi({
        keyName,
        entries: [{
            id: '*',
            fields: [{
                name: keyField,
                value: keyValue,
            }],
        }],
    }, ossStandaloneConfig);

    await browserPage.navigateToKey(keyName);
    await t.click(browserPage.fullScreenModeButton);
    // Open Stream consumer groups and add group
    await t.click(browserPage.streamTabGroups);
    await browserPage.createConsumerGroup(consumerGroupName);
    await t.expect(browserPage.streamGroupsContainer.textContent).contains(consumerGroupName, 'The new Consumer Group is not added');
    // Verify the tooltip under 'i' element
    await t.click(browserPage.addKeyValueItemsButton);
    await t.hover(browserPage.entryIdInfoIcon);
    for (const text of toolTip) {
        await t.expect(browserPage.tooltip.innerText).contains(text, 'The toolTip message not displayed');
    }
});
test('Verify that user can input the 0, $ and Valid Entry ID in the ID field', async t => {
    keyName = Common.generateWord(20);
    consumerGroupName = Common.generateWord(20);

    // Add New Stream Key
    await apiKeyRequests.addStreamKeyApi({
        keyName,
        entries: [{
            id: '*',
            fields: [{
                name: keyField,
                value: keyValue,
            }],
        }],
    }, ossStandaloneConfig);

    await browserPage.navigateToKey(keyName);
    await t.click(browserPage.fullScreenModeButton);
    // Open Stream consumer groups and add group with different IDs
    await t.click(browserPage.streamTabGroups);
    for (const entryId of entryIds) {
        await browserPage.createConsumerGroup(`${consumerGroupName}${entryId}`, entryId);
        await t.expect(browserPage.streamGroupsContainer.textContent).contains(`${consumerGroupName}${entryId}`, 'The new Consumer Group is not added');
    }
});
test('Verify that user can see the Consumer group columns (Group Name, Consumers, Pending, Last Delivered ID)', async t => {
    keyName = Common.generateWord(20);
    consumerGroupName = Common.generateWord(20);
    const groupColumns = [
        'Group Name',
        'Consumers',
        'Pending',
        'Last Delivered ID'
    ];
    const message = 'Your Consumer Group has no Consumers available.';

    // Add New Stream Key
    await apiKeyRequests.addStreamKeyApi({
        keyName,
        entries: [{
            id: '*',
            fields: [{
                name: keyField,
                value: keyValue,
            }],
        }],
    }, ossStandaloneConfig);

    await browserPage.navigateToKey(keyName);
    await t.click(browserPage.fullScreenModeButton);
    // Open Stream consumer groups and add group with different IDs
    await t.click(browserPage.streamTabGroups);
    await browserPage.createConsumerGroup(consumerGroupName);
    for (let i = 0; i < groupColumns.length; i++) {
        await t.expect(browserPage.scoreButton.nth(i).textContent).eql(groupColumns[i], `The ${i} Consumer group column name not correct`);
    }
    // Verify that user can see the message when there are no Consumers in the Consumer Group
    await t.click(browserPage.consumerGroup);
    await t.expect(browserPage.streamConsumersContainer.textContent).contains(message, 'The message for empty Consumer Group not displayed');
});
test('Verify that user can see the Consumer information columns (Consumer Name, Pendings, Idle Time,ms)', async t => {
    keyName = Common.generateWord(20);
    consumerGroupName = Common.generateWord(20);
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XREADGROUP GROUP ${consumerGroupName} Alice COUNT 1 STREAMS ${keyName} >`
    ];
    const consumerColumns = [
        'Consumer Name',
        'Pending',
        'Idle Time, msec'
    ];
    // Add New Stream Key with groups and consumers
    for(const command of cliCommands){
        await browserPage.Cli.sendCommandInCli(command);
    }
    // Open Stream consumer info view
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.streamTabGroups);
    await t.click(browserPage.consumerGroup);
    for (let i = 0; i < consumerColumns.length; i++) {
        await t.expect(browserPage.scoreButton.nth(i).textContent).eql(consumerColumns[i], `The ${i} Consumers info column name not correct`);
    }
    // Verify that user can navigate to Consumer Groups screen using the link in the breadcrumbs
    await t.expect(browserPage.streamTabs.exists).ok('Stream navigation tabs visibility');
    await t.click(browserPage.streamTabGroups);
    await t.expect(browserPage.streamTabGroups.withAttribute('aria-selected', 'true').exists).ok('The Consumer Groups screen is not opened');
});
test('Verify that user can delete the Consumer from the Consumer Group', async t => {
    keyName = Common.generateWord(20);
    const consumerGroupName = Common.generateWord(20);
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XADD ${keyName} * message orange`,
        `XREADGROUP GROUP ${consumerGroupName} Alice COUNT 1 STREAMS ${keyName} >`,
        `XREADGROUP GROUP ${consumerGroupName} Bob COUNT 1 STREAMS ${keyName} >`
    ];
    // Add New Stream Key with groups and consumers
    for (const command of cliCommands) {
        await browserPage.Cli.sendCommandInCli(command);
    }
    // Open Stream consumer info view
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.streamTabGroups);
    await t.click(browserPage.consumerGroup);
    // Delete consumer and check results
    const consumerCountBefore = await browserPage.streamConsumerName.count;
    await t.click(browserPage.removeConsumerButton);
    await t.expect(browserPage.confirmationMessagePopover.textContent).contains(`will be removed from Consumer Group ${consumerGroupName}`, 'The confirmation message not displayed');
    await t.click(browserPage.removeConsumerButton.nth(2));
    await t.expect(browserPage.streamConsumerName.count).eql(consumerCountBefore - 1, 'The Consumers number after deletion not correct');
});
test('Verify that user can delete a Consumer Group', async t => {
    keyName = Common.generateWord(20);
    const consumerGroupName = Common.generateWord(20);
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XREADGROUP GROUP ${consumerGroupName} Alice COUNT 1 STREAMS ${keyName} >`
    ];
    // Add New Stream Key with groups and consumers
    for (const command of cliCommands) {
        await browserPage.Cli.sendCommandInCli(command);
    }
    // Open Stream consumer info view
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.streamTabGroups);
    // Verify that user can change the ID set for the Consumer Group when click on the Pencil button
    for (const id of entryIds) {
        const idBefore = await browserPage.streamGroupId.textContent;
        await t.hover(browserPage.streamGroupId);
        await t.click(browserPage.editStreamLastIdButton);
        await t.typeText(browserPage.lastIdInput, id, { replace: true, paste: true });
        await t.click(browserPage.saveButton);
        await t.expect(browserPage.streamGroupId.textContent).notEql(idBefore, 'The last delivered ID is modified and the table is not reloaded');
    }
    // Delete consumer group and check results
    await t.click(browserPage.removeConsumerGroupButton);
    await t.expect(browserPage.confirmationMessagePopover.textContent).contains(`${consumerGroupName}and all its consumers will be removed from ${keyName}`, 'The confirmation message not displayed');
    await t.click(browserPage.removeConsumerGroupButton.nth(1));
    await t.expect(browserPage.streamGroupsContainer.textContent).contains('Your Key has no Consumer Groups available.', 'The Consumer Group is not removed from the table');
});
