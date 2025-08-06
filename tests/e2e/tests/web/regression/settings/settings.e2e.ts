import { rte } from '../../../../helpers/constants';
import { BrowserPage, MemoryEfficiencyPage, SettingsPage, WorkbenchPage } from '../../../../pageObjects';
import {
    commonUrl, ossClusterConfig,
} from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common, DatabaseHelper, Telemetry } from '../../../../helpers';

const browserPage = new BrowserPage();
const databaseAPIRequests = new DatabaseAPIRequests();
const workbenchPage = new WorkbenchPage();
const settingsPage = new SettingsPage();
const memoryEfficiencyPage = new MemoryEfficiencyPage();
const databaseHelper = new DatabaseHelper();
const telemetry = new Telemetry();

const logger = telemetry.createLogger();

let keyName = Common.generateWord(20);

const telemetryEvents = ['SETTINGS_DATE_TIME_FORMAT_CHANGED','DATABASE_ANALYSIS_STARTED'];
const settingsExpectedProperties = [
    'currentFormat'
];
const databaseAnalysisExpectedProperties = [
    'databaseId',
    'provider'
];

fixture `DataTime format setting`
    .meta({
        type: 'regression',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddOSSClusterDatabase(ossClusterConfig);
    })
    .afterEach(async t => {
        await browserPage.Cli.sendCommandInCli('flushdb');
        await t.click(workbenchPage.NavigationPanel.settingsButton);
        await t.click(settingsPage.accordionAppearance);
        await t.click(settingsPage.commonRadioButton);
        await settingsPage.selectDataFormatDropdown('HH\\:mm\\:ss');
        await databaseAPIRequests.deleteAllDatabasesApi();
        await settingsPage.selectTimeZoneDropdown('local');
    });
test
    .requestHooks(logger)
    .skip('Verify that user can select date time format', async t => {
    const defaultDateRegExp = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d \d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/;
    const selectedDateReqExp = /^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.\d{4} ([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
    keyName = `DateTimeTestKey-${Common.generateWord(5)}`;
    const hashField = '1724674140';

    const selectorForOption = 'dd\\.MM\\.yyyy';
    const selectedOption = 'dd.MM.yyyy HH:mm:ss';
    const zoneSelectOption = 'UTC';

    await browserPage.addHashKey(keyName, '100000', hashField, hashField);
    await browserPage.openKeyDetails(keyName);
    await browserPage.selectFormatter('DateTime');
    await t.expect(defaultDateRegExp.test(await browserPage.getHashKeyValue())).ok('date is not in default format HH:mm:ss d MMM yyyy');

    await t.click(workbenchPage.NavigationPanel.settingsButton);
    await t.click(settingsPage.accordionAppearance);
    await settingsPage.selectDataFormatDropdown(selectorForOption);
    //Verify telemetry event
    await telemetry.verifyEventHasProperties(telemetryEvents[0], settingsExpectedProperties, logger);

    await t.expect(settingsPage.selectFormatDropdown.textContent).eql(selectedOption, 'option is not selected');
    await t.expect(selectedDateReqExp.test(await settingsPage.dataPreview.textContent)).ok(`preview is not valid for ${selectedOption}`);

    await t.click(workbenchPage.NavigationPanel.myRedisDBButton);
    await t.click(workbenchPage.NavigationPanel.browserButton);
    await browserPage.openKeyDetails(keyName);
    await t.expect(selectedDateReqExp.test(await browserPage.getHashKeyValue())).ok(`date is not in selected format ${selectedOption}`);

    await t.click(workbenchPage.NavigationPanel.settingsButton);
    await t.click(settingsPage.accordionAppearance);
    await settingsPage.selectTimeZoneDropdown(zoneSelectOption);
    await t.expect(settingsPage.selectTimezoneDropdown.textContent).eql(zoneSelectOption, 'option is not selected');

    await t.click(browserPage.NavigationPanel.workbenchButton);
    await workbenchPage.sendCommandInWorkbench('info');
    const dateTime = await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssCommandExecutionDateTime).textContent;
    await t.expect(selectedDateReqExp.test(dateTime)).ok('date is not in default format HH:mm:ss.SSS d MMM yyyy');
});

test .requestHooks(logger)
('Verify that user can set custom date time format', async t => {
    const enteredFormat = 'MMM dd yyyy/ HH.mm.ss';
    const enteredDateReqExp = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (0[1-9]|[12]\d|3[01]) \d{4}\/ ([01]\d|2[0-3])\.[0-5]\d\.[0-5]\d$/;

    await t.click(workbenchPage.NavigationPanel.settingsButton);
    await t.click(settingsPage.accordionAppearance);
    await t.click(settingsPage.customRadioButton);
    await settingsPage.enterTextInCustom(enteredFormat);
    await t.expect(enteredDateReqExp.test(await settingsPage.dataPreview.textContent)).ok(`preview is not valid for ${enteredFormat}`);
    await t.click(settingsPage.saveCustomFormatButton);

    await t.click(settingsPage.NavigationPanel.analysisPageButton);
    await t.click(memoryEfficiencyPage.databaseAnalysisTab);
    await t.click(memoryEfficiencyPage.newReportBtn);

    //Verify telemetry event
    await telemetry.verifyEventHasProperties(telemetryEvents[1], databaseAnalysisExpectedProperties, logger);

    await t.expect(enteredDateReqExp.test((await memoryEfficiencyPage.selectedReport.textContent).trim())).ok(`custom format is not working ${enteredFormat}`);
});
