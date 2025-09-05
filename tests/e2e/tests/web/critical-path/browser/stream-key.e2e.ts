import { Chance } from 'chance';
import { Selector } from 'testcafe';
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
const chance = new Chance();

let keyName = Common.generateWord(20);
const keyField = Common.generateWord(20);
const keyValue = Common.generateWord(20);

fixture `Stream Key`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        //Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can create Stream key via Add New Key form', async t => {
    keyName = Common.generateWord(20);
    // Add New Stream Key
    await browserPage.addStreamKey(keyName, keyField, keyValue);
    // Verify that user can see Stream details opened after key creation
    await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).exists).ok('Stream Key Name not visible');
    // Verify that user can see newly added Stream key in key list clicking on keys refresh button
    await t.click(browserPage.refreshKeysButton);
    const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
    await t.expect(isKeyIsDisplayedInTheList).ok('Stream is not added');
});
test('Verify that user can add several fields and values during Stream key creation', async t => {
    const keyName = Common.generateWord(20);
    // Create an array with different data types for Stream fields
    const streamData = { 'string': Common.generateWord(20), 'array': `[${Common.generateWord(20)}, ${chance.integer()}]`, 'integer': `${chance.integer()}`, 'json': '{\'test\': \'test\'}', 'null': 'null', 'boolean': 'true' };
    const scrollSelector = Selector('.eui-yScroll').nth(-1);

    // Open Add New Stream Key form
    await browserPage.commonAddNewKey(keyName);
    await t.click(browserPage.streamOption);
    // Verify that user can see Entity ID filled by * by default on add Stream key form
    await t.expect(browserPage.streamEntryId.withAttribute('value', '*').exists).ok('Preselected Stream Entity ID field not correct');
    // Verify that user can specify valid custom value for Entry ID
    await t.typeText(browserPage.streamEntryId, '0-1', { replace: true, paste: true });
    // Filled fields and value by different data types
    for (let i = 0; i < Object.keys(streamData).length; i++) {
        await t.typeText(browserPage.streamField.nth(-1), Object.keys(streamData)[i], { replace: true, paste: true });
        await t.typeText(browserPage.streamValue.nth(-1), Object.values(streamData)[i], { replace: true, paste: true });
        await t.scroll(scrollSelector, 'bottom');
        await t.expect(browserPage.streamField.count).eql(i + 1, 'Number of added fields not correct');
        if (i < Object.keys(streamData).length - 1) {
            await t.click(browserPage.addAdditionalElement);
        }
    }
    await t.expect(browserPage.addKeyButton.withAttribute('disabled').exists).notOk('Clickable Add Key button');
    await t.click(browserPage.addKeyButton);
    await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).exists).ok('Stream Key Name');
});
test('Verify that user can add new Stream Entry for Stream data type key which has an Entry ID, Field and Value', async t => {
    keyName = Common.generateWord(20);
    const newField = Common.generateWord(20);

    // Add New Stream Key and check columns and rows
    await apiKeyRequests.addStreamKeyApi({
        keyName,
        entries: [{
            id: '*',
            fields: [{
                name: keyField,
                value: keyValue
            }],
        }]
    }, ossStandaloneConfig);
    await browserPage.navigateToKey(keyName);
    await t.expect(browserPage.streamEntryIDDateValue.count).eql(1, 'One Entry ID not displayed');
    await t.expect(browserPage.streamFields.count).eql(4, 'One field in table not displayed');
    await t.expect(browserPage.streamEntryFields.count).eql(1, 'One value in table not displayed');
    // Create new field and value and check that new column is added
    await browserPage.addEntryToStream(newField, Common.generateWord(20));
    await t.expect(browserPage.streamEntryIDDateValue.count).eql(2, 'Two Entries ID not displayed');
    await t.expect(browserPage.streamFields.count).eql(7, 'Two fields in table not displayed');
    await t.expect(browserPage.streamEntryFields.count).eql(4, 'Four values in table not displayed');
    // Create value to existed filed and check that new column was not added
    await browserPage.addEntryToStream(newField, Common.generateWord(20));
    await t.expect(browserPage.streamEntryIDDateValue.count).eql(3, 'Three Entries ID not displayed');
    await t.expect(browserPage.streamFields.count).eql(8, 'Still two fields in table not displayed');
    await t.expect(browserPage.streamEntryFields.count).eql(6, 'Six values in table not displayed');
}).skip.meta({skipComment: "CI execution unstable, verification failure, needs investigation"});
test('Verify that during new entry adding to existing Stream, user can clear the value and the row itself', async t => {
    keyName = Common.generateWord(20);
    // Generate data for stream
    const fields = [keyField, Common.generateWord(20)];
    const values = [keyValue, Common.generateWord(20)];

    // Add New Stream Key
    await apiKeyRequests.addStreamKeyApi({
        keyName,
        entries: [{
            id: '*',
            fields: [{
                name: keyField,
                value: keyValue
            }],
        }]
    }, ossStandaloneConfig);
    await browserPage.navigateToKey(keyName);

    await t.click(browserPage.addNewStreamEntry);
    await browserPage.fulfillSeveralStreamFields(fields, values);
    // Check number of rows
    const fieldsNumberBeforeDeletion = await browserPage.streamField.count;
    // Click on delete field for the last entity
    await t.click(browserPage.clearStreamEntryInputs.nth(-1));
    const fieldsNumberAfterDeletion = await browserPage.streamField.count;
    await t.expect(fieldsNumberAfterDeletion).lt(fieldsNumberBeforeDeletion, 'Number of fields after deletion not correct');
    // Validate that the last field and value were fulfilled
    await t.expect(browserPage.streamField.withAttribute('value', keyField).exists).ok('Input for field not filled');
    await t.expect(browserPage.streamValue.withAttribute('value', keyValue).exists).ok('Input for value not filled');
    // Click on clear button
    await t.hover(browserPage.streamValue);
    await t.click(browserPage.clearStreamEntryInputs);
    // Validate that data was cleared
    await t.expect(browserPage.streamField.withAttribute('value', keyField).exists).notOk('Input for field not cleared');
    await t.expect(browserPage.streamValue.withAttribute('value', keyValue).exists).notOk('Input for value not cleared');
    // Validate that the form is still displayed
    await t.expect(browserPage.streamField.count).eql(fieldsNumberAfterDeletion, 'Number of fields after deletion not correct');
});
test('Verify that user can add several fields and values to the existing Stream Key', async t => {
    keyName = Common.generateWord(20);
    // Generate field value data
    const entryQuantity = 5;
    const fields: string[] = [];
    const values: string[] = [];

    for (let i = 0; i < entryQuantity; i++) {
        const randomGeneratorValue = chance.integer({ min: 1, max: 50 });
        fields.push(chance.word({ length: randomGeneratorValue }));
        values.push(chance.word({ length: randomGeneratorValue }));
    }

    // Add New Stream Key
    await apiKeyRequests.addStreamKeyApi({
        keyName,
        entries: [{
            id: '*',
            fields: [{
                name: keyField,
                value: keyValue
            }],
        }]
    }, ossStandaloneConfig);
    await browserPage.navigateToKey(keyName);

    await t.click(browserPage.addNewStreamEntry);
    // Filled Stream by new several Fields
    await browserPage.fulfillSeveralStreamFields(fields, values);
    await t.click(browserPage.saveElementButton);
    // Check that all data is saved in Stream
    await t.click(browserPage.fullScreenModeButton);
    for (let i = 0; i < fields.length; i++) {
        await t.expect(browserPage.streamFieldsValues.find('span').withExactText(values[i]).exists).ok('Added Value not displayed');
        await t.expect(browserPage.streamEntriesContainer.find('div').withExactText(fields[i]).exists).ok('Added Field not displayed');
    }
    // Check Stream length
    const streamLength = await browserPage.getKeyLength();
    await t.expect(streamLength).eql('2', 'Stream length after adding new entry not correct');
    await t.click(browserPage.fullScreenModeButton);
});
test('Verify that user can see the Stream range filter', async t => {
    keyName = Common.generateWord(20);
    // Add new Stream key with 1 field
    await browserPage.Cli.sendCommandInCli(`XADD ${keyName} * fields values`);
    // Open key details and check filter
    await browserPage.openKeyDetails(keyName);
    await t.expect(browserPage.rangeLeftTimestamp.visible).ok('The stream range start timestamp not visible');
    await t.expect(browserPage.rangeRightTimestamp.visible).ok('The stream range end timestamp not visible');
    await t.expect(browserPage.streamRangeBar.visible).ok('The stream range bar not visible');
});
