import * as path from 'path';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const filePath = path.join('..', '..', '..', '..', 'test-data', 'upload-json', 'sample.json');
const jsonValues = ['Live JSON generator', '3.1', '"2014-06-25T00:00:00.000Z"', 'true'];
const keyName = Common.generateWord(10);

fixture `Upload json file`
    .meta({
        type: 'regression',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        await browserPage.Cli.sendCommandInCli(`DEL ${keyName}`);
    });
// https://redislabs.atlassian.net/browse/RI-4061
test('Verify that user can insert a JSON from .json file on the form to add a JSON key', async t => {
    await t.click(browserPage.plusAddKeyButton);
    await t.click(browserPage.keyTypeDropDown);
    await t.click(browserPage.jsonOption);
    await t.click(browserPage.addKeyNameInput);
    await t.typeText(browserPage.addKeyNameInput, keyName, { replace: true, paste: true });
    await t.setFilesToUpload(browserPage.jsonUploadInput, [filePath]);
    await t.click(browserPage.addKeyButton);
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Key has been added', 'The key added notification not found');
    // Verify that user can see the JSON value populated from the file when the insert is successful.
    for (const el of jsonValues) {
        await t.expect(browserPage.jsonScalarValue.withText(el).exists).ok(`${el} is not visible, JSON value not correct`);
    }
});
