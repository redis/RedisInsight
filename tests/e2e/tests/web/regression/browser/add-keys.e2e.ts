import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneBigConfig, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import { BrowserActions } from '../../../../common-actions/browser-actions';
import path from 'path';

const browserPage = new BrowserPage();
const browserActions = new BrowserActions();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const jsonFilePath = path.join('..', '..', '..', '..', 'test-data', 'big-json', 'json-BigInt.json');

const jsonKeys = [['JSON-string', '"test"'], ['JSON-number', '782364'], ['JSON-boolean', 'true'], ['JSON-null', 'null'], ['JSON-array', '[1, 2, 3]']];
let keyNames: string[];
let indexName: string;

fixture `Add keys`
    .meta({
        type: 'regression',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        let commandString = 'DEL';
        for (const key of jsonKeys) {
            commandString = commandString.concat(` ${key[0]}`);
        }
        await browserPage.Cli.sendCommandInCli(commandString);
    });
test('Verify that user can create different types(string, number, null, array, boolean) of JSON', async t => {
    for (let i = 0; i < jsonKeys.length; i++) {
        const keySelector = browserPage.getKeySelectorByName(jsonKeys[i][0]);
        await browserPage.addJsonKey(jsonKeys[i][0], jsonKeys[i][1]);
        await t.hover(browserPage.Toast.toastCloseButton);
        await t.click(browserPage.Toast.toastCloseButton);
        await t.click(browserPage.refreshKeysButton);
        await t.expect(keySelector.exists).ok(`${jsonKeys[i][0]} key not displayed`);
        // Add additional check for array elements
        if (jsonKeys[i][0].includes('array')) {
            for (const j of JSON.parse(jsonKeys[i][1])) {
                await t.expect(browserPage.jsonScalarValue.withText(j.toString()).exists).ok('JSON value not correct');
            }
        }
        else {
            await t.expect(browserPage.jsonKeyValue.withText(jsonKeys[i][1]).exists).ok('JSON value not correct');
        }
    }
});
// https://redislabs.atlassian.net/browse/RI-3995
test
    .before(async(t) => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
        // Force switch to list view
        await t.click(browserPage.browserViewButton);
    })
    .after(async() => {
        let commandString = 'DEL';
        for (const key of keyNames) {
            commandString = commandString.concat(` ${key}`);
        }
        const commands = [`FT.DROPINDEX ${indexName}`, commandString];
        await browserPage.Cli.sendCommandsInCli(commands);
    })('Verify that the new key is displayed at the top of the list', async t => {
        const keyName = Common.generateWord(12);
        const keyName1 = Common.generateWord(12);
        const keyName2 = Common.generateWord(36);
        const keyName3 = Common.generateWord(10);
        const keyName4 = `${Common.generateWord(10)}-test`;
        const keyName5 = `hash-${Common.generateWord(12)}`;
        keyNames = [keyName, keyName1, keyName2, keyName3, keyName4, keyName5];
        indexName = `idx:${keyName5}`;
        const command = `FT.CREATE ${indexName} ON HASH PREFIX 1 hash- SCHEMA name TEXT`;
        await browserPage.Cli.sendCommandInCli(command);

        await browserPage.addStringKey(keyName);
        await browserActions.verifyKeyDisplayedTopAndOpened(keyName);
        // Verify displaying added multiple keys
        await browserPage.addSetKey(keyName1);
        await browserActions.verifyKeyDisplayedTopAndOpened(keyName1);

        await browserPage.addHashKey(keyName2);
        await browserActions.verifyKeyDisplayedTopAndOpened(keyName2);
        // Verify that user can see the key removed from the top when refresh List view
        await t.click(browserPage.refreshKeysButton);
        await browserActions.verifyKeyIsNotDisplayedTop(keyName1);
        // Verify that the new key is not displayed at the top when filter per key name applied
        await browserPage.searchByKeyName('*test');
        await browserPage.addHashKey(keyName4);
        await browserActions.verifyKeyIsNotDisplayedTop(keyName4);

        await t.click(browserPage.clearFilterButton);
        await t.click(browserPage.treeViewButton);
        await browserPage.addHashKey(keyName3);
        // Verify that user can see Tree view recalculated when new key is added in Tree view
        await browserActions.verifyKeyIsNotDisplayedTop(keyName3);
        await t.expect(browserPage.keyNameFormDetails.withExactText(keyName3).exists).ok(`Key ${keyName3} details not opened`);

        await t.click(browserPage.redisearchModeBtn);
        await browserPage.selectIndexByName(indexName);
        await browserPage.addHashKey(keyName5, '100000', 'name', 'value');
        // Verify that the new key is not displayed at the top for the Search capability
        await browserActions.verifyKeyIsNotDisplayedTop(keyName3);
    });
test('Verify that user can add json with BigInt', async t => {
    const keyName = Common.generateWord(12);

    // Add Json key with json object
    await t.click(browserPage.plusAddKeyButton);
    await t.click(browserPage.keyTypeDropDown);
    await t.click(browserPage.jsonOption);
    await t.click(browserPage.addKeyNameInput);
    await t.typeText(browserPage.addKeyNameInput, keyName, { replace: true, paste: true });
    await t.setFilesToUpload(browserPage.jsonUploadInput, [jsonFilePath]);
    await t.click(browserPage.addKeyButton);

    await t.click(browserPage.editJsonObjectButton);
    await t.expect(await browserPage.jsonValueInput.textContent).contains('message', 'edit value is empty');
    await t.click(browserPage.cancelEditButton);

    await t.click(browserPage.expandJsonObject);
    await t.click(browserPage.expandJsonObject);
    await t.expect(await browserPage.jsonKeyValue.textContent).contains('1.2345678998765432e+24', 'BigInt is not displayed');
    await t.expect(await browserPage.jsonKeyValue.textContent).contains('123456789987654321', 'BigInt is not displayed');

    await browserPage.addJsonKeyOnTheSameLevel('"key2"', '7777777777888889455');
    await t.expect(await browserPage.jsonKeyValue.textContent).contains('7777777777888889455', 'BigInt is not displayed');

    await t.click(browserPage.editJsonObjectButton.nth(3));
    await t.typeText(browserPage.jsonValueInput, '121212121111112121212111', { paste: true, replace: true });
    await t.click(browserPage.applyEditButton);
    await t.expect(await browserPage.jsonKeyValue.textContent).contains('1.2121212111111212e+23', 'BigInt is not displayed');
});
