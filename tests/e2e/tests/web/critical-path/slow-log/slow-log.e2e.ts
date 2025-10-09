import { SlowLogPage, MyRedisDatabasePage, BrowserPage, ClusterDetailsPage } from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { commonUrl, ossStandaloneBigConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Telemetry } from '../../../../helpers';

const slowLogPage = new SlowLogPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const overviewPage = new ClusterDetailsPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const telemetry = new Telemetry();

const logger = telemetry.createLogger();

const telemetryEvents = ['SLOWLOG_CLEARED','SLOWLOG_LOADED'];
const clearExpectedProperties = [
    'databaseId',
    'provider'
];

const loadExpectedProperties = [
    'databaseId',
    'numberOfCommands',
    'provider'
];

const slowerThanParameter = 1;
let maxCommandLength = 50;
let command = `slowlog get ${maxCommandLength}`;

fixture `Slow Log`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
        await t.click(browserPage.NavigationTabs.analysisButton);
        await t.click(slowLogPage.slowLogTab);
    })
    .afterEach(async() => {
        await slowLogPage.resetToDefaultConfig();
    });
test('Verify that user can open new Slow Log page using new icon on left app panel', async t => {
    // Verify that user see "Slow Log" page by default for non OSS Cluster
    await t.expect(overviewPage.overviewTab.withAttribute('aria-selected', 'true').exists).notOk('The Overview tab is displayed for non OSS Cluster db');
    // Verify that user can configure slowlog-max-len for Slow Log and see whole set of commands according to the setting
    await slowLogPage.changeSlowerThanParameter(slowerThanParameter, slowLogPage.slowLogConfigureMicroSecondsUnit);
    await slowLogPage.Cli.sendCommandInCli(command);
    await t.click(slowLogPage.slowLogRefreshButton);
    const duration = await slowLogPage.slowLogCommandValue.withExactText(command).parent(3).find(slowLogPage.cssSelectorDurationValue).textContent;
    await t.expect(parseInt(duration)).gte(slowerThanParameter, 'Displayed command time execution is more than specified');
    // Verify that user can see 3 columns with timestamp, duration and command in Slow Log
    await t.expect(slowLogPage.slowLogTimestampValue.exists).ok('Timestamp column');
    await t.expect(slowLogPage.slowLogDurationValue.exists).ok('Duration column');
    await t.expect(slowLogPage.slowLogCommandValue.exists).ok('Command column');
});
test('Verify that user can see "No Slow Logs found" message when slowlog-max-len=0', async t => {
    // Set slowlog-max-len=0
    maxCommandLength = 0;
    await slowLogPage.changeMaxLengthParameter(maxCommandLength);
    await t.click(slowLogPage.slowLogRefreshButton);
    // Check that no records are displayed in SlowLog table
    await t.expect(slowLogPage.slowLogEmptyResult.exists).ok('Empty results not found');
    // Verify that user can see not more that number of commands that was specified in configuration
    maxCommandLength = 30;
    await slowLogPage.changeSlowerThanParameter(slowerThanParameter, slowLogPage.slowLogConfigureMicroSecondsUnit);
    await slowLogPage.changeMaxLengthParameter(maxCommandLength);
    // Go to Browser page to scan keys and turn back
    await t.click(browserPage.NavigationTabs.browserButton);
    await t.click(browserPage.refreshKeysButton);
    await t.click(browserPage.NavigationTabs.analysisButton);
    await t.click(slowLogPage.slowLogTab);
    // Compare number of logged commands with maxLength
    await t.expect(slowLogPage.slowLogCommandStatistics.withText(`${maxCommandLength} entries`).exists).ok(`Number of displayed commands is less than selected ${maxCommandLength}`);
});
test('Verify that users can specify number of commands that they want to display (10, 25, 50, 100, Max) in Slow Log', async t => {
    maxCommandLength = 128;
    const numberOfCommandsArray = ['10', '25', '50', '100', 'Max available'];
    // Change slower-than parameter
    await slowLogPage.changeSlowerThanParameter(slowerThanParameter, slowLogPage.slowLogConfigureMicroSecondsUnit);
    await slowLogPage.changeMaxLengthParameter(maxCommandLength);
    // Go to Browser page to scan keys and turn back
    await t.click(browserPage.NavigationTabs.browserButton);
    await t.click(browserPage.refreshKeysButton);
    await t.click(browserPage.NavigationTabs.analysisButton);
    await t.click(slowLogPage.slowLogTab);
    for (let i = 0; i < numberOfCommandsArray.length; i++) {
        await slowLogPage.changeDisplayUpToParameter(numberOfCommandsArray[i]);
        if (i === numberOfCommandsArray.length - 1) {
            await t.expect(slowLogPage.slowLogCommandStatistics.withText(`${maxCommandLength} entries`).exists).ok('Number of displayed commands is not equal to 128');
        }
        else {
            await t.expect(slowLogPage.slowLogCommandStatistics.withText(`${numberOfCommandsArray[i]} entries`).exists).ok(`Number of displayed commands is not equal to ${numberOfCommandsArray[i]}`);
        }
    }
});
test('Verify that user can set slowlog-log-slower-than value in milliseconds and command duration will be re-calculated to ms', async t => {
    // Set slower than parameter to log commands
    await slowLogPage.changeSlowerThanParameter(slowerThanParameter, slowLogPage.slowLogConfigureMicroSecondsUnit);
    // Send command in microseconds
    command = 'scan 0 MATCH * COUNT 5000';
    await slowLogPage.Cli.sendCommandInCli(command);
    await t.click(slowLogPage.slowLogRefreshButton);
    // Get duration of this command in microseconds
    let microsecondsDuration = await slowLogPage.slowLogCommandValue.withExactText(command).parent(3).find(slowLogPage.cssSelectorDurationValue).textContent;
    // Change microseconds to  milliseconds in configuration
    await slowLogPage.changeSlowerThanParameter(slowerThanParameter, slowLogPage.slowLogConfigureMilliSecondsUnit);
    await t.expect(slowLogPage.slowLogTable.find('span').withExactText('Duration, msec').exists).ok('Micro-seconds were converted to milli-seconds');
    let millisecondsDuration = await slowLogPage.slowLogCommandValue.withExactText(command).parent(3).find(slowLogPage.cssSelectorDurationValue).textContent;
    await t.expect(parseFloat(millisecondsDuration)).eql(parseFloat(microsecondsDuration.replace(' ', '')) / 1000);
    // Verify that user can set slowlog-log-slower-than value in microseconds and command duration will be re-calculated to microseconds
    command = 'scan 0 MATCH * COUNT 50000';
    await slowLogPage.Cli.sendCommandInCli(command);
    await t.click(slowLogPage.slowLogRefreshButton);
    // Get duration of this command in milliseconds
    millisecondsDuration = await slowLogPage.slowLogCommandValue.withExactText(command).parent(3).find(slowLogPage.cssSelectorDurationValue).textContent;
    // Change milliseconds to microseconds in configuration
    await slowLogPage.changeSlowerThanParameter(slowerThanParameter, slowLogPage.slowLogConfigureMicroSecondsUnit);
    await t.expect(slowLogPage.slowLogTable.find('span').withExactText('Duration, µs').exists).ok('Micro-seconds were converted to milli-seconds');
    microsecondsDuration = await slowLogPage.slowLogCommandValue.withExactText(command).parent(3).find(slowLogPage.cssSelectorDurationValue).textContent;
    await t.expect(parseFloat(microsecondsDuration.replace(' ', '')) / 1000).eql(parseFloat(millisecondsDuration));
    await t.expect(parseFloat(microsecondsDuration.replace(' ', ''))).eql(parseFloat(millisecondsDuration) * 1000);
});
test.requestHooks(logger)
('Verify that user can reset settings to default on Slow Log page', async t => {
    // Set slowlog-max-len=0
    command = 'info';
    await slowLogPage.changeSlowerThanParameter(slowerThanParameter, slowLogPage.slowLogConfigureMicroSecondsUnit);
    await slowLogPage.Cli.sendCommandInCli('info');
    await t.click(slowLogPage.slowLogRefreshButton);
    await t.expect(slowLogPage.slowLogCommandValue.withExactText(command).exists).ok('Logged command not found');
    await t.click(slowLogPage.slowLogClearButton);
    await t.click(slowLogPage.slowLogConfirmClearButton);

    //Verify telemetry event
    await telemetry.verifyEventHasProperties(telemetryEvents[0], clearExpectedProperties, logger);

    // Verify that user can clear Slow Log
    await t.expect(slowLogPage.slowLogEmptyResult.exists).ok('Slow log is not cleared');

    // Set slower than parameter and max length
    await slowLogPage.changeSlowerThanParameter(slowerThanParameter, slowLogPage.slowLogConfigureMicroSecondsUnit);
    await slowLogPage.changeMaxLengthParameter(maxCommandLength);

    //Verify telemetry event
    await telemetry.verifyEventHasProperties(telemetryEvents[1], loadExpectedProperties, logger);

    // Reset settings to default
    await slowLogPage.resetToDefaultConfig();
    // Compare configuration after re-setting
    const configText = await slowLogPage.configInfo.textContent;
    await t.expect(configText.replace(/\u00a0/g, ' ')).contains('Execution time: 10 msec, Max length: 128', 'Not reset configuration');
});
