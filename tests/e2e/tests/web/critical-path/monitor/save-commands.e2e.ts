import * as fs from 'fs';
import * as os from 'os';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import {
    commonUrl,
    fileDownloadPath,
    ossStandaloneConfig
} from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { DatabasesActions } from '../../../../common-actions/databases-actions';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const databasesActions = new DatabasesActions();

const tempDir = os.tmpdir();
const fileStarts = 'test_standalone';

fixture `Save commands`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can see a tooltip and toggle that allows to save Profiler log or not in the Profiler', async t => {
    const toolTip = [
        'Allows you to download the generated log file after pausing the Profiler',
        'Profiler log is saved to a file on your local machine with no size limitation. The temporary log file will be automatically rewritten when the Profiler is reset.'
    ];

    await t.click(browserPage.Profiler.expandMonitor);
    // Check the toggle and Tooltip for Save log
    await t.expect(browserPage.Profiler.saveLogSwitchButton.exists).ok('The toggle that allows to save Profiler log is not displayed');
    await t.hover(browserPage.Profiler.saveLogSwitchButton);
    for (const message of toolTip) {
        await t.expect(browserPage.Profiler.saveLogToolTip.innerText).contains(message, 'The toolTip for save log in Profiler is not displayed');
    }
    // Check toggle state
    await t.expect(browserPage.Profiler.saveLogSwitchButton.getAttribute('aria-checked')).eql('false', 'The toggle state is not OFF when Profiler opened');
});
test('Verify that user can see that toggle is not displayed when Profiler is started', async t => {
    // Start Monitor without save logs
    await browserPage.Profiler.startMonitorAndVerifyStart();
    // Check the toggle
    await t.expect(browserPage.Profiler.saveLogSwitchButton.exists).notOk('The toggle is displayed when Profiler is started');
    // Restart Monitor with Save logs
    await browserPage.Profiler.stopMonitor();
    await t.click(browserPage.Profiler.resetProfilerButton);
    await t.click(browserPage.Profiler.saveLogSwitchButton);
    await t.click(browserPage.Profiler.startMonitorButton);
    // Check the toggle
    await t.expect(browserPage.Profiler.saveLogSwitchButton.exists).notOk('The toggle is displayed when Profiler is started');
});
test('Verify that when user switch toggle to ON and started the Profiler, temporary Log file Created and recording', async t => {
    const cli_command = 'command';
    // Remember the number of files in Temp
    const numberOfTempFiles = fs.readdirSync(tempDir).length;

    // Start Monitor with Save logs
    await browserPage.Profiler.startMonitorWithSaveLog();
    // Send command in CLI
    await browserPage.Cli.getSuccessCommandResultFromCli(cli_command);
    await browserPage.Profiler.checkCommandInMonitorResults(cli_command);
    // Verify that temporary Log file Created
    await t.expect(numberOfTempFiles).lt(fs.readdirSync(tempDir).length, 'The temporary Log file is not created');
});
test('Verify that when user switch toggle to OFF and started the Profiler, temporary Log file is not Created and recording', async t => {
    // Remember the number of files in Temp
    const numberOfTempFiles = fs.readdirSync(tempDir).length;

    // Start Monitor without Save logs
    await browserPage.Profiler.startMonitorAndVerifyStart();
    // Verify that temporary Log file is not created
    await t.expect(numberOfTempFiles).gte(fs.readdirSync(tempDir).length, 'The temporary Log file is created');
});
test('Verify the Profiler Button panel when toggle was switched to ON and user pauses/resumes the Profiler', async t => {
    // Start Monitor with Save logs
    await browserPage.Profiler.startMonitorWithSaveLog();
    // Pause the Profiler
    await t.click(browserPage.Profiler.runMonitorToggle);
    // Check the panel
    await t.expect(browserPage.Profiler.downloadLogPanel.exists).ok('The download log panel not appeared');
    await t.expect(browserPage.Profiler.resetProfilerButton.exists).ok('The Reset Profiler button not visible');
    await t.expect(browserPage.Profiler.downloadLogButton.exists).ok('The Download button not visible');
});
test('Verify that when user see the toggle is OFF - Profiler logs are not being saved', async t => {
    // Remember the number of files in Temp
    const numberOfDownloadFiles = await databasesActions.getFileCount(fileDownloadPath, fileStarts);

    // Start Monitor without Save logs
    await browserPage.Profiler.startMonitorAndVerifyStart();
    await t.wait(3000);
    // Check the download files
    await t.expect(await databasesActions.getFileCount(fileDownloadPath, fileStarts)).eql(numberOfDownloadFiles, 'The Profiler logs are saved');
});
test('Verify that when user see the toggle is ON - Profiler logs are being saved', async t => {
    // Remember the number of files in Temp
    const numberOfDownloadFiles = await databasesActions.getFileCount(fileDownloadPath, fileStarts);

    // Start Monitor with Save logs
    await browserPage.Profiler.startMonitorWithSaveLog();
    // Download logs and check result
    await browserPage.Profiler.stopMonitor();
    await t.click(browserPage.Profiler.downloadLogButton);
    await t.expect(await databasesActions.getFileCount(fileDownloadPath, fileStarts)).gt(numberOfDownloadFiles, 'The Profiler logs not saved', { timeout: 5000 });
});
