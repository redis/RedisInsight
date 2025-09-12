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

const field = Common.generateWord(20);
const value = Common.generateSentence(400);
const value1 = Common.generateWord(20);
const keyName = Common.generateWord(20);
const keyTTL = 2147476121;

fixture `Expand/Collapse large values in key details`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async t => {
        // Clear and delete database
        if (await browserPage.closeKeyButton.visible) {
            await t.click(browserPage.closeKeyButton);
        }
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can click on a row to expand it if any of its cells contains a value which is truncated.', async t => {
    const entryFieldLong = browserPage.streamEntryFields.nth(1).parent(1);
    const entryFieldSmall = browserPage.streamEntryFields.nth(0).parent(1);
    // Create stream key
    await browserPage.Cli.sendCommandsInCli([
        `XADD ${keyName} * '${field}' '${value}'`,
        `XADD ${keyName} * '${field}' '${value1}'`
    ]);
    // Open key details
    await browserPage.openKeyDetails(keyName);
    // Remember height of the cells
    const startLongCellHeight = await entryFieldLong.clientHeight;
    const startSmallCellHeight = await entryFieldSmall.clientHeight;
    await t.click(entryFieldSmall);
    // Verify that field with small text is not expanded
    await t.expect(entryFieldSmall.clientHeight).lt(startSmallCellHeight + 5, 'Row is expanded', { timeout: 5000 });
    // Verify that user can expand/collapse for stream data type
    await t.click(entryFieldLong);
    await t.expect(entryFieldLong.clientHeight).gt(startLongCellHeight + 130, 'Row is not expanded', { timeout: 5000 });
    // Verify that user can collapse the row by clicking anywhere on the expanded row
    await t.click(entryFieldLong);
    await t.expect(entryFieldLong.clientHeight).eql(startLongCellHeight, 'Row is not collapsed', { timeout: 5000 });
});
test('Verify that user can expand/collapse for hash data type', async t => {
    const fieldValueCell = browserPage.hashFieldValue.parent(2);
    // Create hash key
    await apiKeyRequests.addHashKeyApi({
        keyName,
        ttl: keyTTL,
        fields: [{
            field,
            value,
        }]
    }, ossStandaloneConfig)
    await browserPage.navigateToKey(keyName);
    // Remember height of the cell with long value
    const startCellHeight = await fieldValueCell.clientHeight;
    // Verify that user can expand a row of hash data type
    await t.click(fieldValueCell);
    await t.expect(fieldValueCell.clientHeight).gt(startCellHeight + 130, 'Row is not expanded', { timeout: 5000 });
    // Verify that user can collapse a row of hash data type
    await t.click(fieldValueCell);
    await t.expect(fieldValueCell.clientHeight).eql(startCellHeight, 'Row is not collapsed', { timeout: 5000 });
});
test('Verify that user can expand/collapse for set data type', async t => {
    const memberValueCell = browserPage.setMembersList.parent(2);
    // Create set key
    await apiKeyRequests.addSetKeyApi({
        keyName,
        ttl: keyTTL,
        members: [value]
    }, ossStandaloneConfig)
    await browserPage.navigateToKey(keyName);
    // Remember height of the cell with long value
    const startLongCellHeight = await memberValueCell.clientHeight;
    // Verify that user can expand a row of set data type
    await t.click(memberValueCell);
    await t.expect(memberValueCell.clientHeight).gt(startLongCellHeight + 130, 'Row is not expanded', { timeout: 5000 });
    // Verify that user can collapse a row of set data type
    await t.click(memberValueCell);
    await t.expect(memberValueCell.clientHeight).eql(startLongCellHeight, 'Row is not collapsed', { timeout: 5000 });
});
test('Verify that user can expand/collapse for sorted set data type', async t => {
    const memberValueCell = browserPage.zsetMembersList.parent(1);
    // Create zset key
    await apiKeyRequests.addSortedSetKeyApi({
        keyName,
        ttl: keyTTL,
        members: [{
            name: value,
            score: 0,
        }]
    }, ossStandaloneConfig)
    await browserPage.navigateToKey(keyName);
    // Remember height of the cell with long value
    const startLongCellHeight = await memberValueCell.clientHeight;
    // Verify that user can expand a row of sorted set data type
    await t.click(memberValueCell);
    await t.expect(memberValueCell.clientHeight).gt(startLongCellHeight + 130, 'Row is not expanded', { timeout: 5000 });
    // Verify that user can collapse a row of sorted set data type
    await t.click(memberValueCell);
    await t.expect(memberValueCell.clientHeight).eql(startLongCellHeight, 'Row is not collapsed', { timeout: 5000 });
});
test('Verify that user can expand/collapse for list data type', async t => {
    const elementValueCell = browserPage.listElementsList.parent(2);
    // Create list key
    await apiKeyRequests.addListKeyApi({
        keyName,
        ttl: keyTTL,
        elements: [value]
    }, ossStandaloneConfig)
    await browserPage.navigateToKey(keyName);
    // Remember height of the cell with long value
    const startLongCellHeight = await elementValueCell.clientHeight;
    // Verify that user can expand a row of list data type
    await t.click(elementValueCell);
    await t.expect(elementValueCell.clientHeight).gt(startLongCellHeight + 130, 'Row is not expanded', { timeout: 5000 });
    // Verify that user can collapse a row of list data type
    await t.click(elementValueCell);
    await t.expect(elementValueCell.clientHeight).eql(startLongCellHeight, 'Row is not collapsed', { timeout: 5000 });
});
test('Verify that user can work in full mode with expanded/collapsed value', async t => {
    const elementValueCell = browserPage.listElementsList.parent(2);
    // Create list key
    await apiKeyRequests.addListKeyApi({
        keyName,
        ttl: keyTTL,
        elements: [value]
    }, ossStandaloneConfig)
    await browserPage.navigateToKey(keyName);
    // Open full mode for key details
    await t.click(browserPage.fullScreenModeButton);
    // Remember height of the cell with long value
    const startLongCellHeight = await elementValueCell.clientHeight;
    // Verify that user can expand a row in full mode
    await t.click(elementValueCell);
    await t.expect(elementValueCell.clientHeight).gt(startLongCellHeight + 60, 'Row is not expanded', { timeout: 5000 });
    // Verify that user can collapse a row in full mode
    await t.click(elementValueCell);
    await t.expect(elementValueCell.clientHeight).eql(startLongCellHeight, 'Row is not collapsed', { timeout: 5000 });
});
