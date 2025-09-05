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

let keyName = Common.generateWord(20);
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

fixture `Stream key entry deletion`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that the Stream information is refreshed and the deleted entry is removed when user confirm the deletion of an entry', async t => {
    keyName = Common.generateWord(20);
    const fieldForDeletion = fields[2];

    const cliCommands: string[] = [];
    // Add new Stream key with 3 fields
    for(let i = 0; i < fields.length; i++){
        cliCommands.push(`XADD ${keyName} * ${fields[i]} ${values[i]}`);
    }

    await browserPage.Cli.sendCommandsInCli(cliCommands);

    // Open key details and remember the Stream information
    await browserPage.openKeyDetails(keyName);
    await t.expect(browserPage.streamFields.nth(1).textContent).eql(fieldForDeletion, 'The first field entry name not found');
    const entriesCountBefore = (await browserPage.keyLengthDetails.textContent).split(': ')[1];
    // Delete entry from the Stream
    await browserPage.deleteStreamEntry();
    // Check results
    const entriesCountAfter = (await browserPage.keyLengthDetails.textContent).split(': ')[1];
    await t.expect(Number(entriesCountBefore) - 1).eql(Number(entriesCountAfter), 'The Entries length is not refreshed');
    const fieldsLengthAfter = await browserPage.streamFields.count;
    for(let i = fieldsLengthAfter - 1; i <= 0; i--){
        const fieldName = await browserPage.streamFields.nth(i).textContent;
        await t.expect(fieldName).notEql(fieldForDeletion, 'The deleted entry is not removed from the Stream');
    }
});
test('Verify that when user delete the last Entry from the Stream the Stream key is not deleted', async t => {
    keyName = Common.generateWord(20);
    const emptyStreamMessage = 'There are no Entries in the Stream.';
    // Add new Stream key with 1 field
    await browserPage.Cli.sendCommandInCli(`XADD ${keyName} * ${fields[0]} ${values[0]}`);
    // Open key details and delete entry from the Stream
    await browserPage.openKeyDetails(keyName);
    await browserPage.deleteStreamEntry();
    // Check results
    await t.expect(browserPage.streamEntriesContainer.textContent).contains(emptyStreamMessage, 'The message after deletion of the last Entry from the Stream not found');
    await browserPage.searchByKeyName(keyName);
    await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).ok('The Stream key is deleted');
});
