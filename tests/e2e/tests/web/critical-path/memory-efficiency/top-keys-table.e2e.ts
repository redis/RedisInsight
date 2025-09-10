import { Chance } from 'chance';
import { Selector } from 'testcafe';
import { MyRedisDatabasePage, MemoryEfficiencyPage, BrowserPage } from '../../../../pageObjects';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { deleteAllKeysFromDB, populateDBWithHashes, populateHashWithFields } from '../../../../helpers/keys';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const memoryEfficiencyPage = new MemoryEfficiencyPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();
const chance = new Chance();

const keyToAddParameters = { keysCount: 13, keyNameStartWith: 'hashKey' };
const keyName = `TestHashKey-${ Common.generateWord(10) }`;
const keyToAddParameters2 = { fieldsCount: 80000, keyName, fieldStartWith: 'hashField', fieldValueStartWith: 'hashValue' };
const members = [...Array(100).keys()].toString().replace(/,/g, ' '); // The smallest key
const keyNamesMemory = ['string', 'list', 'bloom', 'set'];
const keyNamesLength = ['string', 'set', 'list'];
const mbloomCommand = 'bf.add bloom 1';
const listCommand = `rpush list ${members.slice(0, -3)}`;
const stringCommand = `set string "${chance.paragraph({ sentences: 100 })}"`; // The biggest key
const setCommand = `sadd set ${members}`; // Middle key

fixture(`Memory Efficiency Top Keys Table`).skip
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl);
test
    .before(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        // Create keys
        await populateDBWithHashes(ossStandaloneConfig.host, ossStandaloneConfig.port, keyToAddParameters);
        // Go to Analysis Tools page
        await t.click(browserPage.NavigationTabs.analysisButton);
    })
    .after(async() => {
        await browserPage.Cli.sendCommandInCli('flushdb');
        await deleteAllKeysFromDB(ossStandaloneConfig.host, ossStandaloneConfig.port);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Top Keys displaying in Summary of big keys', async t => {
        // Verify that user can see “-” as length for all unsupported data types
        await browserPage.Cli.sendCommandInCli(mbloomCommand);
        await t.click(memoryEfficiencyPage.newReportBtn);
        await t.expect(Selector('[data-testid=length-empty-bloom]').textContent).eql('-', 'Length is defined for unknown types');
        // Verify that user cannot see quantifier if keys are less than 15
        await t.expect(memoryEfficiencyPage.topKeysTitle.textContent).eql('TOP KEYS', 'Title is not correct');
        // Verify that top 15 keys are displayed per memory
        await browserPage.Cli.sendCommandInCli(listCommand);
        await browserPage.Cli.sendCommandInCli(stringCommand);
        await browserPage.Cli.sendCommandInCli(setCommand);
        await t.click(memoryEfficiencyPage.newReportBtn);
        await t.expect(memoryEfficiencyPage.topKeysTitle.textContent).eql('TOP 15 KEYS', 'Title is not correct');
        await t.expect(memoryEfficiencyPage.topKeysKeyName.count).eql(15, 'Number of lines is not 15');
        // Verify that sorting by Key Size DESC applied by default in by Memory tab
        for (let i = 0; i < 4; i++) {
            await t.expect(memoryEfficiencyPage.topKeysKeyName.nth(i).textContent).eql(keyNamesMemory[i], 'Key name by Memory order is not correct');
        }
        // Verify that top 15 keys are displayed per length
        await t.click(memoryEfficiencyPage.sortByLength);
        await t.expect(memoryEfficiencyPage.topKeysKeyName.count).eql(15, 'Number of lines is not 15');
        // Verify that sorting by Length DESC applied by default in by Length tab
        for (let i = 0; i < 3; i++) {
            await t.expect(memoryEfficiencyPage.topKeysKeyName.nth(i).textContent).eql(keyNamesLength[i], 'Key name by Length order is not correct');
        }
        // Verify that user can click on a key name and see key details in Browser
        await t.click(memoryEfficiencyPage.topKeysKeyName.nth(1).find('button'));
        await t.expect(browserPage.keyNameFormDetails.find('b').textContent).eql(keyNamesLength[1]);
    });
test
    .before(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        // Create keys
        await populateHashWithFields(ossStandaloneConfig.host, ossStandaloneConfig.port, keyToAddParameters2);
        // Go to Analysis Tools page
        await t.click(browserPage.NavigationTabs.analysisButton);
    })
    .after(async() => {
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Big highlighted key tooltip', async t => {
        const tooltipText = 'Consider splitting it into multiple keys';

        await t.click(memoryEfficiencyPage.newReportBtn);
        // Tooltip with text "Consider splitting it into multiple keys" is displayed for highlighted keys
        await t.hover(memoryEfficiencyPage.topKeysKeySizeCell);
        await t.expect(browserPage.tooltip.textContent).contains(tooltipText, `"${tooltipText}" is not displayed in Key size tooltip`);
        await t.hover(memoryEfficiencyPage.topKeysLengthCell);
        await t.expect(browserPage.tooltip.textContent).contains(tooltipText, `"${tooltipText}" is not displayed in Length tooltip`);
    });
