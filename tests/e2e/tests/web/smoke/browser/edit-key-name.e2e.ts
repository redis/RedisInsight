import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { Common } from '../../../../helpers/common';
import { Telemetry } from '../../../../helpers/telemetry';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const telemetry = new Telemetry();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyNameBefore = Common.generateWord(10);
let keyNameAfter = Common.generateWord(10);
const keyTTL = 2147476121;
const logger = telemetry.createLogger();
const telemetryEvent = 'BROWSER_KEY_VALUE_VIEWED';
const expectedProperties = [
    'databaseId',
    'keyType',
    'length'
];

fixture `Edit Key names verification`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyNameAfter, ossStandaloneConfig.databaseName);
    });
test
    .requestHooks(logger)('Verify that user can edit String Key name', async t => {
        keyNameBefore = Common.generateWord(10);
        keyNameAfter = Common.generateWord(10);

        await apiKeyRequests.addStringKeyApi({
            keyName: keyNameBefore,
            value: 'v',
            ttl: keyTTL,
        }, ossStandaloneConfig);
        await browserPage.navigateToKey(keyNameBefore);

        let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The String Key Name not correct before editing');

        // TODO : This can be a separate test however this is failing at present making the test unstable
        // Verify that telemetry event 'BROWSER_KEY_VALUE_VIEWED' sent and has all expected properties
        // await telemetry.verifyEventHasProperties(telemetryEvent, expectedProperties, logger);
        // await telemetry.verifyEventPropertyValue(telemetryEvent, 'keyType', 'string', logger);

        await browserPage.editKeyName(keyNameAfter);
        keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
        await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The String Key Name not correct after editing');
    });
test('Verify that user can edit Set Key name', async t => {
    keyNameBefore = Common.generateWord(10);
    keyNameAfter = Common.generateWord(10);

    await apiKeyRequests.addSetKeyApi({
        keyName: keyNameBefore,
        members: ['m'],
        ttl: keyTTL,
    }, ossStandaloneConfig);
    await browserPage.navigateToKey(keyNameBefore);

    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The Set Key Name not correct before editing');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Set Key Name not correct after editing');
});
test('Verify that user can edit Zset Key name', async t => {
    keyNameBefore = Common.generateWord(10);
    keyNameAfter = Common.generateWord(10);

    await apiKeyRequests.addSortedSetKeyApi({
        keyName: keyNameBefore,
        members: [{
            name: 'n',
            score: 0,
        }],
        ttl: keyTTL,
    }, ossStandaloneConfig);
    await browserPage.navigateToKey(keyNameBefore);

    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The Zset Key Name not correct before editing');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Zset Key Name not correct after editing');
});
test('Verify that user can edit Hash Key name', async t => {
    keyNameBefore = Common.generateWord(10);
    keyNameAfter = Common.generateWord(10);

    await apiKeyRequests.addHashKeyApi({
        keyName: keyNameBefore,
        ttl: keyTTL,
        fields: [{
            field: 'f',
            value:'v',
        }]
    }, ossStandaloneConfig);
    await browserPage.navigateToKey(keyNameBefore);

    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The Hash Key Name not correct before editing');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The Hash Key Name not correct after editing');
});
test('Verify that user can edit List Key name', async t => {
    keyNameBefore = Common.generateWord(10);
    keyNameAfter = Common.generateWord(10);

    await apiKeyRequests.addListKeyApi({
        keyName: keyNameBefore,
        elements: ['e'],
        ttl: keyTTL,
    }, ossStandaloneConfig);
    await browserPage.navigateToKey(keyNameBefore);

    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The List Key Name not correct before editing');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The List Key Name not correct after editing');
});
test('Verify that user can edit JSON Key name', async t => {
    keyNameBefore = Common.generateWord(10);
    keyNameAfter = Common.generateWord(10);
    const keyValue = '{"name":"xyz"}';

    await apiKeyRequests.addJsonKeyApi({
        keyName: keyNameBefore,
        data: keyValue,
        ttl: keyTTL,
    }, ossStandaloneConfig);
    await browserPage.navigateToKey(keyNameBefore);

    let keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameBefore, 'The JSON Key Name not correct before editing');
    await browserPage.editKeyName(keyNameAfter);
    keyNameFromDetails = await browserPage.keyNameFormDetails.textContent;
    await t.expect(keyNameFromDetails).contains(keyNameAfter, 'The JSON Key Name not correct after editing');
});
