import { rte } from '../../../../helpers/constants';
import { BrowserPage, ClusterDetailsPage, MyRedisDatabasePage } from '../../../../pageObjects';
import { commonUrl, ossClusterForSSHConfig, ossStandaloneForSSHConfig } from '../../../../helpers/conf';
import { DatabaseHelper } from '../../../../helpers/database';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { sshPrivateKey, sshPrivateKeyWithPasscode } from '../../../../test-data/sshPrivateKeys';
import { Common } from '../../../../helpers/common';
import { BrowserActions } from '../../../../common-actions/browser-actions';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const clusterPage = new ClusterDetailsPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const browserActions = new BrowserActions();

const sshParams = {
    sshHost: '172.31.100.245',
    sshPort: '2222',
    sshUsername: 'u'
};
const newClonedDatabaseAlias = 'Cloned ssh database';
const sshDbPass = {
    ...ossStandaloneForSSHConfig,
    databaseName: `SSH_${Common.generateWord(5)}`
};
const sshDbPrivateKey = {
    ...ossStandaloneForSSHConfig,
    databaseName: `SSH_${Common.generateWord(5)}`
};
const sshDbPasscode = {
    ...ossStandaloneForSSHConfig,
    databaseName: `SSH_${Common.generateWord(5)}`
};
const sshDbClusterPass = {
    ...ossClusterForSSHConfig,
    databaseName: `SSH_Cluster_${Common.generateWord(5)}`
};

fixture `Adding database with SSH`
    .meta({ type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    })
    .after(async() => {
        // Delete databases
        await databaseAPIRequests.deleteStandaloneDatabasesByNamesApi([sshDbPass.databaseName, sshDbPrivateKey.databaseName, sshDbPasscode.databaseName, newClonedDatabaseAlias, sshDbClusterPass.databaseName]);
    });
test.skip
    .meta({ rte: rte.standalone })('Adding database with SSH', async t => {
    const tooltipText = [
        'Enter a value for required fields (3):',
        'SSH Host',
        'SSH Username',
        'SSH Private Key'
    ];
    const hiddenPass = '••••••••••••';
    const sshWithPass = {
        ...sshParams,
        sshPassword: 'pass'
    };
    const sshWithPrivateKey = {
        ...sshParams,
        sshPrivateKey: sshPrivateKey
    };
    const sshWithPassphrase = {
        ...sshParams,
        sshPrivateKey: sshPrivateKeyWithPasscode,
        sshPassphrase: 'test'
    };
    // Verify that if user have not entered any required value he can see that this field should be specified when hover over the button to add a database
    await t
        .click(myRedisDatabasePage.AddRedisDatabaseDialog.addDatabaseButton)
        .click(myRedisDatabasePage.AddRedisDatabaseDialog.customSettingsButton)
        .click(myRedisDatabasePage.AddRedisDatabaseDialog.securityTab)
        .click(myRedisDatabasePage.AddRedisDatabaseDialog.useSSHCheckbox)
        .click(myRedisDatabasePage.AddRedisDatabaseDialog.sshPrivateKeyRadioBtn)
        .hover(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButtonHover);
    for (const text of tooltipText) {
        await browserActions.verifyTooltipContainsText(text, true);
    }
    // Verify that user can see the Test Connection button enabled/disabled with the same rules as the button to add/apply the changes
    await t.hover(myRedisDatabasePage.AddRedisDatabaseDialog.testConnectionBtnHover);
    for (const text of tooltipText) {
        await browserActions.verifyTooltipContainsText(text, true);
    }

    // Verify that user can add SSH tunnel with Password for Standalone database
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cancelButton);
    await myRedisDatabasePage.AddRedisDatabaseDialog.addStandaloneSSHDatabase(sshDbPass, sshWithPass);
    await myRedisDatabasePage.clickOnDBByName(sshDbPass.databaseName);
    await Common.checkURLContainsText('browser');

    // Verify that user can add SSH tunnel with Private Key
    await t.click(browserPage.OverviewPanel.myRedisDBLink);
    await myRedisDatabasePage.AddRedisDatabaseDialog.addStandaloneSSHDatabase(sshDbPrivateKey, sshWithPrivateKey);
    await myRedisDatabasePage.clickOnDBByName(sshDbPrivateKey.databaseName);
    await Common.checkURLContainsText('browser');

    // Verify that user can edit SSH parameters for existing database connections
    await t.click(browserPage.OverviewPanel.myRedisDBLink);
    await myRedisDatabasePage.clickOnEditDBByName(sshDbPrivateKey.databaseName);
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.securityTab);
    await t
        .typeText(myRedisDatabasePage.AddRedisDatabaseDialog.sshPrivateKeyInput, sshWithPassphrase.sshPrivateKey, { replace: true, paste: true })
        .typeText(myRedisDatabasePage.AddRedisDatabaseDialog.sshPassphraseInput, sshWithPassphrase.sshPassphrase, { replace: true, paste: true });
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton);
    await t.expect(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton.exists).notOk('Edit database panel still displayed');
    await databaseHelper.clickOnEditDatabaseByName(sshDbPrivateKey.databaseName);
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.securityTab);
    // Verify that password, passphrase and private key are hidden for SSH option
    await t
        .expect(myRedisDatabasePage.AddRedisDatabaseDialog.sshPrivateKeyInput.textContent).eql(hiddenPass, 'Edited Private key not saved')
        .expect(myRedisDatabasePage.AddRedisDatabaseDialog.sshPassphraseInput.value).eql(hiddenPass, 'Edited Passphrase not saved');

    // Verify that user can clone database with SSH tunnel
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cloneDatabaseButton);
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.generalTab);
    // Edit Database alias before cloning
    await t.typeText(myRedisDatabasePage.AddRedisDatabaseDialog.databaseAliasInput, newClonedDatabaseAlias, { replace: true });
    await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton);
    await t.expect(myRedisDatabasePage.dbNameList.withExactText(newClonedDatabaseAlias).exists).ok('DB with SSH was not cloned');

    // Verify that user can add SSH tunnel with Passcode
    await myRedisDatabasePage.AddRedisDatabaseDialog.addStandaloneSSHDatabase(sshDbPasscode, sshWithPassphrase);
    await myRedisDatabasePage.clickOnDBByName(sshDbPasscode.databaseName);
    await Common.checkURLContainsText('browser');
});
test.skip
    .meta({ rte: rte.ossCluster, skipComment: "Unstable and will be affected by RI-5995" })('Verify that  OSS Cluster database with SSH can be added and work correctly', async t => {
    const sshWithPass = {
        ...sshParams,
        sshPassword: 'pass'
    };
    // Verify that user can add SSH tunnel with Password for OSS Cluster database
    await myRedisDatabasePage.AddRedisDatabaseDialog.addStandaloneSSHDatabase(sshDbClusterPass, sshWithPass);
    // TODO: should be deleted after https://redislabs.atlassian.net/browse/RI-5995
    await t.wait(6000);
    await myRedisDatabasePage.clickOnDBByName(sshDbClusterPass.databaseName);
    if(! await browserPage.plusAddKeyButton.exists){
        await myRedisDatabasePage.clickOnDBByName(sshDbClusterPass.databaseName);
    }
    //verify that db is added and profiler works
    await t.click(browserPage.Profiler.expandMonitor);
    await t.click(browserPage.Profiler.startMonitorButton);
    await t.expect(browserPage.Profiler.monitorIsStartedText.innerText).eql('Profiler is started.');

    await t.click(browserPage.NavigationPanel.analysisPageButton);
    await t.click(clusterPage.overviewTab);
    await t.expect(await clusterPage.getPrimaryNodesCount()).eql(Number('3'), 'Primary nodes in table are not corrected');
});
