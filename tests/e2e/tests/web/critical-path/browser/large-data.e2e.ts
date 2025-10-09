import * as fs from 'fs';
import { join as joinPath } from 'path';
import { DatabaseHelper } from '../../../../helpers/database';
import { Common } from '../../../../helpers/common';
import { rte } from '../../../../helpers/constants';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, fileDownloadPath, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';
import { StringKeyParameters } from '../../../../pageObjects/browser-page';
import { DatabasesActions } from '../../../../common-actions/databases-actions';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();
const databasesActions = new DatabasesActions();

let keyName = Common.generateWord(10);
let bigKeyName = Common.generateWord(10);
let foundStringDownloadedFiles = 0;
const downloadedFile = 'string_value';

fixture `Cases with large data`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can see relevant information about key size', async t => {
    keyName = Common.generateWord(10);
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Create new key with a lot of members
    const length = 500;
    const arr = await Common.createArrayWithKeyValue(length);
    await t.typeText(browserPage.Cli.cliCommandInput, `HSET ${keyName} ${arr.join(' ')}`, { paste: true });
    await t.pressKey('enter');
    await t.click(browserPage.Cli.cliCollapseButton);
    await browserPage.openKeyDetails(keyName);
    // Remember the values of the key size and length
    const keySizeText = await browserPage.keySizeDetails.textContent;
    const keyLength = await browserPage.keyLengthDetails.textContent;
    const sizeArray = keySizeText.split(' ');
    const keySize = sizeArray[sizeArray.length - 2];
    // Verify that user can see relevant information about key length
    await t.expect(keyLength).eql(`Length: ${length}`, 'Key length not correct');
    // Verify that user can see relevant information about key size
    await t.expect(keySizeText).contains('KB', 'Key measure not correct');
    await t.expect(+keySize).gt(10, 'Key size value not correct');
});
test
    .after(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await apiKeyRequests.deleteKeyByNameApi(bigKeyName, ossStandaloneConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
        // Delete downloaded file
        const foundDownloadedFiles = await databasesActions.findFilesByFileStarts(fileDownloadPath, downloadedFile);
        fs.unlinkSync(joinPath(fileDownloadPath, foundDownloadedFiles[0]));
    })('Verify that user can download String key value as txt file when it has > 5000 characters', async t => {
        const disabledEditTooltip = 'Load the entire value to edit it';
        const disabledFormattersTooltip = 'Load the entire value to select a format';
        keyName = Common.generateWord(10);
        bigKeyName = Common.generateWord(10);
        // Create string key with 5000 characters
        const length = 5000;
        const keyValue = Common.generateWord(length);
        const stringKeyParameters: StringKeyParameters = {
            keyName: keyName,
            value: keyValue
        };
        const bigStringKeyParameters: StringKeyParameters = {
            keyName: bigKeyName,
            value: keyValue + 1
        };

        await apiKeyRequests.addStringKeyApi(stringKeyParameters, ossStandaloneConfig);
        await apiKeyRequests.addStringKeyApi(bigStringKeyParameters, ossStandaloneConfig);
        await browserPage.reloadPage();
        await browserPage.openKeyDetails(keyName);
        await t.expect(browserPage.loadAllBtn.exists).notOk('Load All button displayed for 5000 length String key');
        await t.expect(browserPage.downloadAllValueBtn.exists).notOk('Download All button displayed for 5000 length String key');

        await browserPage.openKeyDetails(bigKeyName);
        await t.expect(browserPage.editKeyValueButton.hasAttribute('disabled')).ok('Edit button not disabled for String > 5000');
        await t.expect(browserPage.formatSwitcher.hasAttribute('disabled')).ok('Formatters control not disabled for String > 5000');

        // Verify that user can see "Load the entire value to edit it." tooltip when hovering on disabled edit button before loading all
        await t.hover(browserPage.editKeyValueButton.parent());
        await t.expect(browserPage.tooltip.textContent).eql(disabledEditTooltip, 'Edit button tooltip contains invalid message');

        // Verify that user can see "Load the entire value to select a format." tooltip when hovering on disabled formatters button before loading all
        await t.hover(browserPage.formatSwitcher.child('span'));
        await t.expect(browserPage.tooltip.textContent).eql(disabledFormattersTooltip, 'Formatter button tooltip contains invalid message');

        // Verify that user can see String key value with only 5000 characters uploaded if length is more than 5000
        // Verify that 3 dots after truncated big strings displayed
        await t.expect((await browserPage.stringKeyValueInput.textContent).length).eql(stringKeyParameters.value.length + 3, 'String key > 5000 value is fully loaded by default');

        await t.click(browserPage.loadAllBtn);
        // Verify that user can see "Load all" button for String Key with more than 5000 characters and see full value by clicking on it
        await t.expect((await browserPage.stringKeyValueInput.textContent).length).eql(bigStringKeyParameters.value.length, 'String key > 5000 value is not fully loaded after clicking Load All');
        await t.expect(browserPage.editKeyValueButton.hasAttribute('disabled')).notOk('Edit button disabled for String > 5000 which is fully loaded');
        await t.expect(browserPage.formatSwitcher.hasAttribute('disabled')).notOk('Formatters control disabled for String > 5000 which is fully loaded');

        // Verify that user can see not fully loaded String key with > 5000 characters after clicking on Refresh button
        await t.click(browserPage.refreshKeyButton);
        await t.expect(browserPage.loadAllBtn.exists).ok('Load All button not displayed for 5000 length String key after Refresh');

        // Verify that user can download String key value as txt file when it has > 5000 characters
        await t.click(browserPage.downloadAllValueBtn);
        // Verify that user can see default file name is “string_value” when downloading String key value
        foundStringDownloadedFiles = await databasesActions.getFileCount(fileDownloadPath, downloadedFile);
        await t.expect(foundStringDownloadedFiles).gt(0, 'String value file not saved');
    });
