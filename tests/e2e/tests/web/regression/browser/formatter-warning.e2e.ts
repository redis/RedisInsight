import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const jsonInvalidStructure = '"{\"test\": 123"';
const title = 'Value will be saved as Unicode';
const reason = 'as it is not valid in the selected format.';
let keyName = Common.generateWord(10);

fixture `Warning for invalid formatter value`
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
        await browserPage.Cli.sendCommandInCli(`del ${keyName}`);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
// todo: enable after fix RI-7461
test.skip('Verify that user can see warning message when editing value', async t => {
    // Open key details
    await browserPage.addStringKey(keyName, '{"test": 123}');
    await browserPage.selectFormatter('JSON');
    await browserPage.editStringKeyValue(jsonInvalidStructure);
    await t
        // Verify that user sees warning message when value in selected format is not correct
        .expect(browserPage.changeValueWarning.visible).ok('Warning is not displayed')
        // Verify that tooltip has text "Value will be saved as Unicode as it is not valid in the selected format."
        .expect(browserPage.changeValueWarning.find('h4').withExactText(title).visible).ok('Title is not correct')
        .expect(browserPage.changeValueWarning.find('p').withExactText(reason).visible).ok('Reason is not correct');
    await t.click(browserPage.saveButton);
    // Verify that when user click on save button, value is saved in Unicode format
    await t.expect(browserPage.stringValueAsJson.exists).notOk('Value is not converted to Unicode');
    // Verify that user doesn't see warning message if saving value is correct in selected format
    await browserPage.editStringKeyValue('{"test": 123}');
    await t
        .expect(browserPage.changeValueWarning.visible).notOk('Warning is not displayed')
        .expect(browserPage.stringValueAsJson.exists).ok('Value is not converted to JSON object');
});
test('Verify that user can remove invalid format value warning the message by clicking on ESC button', async t => {
    keyName = Common.generateWord(10);
    const keyValue = 'a:1:{s:8:"glossary";a:2:{s:5:"title";s:7:"example";s:8:"GlossDiv";a:2:{s:5:"title";s:1:"S";s:9:"GlossList";a:1:{s:10:"GlossEntry";a:3:{s:2:"ID";s:4:"SGML";s:8:"GlossDef";a:2:{s:4:"para";s:8:"language";s:12:"GlossSeeAlso";a:1:{i:0;s:3:"XML";}}s:8:"GlossSee";s:6:"markup";}}}}}';
    await browserPage.addHashKey(keyName, '5000', 'PHP Serialized', keyValue);
    await browserPage.selectFormatter('PHP serialized');
    await browserPage.editHashKeyValue(jsonInvalidStructure);
    await t.expect(browserPage.changeValueWarning.visible).ok('Warning is not displayed');
    await t.pressKey('esc');
    await t.expect(browserPage.changeValueWarning.visible).notOk('Warning is still displayed');
});
