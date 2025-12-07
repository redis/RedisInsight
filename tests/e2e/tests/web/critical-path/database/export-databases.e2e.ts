import * as fs from 'fs';
import { join as joinPath } from 'path';
import { rte } from '../../../../helpers/constants';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import {
    cloudDatabaseConfig,
    commonUrl,
    fileDownloadPath,
    ossClusterConfig,
    ossSentinelConfig,
    ossStandaloneConfig,
    ossStandaloneTlsConfig
} from '../../../../helpers/conf';
import { DatabaseHelper } from '../../../../helpers/database';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { DatabasesActions } from '../../../../common-actions/databases-actions';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databasesActions = new DatabasesActions();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

let foundExportedFiles: string[];

fixture `Export databases`
    .meta({ type: 'critical_path', rte: rte.none })
    .page(commonUrl);
test
    .before(async() => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.deleteAllDatabasesApi();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneTlsConfig);
        await databaseAPIRequests.addNewOSSClusterDatabaseApi(ossClusterConfig);
        await databaseAPIRequests.discoverSentinelDatabaseApi(ossSentinelConfig);
        await myRedisDatabasePage.reloadPage();
    })
    .after(async() => {
        // Delete exported file
        fs.unlinkSync(joinPath(fileDownloadPath, foundExportedFiles[0]));
        await databaseAPIRequests.deleteAllDatabasesApi();
    })
    .skip('Exporting Standalone, OSS Cluster, and Sentinel connection types', async t => {
        const databaseNames = [
            ossStandaloneConfig.databaseName,
            ossStandaloneTlsConfig.databaseName,
            ossClusterConfig.ossClusterDatabaseName,
            ossSentinelConfig.masters[1].alias
        ];

        const compressor = 'Brotli';

        await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.decompressionTab);
        await myRedisDatabasePage.AddRedisDatabaseDialog.setCompressorValue(compressor);
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton);

        // Select databases checkboxes
        await databasesActions.selectDatabasesByNames(databaseNames);
        // Export connections with passwords
        await t
            .click(myRedisDatabasePage.exportBtn)
            .click(myRedisDatabasePage.exportSelectedDbsBtn)
            .wait(2000);

        // Verify that user can see “Garnetinsight_connections_{timestamp}” as the default file name
        foundExportedFiles = await databasesActions.findFilesByFileStarts(fileDownloadPath, 'Garnetinsight_connections_');
        // Verify that user can export database with passwords and client certificates with “Export database passwords and client certificates” control selected
        await t.expect(foundExportedFiles.length).gt(0, 'The Exported file not saved');

        // Delete databases
        await databaseAPIRequests.deleteAllDatabasesApi();
        await myRedisDatabasePage.reloadPage();

        const exportedData = {
            path: joinPath(fileDownloadPath, foundExportedFiles[0]),
            successNumber: databaseNames.length,
            dbImportedNames: databaseNames
        };

        await databasesActions.importDatabase(exportedData);
        await t.expect(myRedisDatabasePage.successResultsAccordion.find(myRedisDatabasePage.cssNumberOfDbs).textContent)
            .contains(`${exportedData.successNumber}`, 'Not correct successfully imported number');
        await t.click(myRedisDatabasePage.closeImportBtn);
        // Verify that user can import exported file with all datatypes and certificates
        await databasesActions.verifyDatabasesDisplayed(exportedData.dbImportedNames);

        const modulesDbRedisStackIcon = myRedisDatabasePage.dbNameList.child('span').withExactText(ossStandaloneConfig.databaseName).parent('tr')
            .find(myRedisDatabasePage.cssRedisStackIcon);
        // Verify that db has redis stack icon
        await t.expect(modulesDbRedisStackIcon.exists).ok('module icon is displayed');

        await databaseHelper.clickOnEditDatabaseByName(databaseNames[1]);
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.securityTab);
        await t.expect(myRedisDatabasePage.AddRedisDatabaseDialog.caCertField.textContent).contains('ca', 'CA certificate import incorrect');
        await t.expect(myRedisDatabasePage.AddRedisDatabaseDialog.clientCertField.textContent).contains('client', 'Client certificate import incorrect');
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cancelButton);

        await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.decompressionTab);
        await t.expect(myRedisDatabasePage.AddRedisDatabaseDialog.selectCompressor.textContent).eql(compressor, 'Compressor import incorrect');
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.cancelButton);
    });
test
    .before(async() => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneTlsConfig);
        await databaseHelper.addRedisCloudDatabase(cloudDatabaseConfig);
        await databaseAPIRequests.discoverSentinelDatabaseApi(ossSentinelConfig);
        await myRedisDatabasePage.reloadPage();
    })
    .after(async() => {
        // Delete databases
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneTlsConfig);
        await databaseHelper.deleteDatabase(cloudDatabaseConfig.databaseName);
        await databaseAPIRequests.deleteAllDatabasesByConnectionTypeApi('SENTINEL');
        // Delete exported file
        fs.unlinkSync(joinPath(fileDownloadPath, foundExportedFiles[0]));
    })('Export databases without passwords', async t => {
        const databaseNames = [ossStandaloneTlsConfig.databaseName, cloudDatabaseConfig.databaseName, ossSentinelConfig.masters[1].alias];

        // Select databases checkboxes
        await databasesActions.selectDatabasesByNames(databaseNames);
        // Export connections without passwords
        await t
            .click(myRedisDatabasePage.exportBtn)
            .click(myRedisDatabasePage.exportPasswordsCheckbox)
            .click(myRedisDatabasePage.exportSelectedDbsBtn)
            .wait(2000);

        foundExportedFiles = await databasesActions.findFilesByFileStarts(fileDownloadPath, 'Garnetinsight_connections_');
        const parsedExportedJson = databasesActions.parseDbJsonByPath(joinPath(fileDownloadPath, foundExportedFiles[0]));
        // Verify that user can export databases without database passwords and client key when “Export passwords” control not selected
        for (const db of parsedExportedJson) {
            await t.expect(db.hasOwnProperty('password')).eql(false, 'Databases exported with passwords');
            // Verify for standalone with TLS
            if (db.tls === true) {
                await t.expect(db.clientCert.hasOwnProperty('key')).eql(false, 'Databases exported with client key');
            }
            // Verify for sentinel
            if ('sentinelMaster' in db) {
                await t.expect(db.sentinelMaster.hasOwnProperty('password')).eql(false, 'Sentinel primary group exported with passwords');
            }
        }
    }).skip.meta({skipComment: "Unstable CI execution,  Error in test.before hook "});
