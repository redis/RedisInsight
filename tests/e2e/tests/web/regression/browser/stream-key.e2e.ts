import { DatabaseHelper } from '../../../../helpers/database';
import { rte } from '../../../../helpers/constants';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

const value = Common.generateWord(5);
let field = Common.generateWord(5);
let keyName = Common.generateWord(20);

fixture `Stream key`
    .meta({
        type: 'regression',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can see a Stream in a table format', async t => {
    const streamFields = [
        'Entry ID',
        field
    ];
    keyName = Common.generateWord(20);
    const command = `XADD ${keyName} * '${field}' '${value}'`;

    // Add new Stream key with 5 EntryIds
    for(let i = 0; i < 5; i++){
        await browserPage.Cli.sendCommandInCli(command);
    }
    // Open key details and check Steam format
    await browserPage.openKeyDetails(keyName);
    await t.expect(browserPage.streamEntriesContainer.visible).ok('The Stream is not displayed in a table format');
    for(const field of streamFields){
        await t.expect(browserPage.streamEntriesContainer.textContent).contains(field, 'The Stream fields are not displayed in the table');
    }
    await t.expect(browserPage.streamFieldsValues.textContent).contains(value, 'The Stream field value is not displayed in the table');
});
test('Verify that user can sort ASC/DESC by Entry ID', async t => {
    keyName = Common.generateWord(20);
    const command = `XADD ${keyName} * '${field}' '${value}'`;

    // Add new Stream key with 5 EntryIds
    for(let i = 0; i < 5; i++){
        await browserPage.Cli.sendCommandInCli(command);
        await t.wait(1000);
    }
    // Open key details and check Entry ID ASC sorting
    await browserPage.openKeyDetails(keyName);
    const entryCount = await browserPage.streamEntryDate.count;
    for(let i = 0; i < entryCount - 1; i++){
        const entryDateFirstAsc = Date.parse(await browserPage.streamEntryDate.nth(i).textContent);
        const entryDateSecondAsc = Date.parse(await browserPage.streamEntryDate.nth(i + 1).textContent);
        await t.expect(entryDateFirstAsc).gt(entryDateSecondAsc, 'By default the table is not sorted by Entry ID');
    }
    // Check the DESC sorting
    await t.click(browserPage.sortingButton);
    for(let i = 0; i < entryCount - 1; i++){
        const entryDateFirstDesc = Date.parse(await browserPage.streamEntryDate.nth(i).textContent);
        const entryDateSecondDesc = Date.parse(await browserPage.streamEntryDate.nth(i + 1).textContent);
        await t.expect(entryDateFirstDesc).lt(entryDateSecondDesc, 'The Stream fields are not sorted DESC by Entry ID');
    }
});
test('Verify that user can see all the columns are displayed by default for Stream', async t => {
    keyName = Common.generateWord(20);
    const fields = [
        'Pressure',
        'Humidity',
        'Temperature'
    ];
    const values = [
        '234',
        '78',
        '27'
    ];

    // Add new Stream key with 3 fields
    for(let i = 0; i < fields.length; i++){
        await browserPage.Cli.sendCommandInCli(`XADD ${keyName} * ${fields[i]} ${values[i]}`);
    }
    // Open key details and check fields
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.fullScreenModeButton);
    for(let i = fields.length - 1; i <= 0; i--){
        const fieldName = await browserPage.streamFields.nth(i).textContent;
        await t.expect(fieldName).eql(fields[i], 'All the columns are not displayed by default for Stream');
    }
    await t.click(browserPage.fullScreenModeButton);
});
test('Verify that the multi-line cell value tooltip is available on hover as per standard key details behavior', async t => {
    keyName = Common.generateWord(20);
    const fields = [
        'Pressure',
        'Humidity'
    ];
    const entryValue = Common.generateSentence(5);

    // Add new Stream key with multi-line cell value
    for(let i = 0; i < fields.length; i++){
        await browserPage.Cli.sendCommandInCli(`XADD ${keyName} * '${fields[i]}' '${entryValue}'`);
    }
    // Open key details and check tooltip
    await browserPage.openKeyDetails(keyName);
    await t.hover(browserPage.streamEntryFields);
    await t.expect(browserPage.tooltip.textContent).contains(entryValue, 'The multi-line cell value tooltip is not available');
});
test('Verify that user can see a confirmation message when request to delete an entry in the Stream', async t => {
    keyName = Common.generateWord(20);
    field = 'fieldForRemoving';
    const confirmationMessage = `will be removed from ${keyName}`;

    // Add new Stream key with 1 field
    await browserPage.Cli.sendCommandInCli(`XADD ${keyName} * ${field} ${value}`);
    // Open key details and click on delete entry
    await browserPage.openKeyDetails(keyName);
    const entryId = await browserPage.streamEntryIdValue.textContent;
    await t.click(browserPage.removeEntryButton);
    // Check the confirmation message
    await t.expect(browserPage.confirmationMessagePopover.textContent).contains(confirmationMessage, `The confirmation message ${keyName} not displayed`);
    await t.expect(browserPage.confirmationMessagePopover.textContent).contains(entryId, 'The confirmation message for removing Entry not displayed');
});
test('Verify that the Entry ID field, Delete button are always displayed while scrolling for Stream data', async t => {
    keyName = Common.generateWord(20);
    const fields = Common.createArrayWithKeys(9);
    const values = Common.createArrayWithKeys(9);

    const commands: string[] = [];
    // Add new Stream key with 3 fields
    for (let i = 0; i < fields.length; i++) {
        commands.push(`XADD ${keyName} * ${fields[i]} ${values[i]}`);
    }
    await browserPage.Cli.sendCommandsInCli(commands);
    // Open key details
    await browserPage.openKeyDetails(keyName);
    // Scroll right
    await t.pressKey('shift').scroll(browserPage.streamVirtualContainer, 'right');
    // Verify that Entry ID field and Delete button are always displayed
    await t.expect(browserPage.streamFieldsValues.withText(fields[2]).visible).ok(`The Stream field ${fields[2]} is not visible`)
        .expect(browserPage.removeEntryButton.visible).ok('Delete icon is not visible')
        .expect(browserPage.streamEntryDate.visible).ok('Entry ID column is not visible');
});
