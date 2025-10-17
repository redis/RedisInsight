import { rte } from '../../../../helpers/constants';
import { BrowserPage, MyRedisDatabasePage } from '../../../../pageObjects';
import {
    commonUrl,
    invalidOssStandaloneConfig,
    ossClusterForSSHConfig,
    ossStandaloneForSSHConfig,
    ossStandaloneRedisGears,
} from '../../../../helpers/conf';
import { DatabaseHelper } from '../../../../helpers/database';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { sshPrivateKey, sshPrivateKeyWithPasscode } from '../../../../test-data/sshPrivateKeys';
import { Common } from '../../../../helpers/common';
import { BrowserActions } from '../../../../common-actions/browser-actions';
import { goBackHistory } from '../../../../helpers/utils';
import { AddRedisDatabaseDialog } from '../../../../pageObjects/dialogs';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const browserActions = new BrowserActions();
const addDbDialog = new AddRedisDatabaseDialog();

const { host, port, databaseName, databaseUsername = '', databasePassword = '' } = ossStandaloneRedisGears;
const username = 'alice&&';
const password = 'p1pp0@&';

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

fixture `Connecting to the databases verifications`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    });
test
    .meta({ rte: rte.none })('Verify that user can see error message if he can not connect to added Database', async t => {
        const errorMessage = `Could not connect to ${invalidOssStandaloneConfig.host}:${invalidOssStandaloneConfig.port}, please check the connection details.`;

        // Fill the add database form
        await myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDataBase(invalidOssStandaloneConfig);

        // Verify that when user request to test database connection is not successfull, can see standart connection error
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.testConnectionBtn);
        await t.expect(myRedisDatabasePage.Toast.toastHeader.textContent).contains('Error', 'Invalid connection has no error on test');

        // Click for saving
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton);
        // Verify that the database is not in the list
        await t.expect(myRedisDatabasePage.Toast.toastError.textContent).contains('Error', 'Error message not displayed', { timeout: 10000 });
        await t.expect(myRedisDatabasePage.Toast.toastError.textContent).contains(errorMessage, 'Error message not displayed', { timeout: 10000 });
    });
test
    .meta({ rte: rte.none })('Fields to add database prepopulation', async t => {
        const defaultHost = '127.0.0.1';
        const defaultPort = '6379';
        const defaultSentinelPort = '26379';

        await t
            .click(myRedisDatabasePage.AddRedisDatabaseDialog.addDatabaseButton)
            .click(myRedisDatabasePage.AddRedisDatabaseDialog.customSettingsButton);

        // Verify that the Host, Port, Database Alias values pre-populated by default for the manual flow
        await t
            .expect(myRedisDatabasePage.AddRedisDatabaseDialog.hostInput.value).eql(defaultHost, 'Default host not prepopulated')
            .expect(myRedisDatabasePage.AddRedisDatabaseDialog.portInput.value).eql(defaultPort, 'Default port not prepopulated')
            .expect(myRedisDatabasePage.AddRedisDatabaseDialog.databaseAliasInput.value).eql(`${defaultHost}:${defaultPort}`, 'Default db alias not prepopulated');
        // Verify that the Host, Port, Database Alias values pre-populated by default for Sentinel
        await t
            .click(myRedisDatabasePage.AddRedisDatabaseDialog.backButton)
            .click(myRedisDatabasePage.AddRedisDatabaseDialog.redisSentinelButton);
        await t
            .expect(myRedisDatabasePage.AddRedisDatabaseDialog.hostInput.value).eql(defaultHost, 'Default sentinel host not prepopulated')
            .expect(myRedisDatabasePage.AddRedisDatabaseDialog.portInput.value).eql(defaultSentinelPort, 'Default sentinel port not prepopulated');
    });
test
    .meta({ rte: rte.standalone })
    .after(async() => {
        // Delete databases
        await databaseAPIRequests.deleteStandaloneDatabasesByNamesApi([sshDbPass.databaseName, sshDbPrivateKey.databaseName, sshDbPasscode.databaseName, newClonedDatabaseAlias]);
    })
    .skip('Adding database with SSH', async t => {
        const hiddenPass = '••••••••••••';
        const tooltipText = [
            'Enter a value for required fields (3):',
            'SSH Host',
            'SSH Username',
            'SSH Private Key'
        ];
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
            .click(myRedisDatabasePage.AddRedisDatabaseDialog.securityTab);
        await t
            .click(myRedisDatabasePage.AddRedisDatabaseDialog.useSSHCheckbox)
            .click(myRedisDatabasePage.AddRedisDatabaseDialog.sshPrivateKeyRadioBtn)
            .hover(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton);
        for (const text of tooltipText) {
            await browserActions.verifyTooltipContainsText(text, true);
        }
        // Verify that user can see the Test Connection button enabled/disabled with the same rules as the button to add/apply the changes
        await t.hover(myRedisDatabasePage.AddRedisDatabaseDialog.testConnectionBtn);
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
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cancelButton);
        await databaseHelper.clickOnEditDatabaseByName(sshDbPrivateKey.databaseName);
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cloneDatabaseButton);
        // Edit Database alias before cloning
        await t.typeText(myRedisDatabasePage.AddRedisDatabaseDialog.databaseAliasInput, newClonedDatabaseAlias, { replace: true });
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton);
        await t.expect(myRedisDatabasePage.dbNameList.withExactText(newClonedDatabaseAlias).exists).ok('DB with SSH was not cloned');

        // Verify that user can add SSH tunnel with Passcode
        await myRedisDatabasePage.AddRedisDatabaseDialog.addStandaloneSSHDatabase(sshDbPasscode, sshWithPassphrase);
        await myRedisDatabasePage.clickOnDBByName(sshDbPasscode.databaseName);
        await Common.checkURLContainsText('browser');
    });
test
    .meta({ rte: rte.ossCluster })
    .after(async() => {
        // Delete databases
        await databaseAPIRequests.deleteStandaloneDatabaseApi(sshDbClusterPass);
    })
    .skip('Adding OSS Cluster database with SSH', async t => {
        const sshWithPass = {
            ...sshParams,
            sshPassword: 'pass'
        };
        // Verify that user can add SSH tunnel with Password for OSS Cluster database
        await myRedisDatabasePage.AddRedisDatabaseDialog.addStandaloneSSHDatabase(sshDbClusterPass, sshWithPass);
        // TODO should be deleted after https://redislabs.atlassian.net/browse/RI-5995
        await t.wait(6000)
        await myRedisDatabasePage.clickOnDBByName(sshDbClusterPass.databaseName);
        if(! await browserPage.plusAddKeyButton.exists){
            await myRedisDatabasePage.clickOnDBByName(sshDbClusterPass.databaseName);
        }
        await Common.checkURLContainsText('browser');
    });

test
    .meta({ rte: rte.none })
    .before(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
        await databaseHelper.acceptLicenseTerms();
    })
    .skip('Verify that create free cloud db is displayed always', async t => {
        const externalPageLinkList = 'https://redis.io/try-free?utm_source=redisinsight&utm_medium=app&utm_campaign=list_of_databases';
        const externalPageLinkNavigation = 'https://redis.io/try-free?utm_source=redisinsight&utm_medium=app&utm_campaign=navigation_menu';

        await t.expect(myRedisDatabasePage.dbNameList.exists).notOk('some db is added');
        await t.expect(myRedisDatabasePage.tableRowContent.textContent).contains('Free Redis Cloud DB', `create free db row is not displayed`);
        await t.expect(myRedisDatabasePage.starFreeDbCheckbox.exists).ok('star checkbox is not displayed next to free db link');
        await t.expect(myRedisDatabasePage.portCloudDb.textContent).contains('Set up in a few clicks', `create free db row is not displayed`);

        // skipped until https://redislabs.atlassian.net/browse/RI-6556
        // await t.click(myRedisDatabasePage.tableRowContent);
        // await Common.checkURL(externalPageLinkList);
        // await goBackHistory();

        await t.click(myRedisDatabasePage.NavigationPanel.cloudButton);
        await Common.checkURL(externalPageLinkNavigation);
        await goBackHistory();
    });
test
    .meta({ rte: rte.none })
    .before(async t  => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisGears);
        await browserPage.Cli.sendCommandInCli(`acl DELUSER ${username}`);
        await browserPage.Cli.sendCommandInCli(`ACL SETUSER ${username} on >${password} +@all ~*`);
        await t.click(browserPage.NavigationPanel.myRedisDBButton);
    })
    .after(async t => {
        // Delete all existing connections
        await t.click(addDbDialog.cancelButton);
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(databaseName);
        await browserPage.Cli.sendCommandInCli(`acl DELUSER ${username}`);
        await databaseAPIRequests.deleteAllDatabasesApi();
    })
    ('Verify that inserted URL is parsed', async t => {
        const codedUrl = `redis://${username}:${password}@${host}:${port}`;
        await t
            .click(addDbDialog.addDatabaseButton);

        // Verify that 'redis://default@127.0.0.1:6379' default value prepopulated for connection URL field and the same for placeholder
        await t.expect(addDbDialog.connectionUrlInput.textContent).eql(`redis://default@127.0.0.1:6379`, 'Connection URL not prepopulated');

        await t.typeText(addDbDialog.connectionUrlInput, codedUrl, { replace: true, paste: true });
        await t.click(addDbDialog.customSettingsButton);
        await t.expect(addDbDialog.databaseAliasInput.getAttribute('value')).eql(`${host}:${port}`, 'name is incorrected');
        await t.expect(addDbDialog.hostInput.getAttribute('value')).eql(`${host}`, 'host is incorrected');
        await t.expect(addDbDialog.portInput.getAttribute('value')).eql(`${port}`, 'port is incorrected');
        await t.expect(addDbDialog.usernameInput.getAttribute('value')).eql(`${username}`, 'username is incorrected');
        await t.expect(addDbDialog.passwordInput.getAttribute('value')).eql(`${password}`, 'username is incorrected');
    });
