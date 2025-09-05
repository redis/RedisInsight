import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneBigConfig, ossStandaloneConfig } from '../../../../helpers/conf'
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { BrowserActions } from '../../../../common-actions/browser-actions';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';
import { HashKeyParameters } from '../../../../pageObjects/browser-page';

const browserPage = new BrowserPage();
const browserActions = new BrowserActions();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyNames: string[];

fixture `Delimiter tests`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async () => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
    });
test('Verify that user can see that input is not saved when the Cancel button is clicked', async t => {
    // Switch to tree view
    await t.click(browserPage.treeViewButton);
    await t.click(browserPage.TreeView.treeViewSettingsBtn);
    // Check the default delimiter value
    await t.expect(browserPage.TreeView.FiltersDialog.getDelimiterBadgeByTitle(':').exists).eql(true, 'Default delimiter not applied');
    // Apply new value to the field
    await browserPage.TreeView.FiltersDialog.removeDelimiterItem(':');
    await browserPage.TreeView.FiltersDialog.addDelimiterItem('test');
    // Click on Cancel button
    await t.click(browserPage.TreeView.FiltersDialog.treeViewDelimiterValueCancel);
    // Check the previous delimiter value
    await t.click(browserPage.TreeView.treeViewSettingsBtn);
    await t.expect(browserPage.TreeView.FiltersDialog.getDelimiterBadgeByTitle(':').exists).eql(true, 'Previous delimiter not applied');
    await t.expect(browserPage.TreeView.FiltersDialog.getDelimiterBadgeByTitle('test').exists).eql(false, 'Previous delimiter not applied');
    await t.click(browserPage.TreeView.FiltersDialog.treeViewDelimiterValueCancel);

    // Change delimiter
    await browserPage.TreeView.changeDelimiterInTreeView('-');
    // Verify that when user changes the delimiter and clicks on Save button delimiter is applied
    await browserActions.checkTreeViewFoldersStructure([['device_us', 'west'], ['mobile_eu', 'central'], ['mobile_us', 'east'], ['user_us', 'west'], ['device_eu', 'central'], ['user_eu', 'central']], ['-']);
});
test
    .before(async () => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        keyNames = [
            `device:common-dev`,
            `device-common:dev`,
            `device:common:dev`,
            `device-common-dev`,
            `device:common-stage`,
            `device:common1-stage`,
            `mobile:common-dev`,
            `mobile:common-stage`
        ];
        for (const keyName of keyNames) {
            let hashKeyParameters: HashKeyParameters = {
                keyName: keyName,
                fields: [
                    {
                        field: 'field',
                        value: 'value',
                    },
                ],
            }
            await apiKeyRequests.addHashKeyApi(
                hashKeyParameters,
                ossStandaloneConfig,
            )
        }
        await browserPage.reloadPage();
    })
    .after(async () => {
        for (const keyName of keyNames) {
            await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        }
    })('Verify that user can set multiple delimiters in the tree view', async t => {
        // Switch to tree view
        await t.click(browserPage.treeViewButton);
        // Verify folders ordering with default delimiter
        await browserActions.checkTreeViewFoldersStructure([['device', 'common'], ['device-common'], ['mobile']], [':']);
        await t.click(browserPage.TreeView.treeViewSettingsBtn);
        // Apply new value to the field
        await browserPage.TreeView.FiltersDialog.addDelimiterItem('-');
        await t.click(browserPage.TreeView.FiltersDialog.treeViewDelimiterValueSave);
        // Verify that when user changes the delimiter and clicks on Save button delimiter is applied
        await browserActions.checkTreeViewFoldersStructure([['device', 'common'], ['device', 'common1'], ['mobile', 'common']], [':', '-']);

        await t.setTestSpeed(.3); // change default test speed to check tooltip
        // Verify that namespace names tooltip contains valid names and delimiter
        await t.click(browserActions.getNodeSelector('device'));
        await t.hover(browserActions.getNodeSelector('device-common'));
        await browserActions.verifyTooltipContainsText('device-common-*\n:\n-\n5 key(s)', true);
    });
