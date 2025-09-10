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

let keyName = Common.generateWord(10);

fixture `Last refresh`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });
test('Verify that user can see my timer updated when I refresh the list of Keys of the list of values', async t => {
    keyName = Common.generateWord(10);
    // Hover on the refresh icon
    await t.hover(browserPage.refreshKeysButton);
    // Verify that user can see the date and time of the last update of my Keys in the tooltip
    await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\nnow', 'tooltip text not correct');

    // Add key
    await browserPage.addStringKey(keyName);
    await browserPage.openKeyDetails(keyName);
    // Wait for 1 min
    await t.wait(60000);
    // Hover on the refresh icon
    await t.hover(browserPage.refreshKeyButton);
    await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\n1 min', 'tooltip text not correct');
    // Click on Refresh and check last refresh
    await t.click(browserPage.refreshKeyButton);
    await t.hover(browserPage.keyDetailsHeader);
    await t.hover(browserPage.refreshKeyButton);
    // Verify that user can see the date and time of the last update of my Key values in the tooltip
    // Verify that user can see my last refresh updated each time I hover over the Refresh icon
    await t.expect(browserPage.tooltip.innerText).contains('Last Refresh\nnow', 'tooltip text not correct');
});
