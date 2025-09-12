import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

let keyName = Common.generateWord(20);
let consumerGroupName = Common.generateWord(20);
const keyField = Common.generateWord(20);
const keyValue = Common.generateWord(20);

fixture `Consumer group`
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
    });
test('Verify that when user enter invalid Group Name the error message appears', async t => {
    const message = 'Your Key has no Consumer Groups available.';
    const error = 'BUSYGROUP Consumer Group name already exists';
    const errorFormat = 'ID format is not correct';
    const invalidEntryIds = [
        'qwerty12344545',
        '16545941463181654594146318'
    ];
    keyName = Common.generateWord(20);
    consumerGroupName = Common.generateWord(20);

    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    // Open Stream consumer groups and check message
    await t.click(browserPage.streamTabGroups);
    // Verify that user can see the message when there are no Consumer Groups
    await t.expect(browserPage.streamGroupsContainer.textContent).contains(message, 'No Consumer Groups message not displayed');

    // Open Stream consumer groups and enter invalid EntryIds
    await t.click(browserPage.addKeyValueItemsButton);
    // Verify that when user enter invalid format ID the error message appears
    for (const entryId of invalidEntryIds) {
        await t.typeText(browserPage.consumerIdInput, entryId, { replace: true, paste: true });
        await t.click(browserPage.saveGroupsButton);
        await t.expect(browserPage.entryIdError.textContent).eql(errorFormat, 'The invalid Id error message not displayed');
    }

    await t.click(browserPage.cancelStreamGroupBtn);
    await browserPage.createConsumerGroup(consumerGroupName);
    // Verify the error message
    await t.click(browserPage.streamTabGroups);
    await browserPage.createConsumerGroup(consumerGroupName);
    await t.expect(browserPage.Toast.toastError.textContent).contains(error, 'The error message that the Group name already exists not displayed');
});
test('Verify that user can sort Consumer Group column: A>Z / Z>A(A>Z is default table sorting)', async t => {
    keyName = Common.generateWord(20);
    const consumerGroupNames = [
        'agroup',
        'bgroup',
        'zgroup'
    ];

    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    // Open Stream consumer groups and add few groups
    await t.click(browserPage.streamTabGroups);
    for(const group of consumerGroupNames){
        await browserPage.createConsumerGroup(group);
    }
    // Verify default sorting
    const groupsCount = await browserPage.streamGroupName.count;
    for(let i = 0; i < groupsCount; i++){
        await t.expect(browserPage.streamGroupName.nth(i).textContent).contains(consumerGroupNames[i], 'The Consumer Groups default sorting not working');
    }
    // Verify the Z>A sorting
    await t.click(browserPage.scoreButton.nth(0));
    for(let i = 0; i < groupsCount; i++){
        await t.expect(browserPage.streamGroupName.nth(i).textContent).contains(consumerGroupNames[groupsCount - 1 - i], 'The Consumer Groups Z>A sorting not working');
    }
});
test('Verify that A>Z is default table sorting in Consumer column', async t => {
    keyName = Common.generateWord(20);
    consumerGroupName = Common.generateWord(20);
    const consumerNames = [
        'Alice',
        'Zalice'
    ];
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XADD ${keyName} * message orange`,
        `XREADGROUP GROUP ${consumerGroupName} ${consumerNames[0]} COUNT 1 STREAMS ${keyName} >`,
        `XREADGROUP GROUP ${consumerGroupName} ${consumerNames[1]} COUNT 1 STREAMS ${keyName} >`
    ];

    // Add New Stream Key with groups and consumers
    for(const command of cliCommands){
        await browserPage.Cli.sendCommandInCli(command);
    }
    // Open Stream consumer info view
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.streamTabGroups);
    await t.click(browserPage.consumerGroup);
    // Verify default sorting
    const consumerCount = await browserPage.streamConsumerName.count;
    for(let i = 0; i < consumerCount; i++){
        await t.expect(browserPage.streamConsumerName.nth(i).textContent).contains(consumerNames[i], 'The Consumers default sorting not working');
    }
});
test('Verify that user can see error message if enter invalid last delivered ID', async t => {
    keyName = Common.generateWord(20);
    const consumerGroupName = Common.generateWord(20);
    const cliCommands = [
        `XGROUP CREATE ${keyName} ${consumerGroupName} $ MKSTREAM`,
        `XADD ${keyName} * message apple`,
        `XREADGROUP GROUP ${consumerGroupName} Alice COUNT 1 STREAMS ${keyName} >`
    ];
    const invalidEntryIds = [
        '!@#%^&*()_',
        '12345678901242532366121324'
    ];
    const errorMessage = 'ID format is not correct';

    // Add New Stream Key with groups and consumers
    for(const command of cliCommands){
        await browserPage.Cli.sendCommandInCli(command);
    }
    // Open Stream consumer info view
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.streamTabGroups);
    // Change the ID set for the Consumer Group
    await t.hover(browserPage.streamGroupId);
    await t.click(browserPage.editStreamLastIdButton);
    for(const id of invalidEntryIds){
        const idBefore = await browserPage.streamGroupId.textContent;
        await t.typeText(browserPage.lastIdInput, id, { replace: true, paste: true });
        await t.click(browserPage.saveButton);
        await t.expect(browserPage.streamGroupId.textContent).eql(idBefore, 'The last delivered ID is not modified');
        await t.expect(browserPage.entryIdError.textContent).eql(errorMessage, 'The error message not displayed');
    }
});
