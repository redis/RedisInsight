import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage, WorkbenchPage } from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import { commonUrl, ossClusterConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const workbenchPage = new WorkbenchPage();

fixture `Search and Query Raw mode`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl);

test
    .before(async () => {
        await databaseHelper.acceptLicenseTermsAndAddOSSClusterDatabase(ossClusterConfig);
        await browserPage.Cli.sendCommandInCli('flushdb');
    })('Verify suggestions when there are no indexes', async t => {

        await t.click(browserPage.NavigationTabs.workbenchButton);

        await t.typeText(workbenchPage.queryInput, 'FT.SE', { replace: true });
        await t.pressKey('tab');

        await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('No indexes to display').exists).ok('info text is not displayed');

        await t.pressKey('ctrl+space');
        await t.expect(await workbenchPage.MonacoEditor.monacoCommandDetails.find('a').exists).ok('no link in the details')
    });
