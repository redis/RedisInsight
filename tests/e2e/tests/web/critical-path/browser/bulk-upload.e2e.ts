import * as path from 'path';
import { t } from 'testcafe';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { deleteAllKeysFromDB, verifyKeysDisplayingInTheList } from '../../../../helpers/keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const dbParameters = { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port };
const filesToUpload = ['bulkUplAllKeyTypes.txt', 'bigKeysData.rtf'];
const filePathes = {
    allKeysFile: path.join('..', '..', '..', '..', 'test-data', 'bulk-upload', filesToUpload[0]),
    bigDataFile: path.join('..', '..', '..', '..', 'test-data', 'bulk-upload', filesToUpload[1])
};
const keyNames = ['hashkey1', 'listkey1', 'setkey1', 'zsetkey1', 'stringkey1', 'jsonkey1', 'streamkey1', 'graphkey1', 'tskey1'];
const verifyCompletedResultText = async(resultsText: string[]): Promise<void> => {
    for (const result of resultsText) {
        await t.expect(browserPage.BulkActions.bulkUploadCompletedSummary.textContent).contains(result, 'Bulk upload completed summary not correct');
    }
    await t.expect(browserPage.BulkActions.bulkUploadCompletedSummary.textContent).notContains('0:00:00.000', 'Bulk upload Time taken not correct');
};

fixture.skip(`Bulk Upload`)
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Clear and delete database
        await deleteAllKeysFromDB(dbParameters.host, dbParameters.port);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify bulk upload of different text docs formats', async t => {
    // Verify bulk upload for docker app version
    const allKeysResults = ['9Commands Processed', '9Success', '0Errors'];
    const bigKeysResults = ['10 000Commands Processed', '10 000Success', '0Errors'];
    const defaultText = 'Select or drag and drop a file';

    // Open bulk actions
    await t.click(browserPage.bulkActionsButton);
    // Open bulk upload tab
    await t.click(browserPage.BulkActions.bulkUpdateTab);
    // Verify that Upload button disabled by default
    await t.expect(browserPage.BulkActions.actionButton.hasAttribute('disabled')).ok('Upload button enabled without added file');

    // Verify that keys of all types can be uploaded
    await browserPage.BulkActions.uploadFileInBulk(filePathes.allKeysFile);
    await verifyCompletedResultText(allKeysResults);
    await browserPage.searchByKeyName('*key1');
    await verifyKeysDisplayingInTheList(keyNames, true);

    // Verify that Upload button disabled after starting new upload
    await t.click(browserPage.BulkActions.bulkActionStartNewButton);
    await t.expect(browserPage.BulkActions.actionButton.hasAttribute('disabled')).ok('Upload button enabled without added file');

    // Verify that user can remove uploaded file
    await t.setFilesToUpload(browserPage.BulkActions.bulkUploadInput, [filePathes.bigDataFile]);

    await t.expect(browserPage.BulkActions.bulkUploadContainer.textContent).contains(filesToUpload[1], 'Filename not displayed in upload input');
    await t.click(browserPage.BulkActions.removeFileBtn);
    await t.expect(browserPage.BulkActions.bulkUploadContainer.textContent).contains(defaultText, 'File not removed from upload input');

    // Verify that user can upload 10000 keys
    await browserPage.BulkActions.uploadFileInBulk(filePathes.bigDataFile);
    await verifyCompletedResultText(bigKeysResults);
});
