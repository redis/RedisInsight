import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import { commonUrl, ossStandaloneConfig, ossStandaloneConfigEmpty } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

const keyName = Common.generateWord(20);
const keyValue = Common.generateWord(20);

fixture `Full Screen`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        await browserPage.Cli.sendCommandInCli('flushdb');
        await browserPage.reloadPage();
    })
    .afterEach(async() => {
        await browserPage.Cli.sendCommandInCli('flushdb');
    });
test
    .after(async() => {
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    })('Verify that user can switch to full screen from key details in Browser', async t => {
        await apiKeyRequests.addStringKeyApi({
            keyName,
            value: keyValue,
        }, ossStandaloneConfig);
        await browserPage.navigateToKey(keyName);

        // Save tables size before switching to full screen mode
        const widthBeforeFullScreen = await browserPage.keyDetailsHeader.clientWidth;
        // Switch to full screen mode
        await t.click(browserPage.fullScreenModeButton);
        // Compare size of details table after switching
        const widthAfterFullScreen = await browserPage.keyDetailsHeader.clientWidth;
        await t.expect(widthAfterFullScreen).gt(widthBeforeFullScreen, 'Width after switching to full screen not greater then before');
        await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).exists).ok('Key Details Table not displayed');
        await t.expect(browserPage.stringKeyValueInput.withExactText(keyValue).exists).ok('Key Value in Details not displayed');
        // Verify that user can exit full screen in key details and two tables with keys and key details are displayed
        await t.click(browserPage.fullScreenModeButton);
        const widthAfterExitFullScreen = await browserPage.keyDetailsHeader.clientWidth;
        await t.expect(widthAfterExitFullScreen).lt(widthAfterFullScreen, 'Width after switching from full screen not less then before');
    });
test('Verify that when no keys are selected user can click on "Close" control for right table and see key list in full screen', async t => {
    // Verify that user sees two panels(key list and empty details panel) opening Browser page for the first time
    await t.expect(browserPage.noKeysToDisplayText.visible).ok('No keys selected panel not displayed');
    // Save key table size before switching to full screen
    const widthKeysBeforeFullScreen = await browserPage.keyListTable.clientWidth;
    // Close right panel with key details
    await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).exists).notOk('Key Details Table not displayed');
    await t.click(browserPage.closeRightPanel);
    // Check that table is in full screen
    const widthTableAfterFullScreen = await browserPage.keyListTable.clientWidth;
    await t.expect(widthTableAfterFullScreen).gt(widthKeysBeforeFullScreen, 'Width after switching to full screen not greater then before');
});
test('Verify that when user closes key details in full screen mode the list of keys displayed in full screen', async t => {
    await apiKeyRequests.addSetKeyApi({
        keyName,
        members: [keyValue],
    }, ossStandaloneConfig);
    await browserPage.navigateToKey(keyName);

    // Save keys table size before switching to full screen
    const widthKeysBeforeFullScreen = await browserPage.keyListTable.clientWidth;
    // Open full mode for key details
    await t.click(browserPage.fullScreenModeButton);
    // Close key details
    await t.click(browserPage.closeKeyButton);
    // Check that key list is opened in full screen
    const widthTableAfterFullScreen = await browserPage.keyListTable.clientWidth;
    await t.expect(widthTableAfterFullScreen).gt(widthKeysBeforeFullScreen, 'Width after switching to full screen not greater then before');
    // Verify that when user selects the key while key list is in full screen, key details is opened on the right side panel
    const widthKeysBeforeExitFullScreen = await browserPage.keyListTable.clientWidth;
    await browserPage.openKeyDetails(keyName);
    const widthKeysAfterExitFullScreen = await browserPage.keyListTable.clientWidth;
    await t.expect(widthKeysAfterExitFullScreen).lt(widthKeysBeforeExitFullScreen, 'Width after switching from full screen not less then before');
    await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).exists).ok('Key details not opened');
});
test('Verify that when users close key details not in full mode, they can see full key list screen', async t => {
    await apiKeyRequests.addHashKeyApi({
        keyName,
        ttl: 58965422,
        fields: [{
            field: 'field',
            value: 'value',
        }]
    }, ossStandaloneConfig);
    await browserPage.navigateToKey(keyName);

    // Save key list table size before switching to full screen
    const widthKeysBeforeFullScreen = await browserPage.keyListTable.clientWidth;
    // Close key details
    await t.click(browserPage.closeKeyButton);
    // Check that key list is opened in full screen
    const widthTableAfterFullScreen = await browserPage.keyListTable.clientWidth;
    await t.expect(widthTableAfterFullScreen).gt(widthKeysBeforeFullScreen, 'Width after switching to full screen not greater then before');
    // Verify that user can not see key details
    await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).visible).notOk('Key details not opened');
});
