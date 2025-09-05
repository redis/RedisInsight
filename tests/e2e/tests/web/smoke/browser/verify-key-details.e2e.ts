import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig, ossStandaloneV7Config } from '../../../../helpers/conf';
import { Common } from '../../../../helpers/common';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyName = Common.generateWord(10);
const keyTTL = '2147476121';
const expectedTTL = /214747612*/;

fixture `Key details verification`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can see Hash Key details', async t => {
    keyName = Common.generateWord(10);

    await browserPage.addHashKey(keyName, keyTTL);
    const keyDetails = await browserPage.keyDetailsHeader.textContent;
    const keyBadge = await browserPage.keyDetailsBadge.textContent;
    const keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    const keyTTLValue = await browserPage.keyDetailsTTL.textContent;

    await t.expect(keyNameFromDetails).contains(keyName, 'The Hash Key Name is incorrect');
    await t.expect(keyDetails).contains('Hash', 'The Hash Key Type is incorrect');
    await t.expect(keyDetails).contains('TTL', 'The Hash TTL is incorrect');
    await t.expect(keyTTLValue).match(expectedTTL, 'The Hash Key TTL is incorrect');
    await t.expect(keyBadge).contains('Hash', 'The Hash Key Badge is incorrect');
});
test('Verify that user can see List Key details', async t => {
    keyName = Common.generateWord(10);

    await browserPage.addListKey(keyName, keyTTL);
    const keyDetails = await browserPage.keyDetailsHeader.textContent;
    const keyBadge = await browserPage.keyDetailsBadge.textContent;
    const keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    const keyTTLValue = await browserPage.keyDetailsTTL.textContent;

    await t.expect(keyNameFromDetails).contains(keyName, 'The List Key Name is incorrect');
    await t.expect(keyDetails).contains('List', 'The List Key Type is incorrect');
    await t.expect(keyDetails).contains('TTL', 'The List TTL is incorrect');
    await t.expect(keyTTLValue).match(expectedTTL, 'The List Key TTL is incorrect');
    await t.expect(keyBadge).contains('List', 'The List Key Badge is incorrect');
});
test('Verify that user can see Set Key details', async t => {
    keyName = Common.generateWord(10);

    await browserPage.addSetKey(keyName, keyTTL);
    const keyDetails = await browserPage.keyDetailsHeader.textContent;
    const keyBadge = await browserPage.keyDetailsBadge.textContent;
    const keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    const keyTTLValue = await browserPage.keyDetailsTTL.textContent;

    await t.expect(keyNameFromDetails).contains(keyName, 'The Set Key Name is incorrect');
    await t.expect(keyDetails).contains('Set', 'The Set Key Type is incorrect');
    await t.expect(keyDetails).contains('TTL', 'The Set TTL is incorrect');
    await t.expect(keyTTLValue).match(expectedTTL, 'The Set Key TTL is incorrect');
    await t.expect(keyBadge).contains('Set', 'The Set Key Badge is incorrect');
});
test('Verify that user can see String Key details', async t => {
    keyName = Common.generateWord(10);
    const value = 'keyValue12334353434;';

    await browserPage.addStringKey(keyName, value, keyTTL);
    const keyDetails = await browserPage.keyDetailsHeader.textContent;
    const keyBadge = await browserPage.keyDetailsBadge.textContent;
    const keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    const keyTTLValue = await browserPage.keyDetailsTTL.textContent;

    await t.expect(keyNameFromDetails).contains(keyName, 'The String Key Name is incorrect');
    await t.expect(keyDetails).contains('String', 'The String Key Type is incorrect');
    await t.expect(keyDetails).contains('TTL', 'The StringTTL is incorrect');
    await t.expect(keyTTLValue).match(expectedTTL, 'The String Key TTL is incorrect');
    await t.expect(keyBadge).contains('String', 'The String Key Badge is incorrect');
});
test('Verify that user can see ZSet Key details', async t => {
    keyName = Common.generateWord(10);

    await browserPage.addZSetKey(keyName, '1', keyTTL);
    const keyDetails = await browserPage.keyDetailsHeader.textContent;
    const keyBadge = await browserPage.keyDetailsBadge.textContent;
    const keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    const keyTTLValue = await browserPage.keyDetailsTTL.textContent;

    await t.expect(keyNameFromDetails).contains(keyName, 'The ZSet Key Name is incorrect');
    await t.expect(keyDetails).contains('Sorted Set', 'The ZSet Key Type is incorrect');
    await t.expect(keyDetails).contains('TTL', 'The ZSet TTL is incorrect');
    await t.expect(keyTTLValue).match(expectedTTL, 'The ZSet Key TTL is incorrect');
    await t.expect(keyBadge).contains('Sorted Set', 'The ZSet Key Badge is incorrect');
});
test('Verify that user can see JSON Key details', async t => {
    keyName = Common.generateWord(10);

    const jsonValue = '{"employee":{ "name":"John", "age":30, "city":"New York" }}';

    await browserPage.addJsonKey(keyName, jsonValue, keyTTL);
    const keyDetails = await browserPage.keyDetailsHeader.textContent;
    const keyBadge = await browserPage.keyDetailsBadge.textContent;
    const keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    const keyTTLValue = await browserPage.keyDetailsTTL.textContent;

    await t.expect(keyNameFromDetails).contains(keyName, 'The JSON Key Name is incorrect');
    await t.expect(keyDetails).contains('JSON', 'The JSON Key Type is incorrect');
    await t.expect(keyDetails).contains('TTL', 'The JSON TTL is incorrect');
    await t.expect(keyTTLValue).match(expectedTTL, 'The JSON Key TTL is incorrect');
    await t.expect(keyBadge).contains('JSON', 'The JSON Key Badge is incorrect');
});

test
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV7Config);
    })
    .after(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneV7Config.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneV7Config);
    })('Verify that user can set ttl for Hash fields', async t => {
        keyName = Common.generateWord(10);
        const keyName2 = Common.generateWord(10);
        const field1 = 'Field1WithTtl';
        const field2 = 'Field2WithTtl';
        await browserPage.addHashKey(keyName, ' ',  field1,  'value',  keyTTL);

        //verify that user can create key with ttl for the has field
        let ttlFieldValue = await browserPage.getHashTtlFieldInput(field1).textContent;
        await t.expect(ttlFieldValue).match(expectedTTL, 'the field ttl is not set');

        // verify that ttl can have empty value
        await browserPage.editHashFieldTtlValue(field1, ' ');
        ttlFieldValue = await browserPage.getHashTtlFieldInput(field1).textContentWithoutButtons;
        await t.expect(ttlFieldValue).eql('No Limit', 'the field ttl can not be removed');

        //verify that ttl field value can be set
        await browserPage.addFieldToHash(field2, 'value', keyTTL);
        ttlFieldValue = await browserPage.getHashTtlFieldInput(field2).textContent;
        await t.expect(ttlFieldValue).match(expectedTTL, 'the field ttl is not set');

        //verify that ttl column can be hidden
        await t.click(browserPage.showTtlCheckbox);
        await t.expect(await browserPage.getHashTtlFieldInput(field2).exists).notOk('the ttl column is not hidden');
        await t.click(browserPage.showTtlCheckbox);

        //verify that field is removed after ttl field is expired
        await browserPage.editHashFieldTtlValue(field1, '1');
        await t.wait(1000);
        await t.click(browserPage.refreshKeyButton);
        const result = browserPage.hashFieldsList.count;
        await t.expect(result).eql(1, 'the field was not removed');

        //verify that the key is removed if key has 1 field and ttl field is expired
        await browserPage.addHashKey(keyName2, ' ',  field1);
        await browserPage.editHashFieldTtlValue(field1, '1');
        await t.wait(1000);
        await t.click(browserPage.refreshKeysButton);

        await t.expect(browserPage.getKeySelectorByName(keyName2).exists).notOk('key is not removed when the field ttl is expired');
    });
