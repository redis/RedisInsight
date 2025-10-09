import { rte } from '../../../../helpers/constants';
import { Common, DatabaseHelper } from '../../../../helpers';
import { BrowserPage } from '../../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';
const apiKeyRequests = new APIKeyRequests();


const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const keyName = `TestHashKey-${ Common.generateWord(10) }`;

fixture `Formatters`
    .meta({
        type: 'regression',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);

    })
    .afterEach(async() => {
        // Clear keys and database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    });

test('Verify that UTF8 in PHP serialized', async t => {
    const phpValueChinese = '测试';
    const phpValueCRussian = 'Привет мир!';
    const setValue =`SET ${keyName} "a:3:{s:4:\\"name\\";s:6:\\"${phpValueChinese}\\";s:3:\\"age\\";i:30;s:7:\\"message\\";s:20:\\"${phpValueCRussian}\\";}"\n`;

    await browserPage.Cli.sendCommandInCli(setValue);
    await t.click(browserPage.refreshKeysButton);

    await browserPage.openKeyDetailsByKeyName(keyName);
    await browserPage.selectFormatter('PHP serialized');
    await t.expect(await browserPage.getStringKeyValue()).contains(phpValueChinese, 'data is not serialized in php');
    await t.expect(await browserPage.getStringKeyValue()).contains(phpValueCRussian, 'data is not serialized in php');
});

test
    .skip('Verify that dataTime is displayed in Java serialized', async t => {
    const hexValue ='ACED00057372000E6A6176612E7574696C2E44617465686A81014B59741903000078707708000000BEACD0567278';
    const javaTimeValue = '"1995-12-14T12:12:01.010Z"'

    await browserPage.addHashKey(keyName);
    // Add valid value in HEX format for convertion
    await browserPage.selectFormatter('HEX');
    await browserPage.editHashKeyValue(hexValue);
    await browserPage.selectFormatter('Java serialized');
    await t.expect(browserPage.hashFieldValue.innerText).eql(javaTimeValue, 'data is not serialized in java');
});
