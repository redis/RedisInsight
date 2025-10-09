import { KeyTypesTexts, rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import { deleteAllKeysFromDB } from '../../../../helpers/keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const keyNames = [Common.generateWord(20), Common.generateWord(20)];
const dbParameters = { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port };

fixture `Bulk Delete`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        await browserPage.addHashKey(keyNames[0], '100000', Common.generateWord(20), Common.generateWord(20));
        await browserPage.addSetKey(keyNames[1], '100000', Common.generateWord(20));
        if (await browserPage.Toast.toastCloseButton.exists) {
            await t.click(browserPage.Toast.toastCloseButton);
        }
    })
    .afterEach(async() => {
        // Clear and delete database
        await deleteAllKeysFromDB(dbParameters.host, dbParameters.port);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that when bulk deletion is completed, status Action completed is displayed', async t => {
    // Filter by Hash keys
    await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
    await t.click(browserPage.bulkActionsButton);
    await browserPage.BulkActions.startBulkDelete();
    await t.expect(browserPage.BulkActions.bulkStatusCompleted.exists).ok('Bulk deletion not completed', { timeout: 15000 });
    await t.expect(browserPage.BulkActions.bulkStatusCompleted.textContent).eql('Action completed', 'Action completed text is not visible');
    // Verify that when bulk deletion is completed, button Delete changes to Start New
    await t.expect(browserPage.BulkActions.bulkStartAgainButton.exists).ok('"Start New" button not displayed');
    // Verify that user can click on Start New and existed filter will be applied
    await t.click(browserPage.BulkActions.bulkStartAgainButton);
    await t.expect(browserPage.BulkActions.bulkDeleteSummary.innerText).contains('Scanned 100% (2/2) and found 1 keys', 'Bulk delete summary is not correct');
});
