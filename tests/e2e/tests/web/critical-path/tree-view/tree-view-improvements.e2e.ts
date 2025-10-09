import { t } from 'testcafe';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { KeyTypesTexts, rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import { verifyKeysDisplayingInTheList } from '../../../../helpers/keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

let keyNames: string[];
let keyName1: string;
let keyName2: string;
let keyNameSingle: string;
let index: string;

fixture `Tree view navigations improvement tests`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl);
test
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .after(async() => {
        await browserPage.Cli.sendCommandInCli('flushdb');
    })('Tree view preselected folder', async t => {
        keyName1 = Common.generateWord(10);
        keyName2 = Common.generateWord(10);
        keyNameSingle = Common.generateWord(10);
        keyNames = [`${keyName1}:1`, `${keyName1}:2`, `${keyName2}:1`, `${keyName2}:2`, keyNameSingle];

        const commands = [
            'flushdb',
            `HSET ${keyNames[0]} field value`,
            `HSET ${keyNames[1]} field value`,
            `HSET ${keyNames[2]} field value`,
            `SADD ${keyNames[3]} value`,
            `SADD ${keyNames[4]} value`
        ];

        // Create 5 keys
        await browserPage.Cli.sendCommandsInCli(commands);
        await t.click(browserPage.treeViewButton);
        // The folder without any patterns selected and the list of keys is displayed when there is a folder without any patterns
        await verifyKeysDisplayingInTheList([keyNameSingle], true);

        await browserPage.TreeView.openTreeFolders([await browserPage.TreeView.getTextFromNthTreeElement(1)]);
        await browserPage.selectFilterGroupType(KeyTypesTexts.Set);
        // The folder without any namespaces is selected (if exists) when folder does not exist after search/filter
        await verifyKeysDisplayingInTheList([keyNameSingle], true);

        await browserPage.setAllKeyType();
        // The folder without any patterns selected and the list of keys is displayed when there is a folder without any patterns
        await verifyKeysDisplayingInTheList([keyNameSingle], true);
        await verifyKeysDisplayingInTheList([`${keyNames[0]}:1`, `${keyNames[2]}:2`], false);

        // switch between browser view and tree view
        await t.click(browserPage.browserViewButton)
            .click(browserPage.treeViewButton);
        await browserPage.deleteKeyByName(keyNames[4]);
        await t.click(browserPage.clearFilterButton);
        // get first folder name
        const firstTreeItemText = await browserPage.TreeView.getTextFromNthTreeElement(0);
        // All folders with namespaces are collapsed when there is no folder without any patterns
        await verifyKeysDisplayingInTheList([`${firstTreeItemText}:1`, `${firstTreeItemText}:2`], false);

        const commands1 = [
            `SADD ${keyNames[4]} value`
        ];

        await browserPage.Cli.sendCommandsInCli(commands1);
        await t.click(browserPage.refreshKeysButton);
        // Folders are collapsed after refresh
        await verifyKeysDisplayingInTheList([`${firstTreeItemText}:1`, `${firstTreeItemText}:2`], false);
        await verifyKeysDisplayingInTheList([keyNameSingle], true);

        await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
        // Only folders according to key type filter are displayed
        await verifyKeysDisplayingInTheList([keyNameSingle], false);
        await browserPage.TreeView.verifyFolderDisplayingInTheList(firstTreeItemText, true);

        await browserPage.searchByKeyName(`${keyName1}*`);
        // Only folders according to filter by key names are displayed
        await verifyKeysDisplayingInTheList([keyNameSingle], false);
        await browserPage.TreeView.verifyFolderDisplayingInTheList(keyName2, false);
        await browserPage.TreeView.verifyFolderDisplayingInTheList(keyName1, true);

        await t.click(browserPage.clearFilterButton);
        // All folders are displayed and collapsed after cleared filter
        await verifyKeysDisplayingInTheList([keyNameSingle], true);
        await verifyKeysDisplayingInTheList([keyName1], false);
        await browserPage.TreeView.verifyFolderDisplayingInTheList(keyName2, true);
        await browserPage.TreeView.verifyFolderDisplayingInTheList(keyName1, true);

        await browserPage.selectFilterGroupType(KeyTypesTexts.Stream);
        // Verify that No results found message is displayed in case of invalid filtering
        await t.expect(browserPage.noResultsFoundOnly.textContent).contains('No results found.', 'Key is not found message not displayed');

        await browserPage.setAllKeyType(); // clear stream from filter
        // Verify that no results found message not displayed after clearing filter
        await t.expect(browserPage.noResultsFoundOnly.exists).notOk('Key is not found message still displayed');
        // All folders are displayed and collapsed after cleared filter
        await verifyKeysDisplayingInTheList([keyNameSingle], true);
        await verifyKeysDisplayingInTheList([keyName1], false);
        await browserPage.TreeView.verifyFolderDisplayingInTheList(keyName2, true);
        await browserPage.TreeView.verifyFolderDisplayingInTheList(keyName1, true);
    });
test
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .after(async() => {
        await browserPage.Cli.sendCommandInCli(`FT.DROPINDEX ${index}`);
        await browserPage.Cli.sendCommandInCli('flushdb');
    })('Verify tree view navigation for index based search', async t => {
        keyName1 = Common.generateWord(10); // used to create index name
        keyName2 = Common.generateWord(10); // used to create index name
        const subFolder1 = Common.generateWord(10); // used to create index name
        keyNames = [`${keyName1}:${subFolder1}:1`, `${keyName1}:${subFolder1}:2`, `${keyName2}:1:1`, `${keyName2}:1:2`];
        const commands = [
            'flushdb',
            `HSET ${keyNames[0]} field value`,
            `HSET ${keyNames[1]} field value`,
            `HSET ${keyNames[2]} field value`,
            `HSET ${keyNames[3]} field value`
        ];
        await browserPage.Cli.sendCommandsInCli(commands);

        // generate index based on keyName
        const folders = [keyName1, subFolder1];
        index = await browserPage.Cli.createIndexwithCLI(folders.join(':'));
        await t.click(browserPage.redisearchModeBtn); // click redisearch button
        await browserPage.selectIndexByName(index);
        await t.click(browserPage.treeViewButton);
        await browserPage.TreeView.openTreeFolders(folders);
        await t.click(browserPage.refreshKeysButton);
        // Refreshed Tree view preselected folder for index based search
        await browserPage.TreeView.verifyFolderDisplayingInTheList(keyName1, true);
    });
test
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .after(async() => {
        await t.click(browserPage.patternModeBtn);
        await browserPage.Cli.sendCommandInCli('flushdb');
    })('Search capability Refreshed Tree view preselected folder', async t => {
        keyName1 = Common.generateWord(10);
        keyName2 = Common.generateWord(10);
        keyNameSingle = Common.generateWord(10);
        keyNames = [`${keyName1}:1`, `${keyName1}:2`, `${keyName2}:1`, `${keyName2}:2`, keyNameSingle];
        const commands = [
            'flushdb',
            `HSET ${keyNames[0]} field value`,
            `HSET ${keyNames[1]} field value`,
            `RPUSH ${keyNames[2]} field`,
            `RPUSH ${keyNames[3]} field`,
            `SADD ${keyNames[4]} value`
        ];
        await browserPage.Cli.sendCommandsInCli(commands);
        await t.click(browserPage.treeViewButton);
        // The folder without any patterns selected and the list of keys is displayed when there is a folder without any patterns
        await verifyKeysDisplayingInTheList([keyNameSingle], true);

        await browserPage.TreeView.openTreeFolders([keyName1]); // Type: hash
        await browserPage.TreeView.openTreeFolders([keyName2]); // Type: list
        await browserPage.selectFilterGroupType(KeyTypesTexts.Hash);
        // Only related to key types filter folders are displayed
        await browserPage.TreeView.verifyFolderDisplayingInTheList(keyName1, true);
        await browserPage.TreeView.verifyFolderDisplayingInTheList(keyName2, false);
        await verifyKeysDisplayingInTheList([keyNames[0], keyNames[1]], false);

        await browserPage.setAllKeyType();
        await browserPage.Cli.sendCommandsInCli([`DEL ${keyNames[0]}`]);
        await t.click(browserPage.refreshKeysButton); // refresh keys
        // Only related to filter folders are displayed when key does not exist after keys refresh
        await browserPage.TreeView.verifyFolderDisplayingInTheList(keyName1, true);
        await browserPage.TreeView.verifyFolderDisplayingInTheList(keyName2, true);
        await verifyKeysDisplayingInTheList([keyNames[4]], true);
        await verifyKeysDisplayingInTheList([keyNames[0], keyNames[2], keyNames[3]], false);

        await browserPage.searchByKeyName('*');
        await t.click(browserPage.refreshKeysButton);
        // Search capability Refreshed Tree view preselected folder
        await browserPage.TreeView.verifyFolderDisplayingInTheList(keyName1, true);
        await browserPage.TreeView.verifyFolderDisplayingInTheList(keyName2, true);
        await verifyKeysDisplayingInTheList([keyNames[4]], true);
        await verifyKeysDisplayingInTheList([keyNames[0], keyNames[2], keyNames[3]], false);
    });
