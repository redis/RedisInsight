import { AddElementInList, rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfigEmpty,
} from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { populateListWithElements } from '../../../../helpers/keys';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';
import { Telemetry } from '../../../../helpers/telemetry';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();
const telemetry = new Telemetry();

const dbParameters = { host: ossStandaloneConfigEmpty.host, port: ossStandaloneConfigEmpty.port };
const keyName = `TestListKey-${ Common.generateWord(10) }`;
const elementForSearch = `SearchField-${ Common.generateWord(5) }`;
const keyToAddParameters = { elementsCount: 500000, keyName, elementStartWith: 'listElement' };

const telemetryEvent = 'LIST_VIEW_OPENED';
const logger = telemetry.createLogger();

const expectedProperties = [
    'databaseId',
    'provider'
];

fixture `List Key verification`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfigEmpty);
        await apiKeyRequests.addListKeyApi({
            keyName,
            ttl: 2147476121,
            elements: ['testElement'],
        }, ossStandaloneConfigEmpty);
        await browserPage.navigateToKey(keyName);
    })
    .afterEach(async() => {
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfigEmpty.databaseName);
    });
test.requestHooks(logger)
  ('Verify that user can search per exact element index in List key in DB with 1 million of fields', async t => {
        // Add 1000000 elements to the list key
        await populateListWithElements(dbParameters.host, dbParameters.port, keyToAddParameters);
        await populateListWithElements(dbParameters.host, dbParameters.port, keyToAddParameters);

        // Verify that telemetry event 'TREE_VIEW_KEY_VALUE_VIEWED' sent
        await t.click(browserPage.browserViewButton);
        await telemetry.verifyEventHasProperties(telemetryEvent, expectedProperties, logger);

        // Add custom element to the list key
        await browserPage.openKeyDetails(keyName);
        await browserPage.addElementToList([elementForSearch]);
        // Search by element index
        await browserPage.searchByTheValueInKeyDetails('1000001');
        // Check the search result
        const result = await browserPage.listElementsList.nth(0).textContent;
        await t.expect(result).eql(elementForSearch, 'List element not found');
    });

test
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfigEmpty);
    })
    .after(async() => {
        await browserPage.Cli.sendCommandInCli('flushdb');
    })
    ('Verify that user can add a multiple fields', async t => {

        const tailKeyName  = 'tailListKey';
        const headKeyName = 'headKeyName';

        const elementsValue = [
            'element1',
            'element2',
            'element3',
            'element4'
        ]

        await browserPage.addListKey(tailKeyName, '2147476121', [elementsValue[0],elementsValue[1], elementsValue[2]]);
        await browserPage.openKeyDetails(tailKeyName);

        await t.expect(browserPage.listElementsList.nth(0).textContent).eql(elementsValue[0], 'the first element is not corrected for add in tail');
        let count = await browserPage.listElementsList.count;
        await t.expect(browserPage.listElementsList.nth(count - 1).textContent).eql(elementsValue[2], 'the last element is not corrected for add in tail');

        await browserPage.addListKey(headKeyName, '2147476121', [elementsValue[0],elementsValue[1], elementsValue[2]], AddElementInList.Head);
        await browserPage.openKeyDetails(headKeyName);

        await t.expect(browserPage.listElementsList.nth(0).textContent).eql(elementsValue[2], 'the first element is not corrected for add in tail');
        count = await browserPage.listElementsList.count;
        await t.expect(browserPage.listElementsList.nth(count - 1).textContent).eql(elementsValue[0], 'the last element is not corrected for add in tail');

    });
test('Verify that user can edit a multiple fields', async t => {
        const elementsValue = [
            'element1',
            'element2',
            'element3',
            'element4'
        ]
        await browserPage.openKeyDetails(keyName);

        await browserPage.addElementToList([elementsValue[0], elementsValue[1]]);
        await t.expect(browserPage.listElementsList.nth(0).textContent).eql('testElement', 'the first element is not corrected for add in tail');
        let count = await browserPage.listElementsList.count;
        await t.expect(browserPage.listElementsList.nth(count - 1).textContent).eql(elementsValue[1], 'the last element is not corrected for add in tail');

        await browserPage.addElementToList([elementsValue[2], elementsValue[3]], AddElementInList.Head);
        await t.expect(browserPage.listElementsList.nth(0).textContent).eql(elementsValue[3], 'the first element is not corrected for add in head');
        count = await browserPage.listElementsList.count;
        await t.expect(browserPage.listElementsList.nth(count - 1).textContent).eql(elementsValue[1], 'the last element is not corrected for add in head');
    });
test('Verify that user can hide fields', async t => {
    await t.expect(browserPage.getKeySize(keyName).exists).ok('size is not displayed')
    await t.expect(browserPage.getKeyTTl(keyName).exists).ok('ttl is not displayed')

    await t.click(browserPage.columnsBtn);
    await t.click(browserPage.showTtlColumnCheckbox);
    await t.click(browserPage.columnsBtn);
    await t.expect(browserPage.getKeySize(keyName).exists).ok('size is not displayed')
    await t.expect(browserPage.getKeyTTl(keyName).exists).notOk('ttl is displayed')

    await t.click(browserPage.columnsBtn);
    await t.click(browserPage.showSizeColumnCheckbox);
    await t.click(browserPage.columnsBtn);
    await t.expect(browserPage.getKeySize(keyName).exists).notOk('size is not displayed')
    await t.expect(browserPage.getKeyTTl(keyName).exists).notOk('ttl is displayed')

    await t.click(browserPage.columnsBtn);
    await t.click(browserPage.showSizeColumnCheckbox);
    await t.click(browserPage.showTtlColumnCheckbox);
    await t.click(browserPage.columnsBtn);
    await t.expect(browserPage.getKeySize(keyName).exists).ok('size is not displayed')
    await t.expect(browserPage.getKeyTTl(keyName).exists).ok('ttl is displayed')
});
