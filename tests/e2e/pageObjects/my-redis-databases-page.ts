import { t, Selector } from 'testcafe';
import { DatabaseAPIRequests } from '../helpers/api/api-database';
import { InsightsPanel } from './components/insights-panel';
import { BaseOverviewPage } from './base-overview-page';
import { NavigationPanel } from './components/navigation-panel';
import { NavigationHeader } from './components/navigation/navigation-header';
import { AuthorizationDialog } from './dialogs/authorization-dialog';
import { AddRedisDatabaseDialog } from './dialogs';

const databaseAPIRequests = new DatabaseAPIRequests();

export class MyRedisDatabasePage extends BaseOverviewPage {

    NavigationPanel = new NavigationPanel();
    AddRedisDatabaseDialog = new AddRedisDatabaseDialog();
    InsightsPanel = new InsightsPanel();
    NavigationHeader = new NavigationHeader();
    AuthorizationDialog = new AuthorizationDialog();

    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    // CSS Selectors
    cssNumberOfDbs = '[data-testid=number-of-dbs]';
    cssRedisStackIcon = '[data-testid=redis-stack-icon]';
    //BUTTONS
    deleteDatabaseButton = Selector('[data-testid^=delete-instance-]');
    confirmDeleteButton = Selector('[data-testid^=delete-instance-]').withExactText('Remove');
    deleteButtonInPopover = Selector('#deletePopover button');
    confirmDeleteAllDbButton = Selector('[data-testid=delete-selected-dbs]');
    editDatabaseButton = Selector('[data-testid^=edit-instance]');
    popoverHeader = Selector('#formModalHeader');
    submitChangesButton = Selector('[data-testid=btn-submit]');
    promoButton = Selector('[data-testid=promo-btn]');
    sortByDatabaseAlias = Selector('table th').withText('Database Alias');
    sortByHostAndPort = Selector('table th').withText('Host:Port');
    sortByConnectionType = Selector('table th').withText('Connection Type');
    importDatabasesBtn = Selector('[data-testid=option-btn-import]');
    retryImportBtn = Selector('[data-testid=btn-retry]');
    removeImportedFileBtn = Selector('[aria-label="Clear selected files"]');
    exportBtn = Selector('[data-testid=export-btn]');
    exportSelectedDbsBtn = Selector('[data-testid=export-selected-dbs]');
    userProfileBtn = Selector('[data-testid=user-profile-btn]');
    closeImportBtn = Selector('[data-testid=btn-close]');
    //CHECKBOXES
    selectAllCheckbox = Selector('[data-test-subj=checkboxSelectAll]');
    exportPasswordsCheckbox = Selector('[data-testid=export-passwords]~div', { timeout: 500 });
    starFreeDbCheckbox = Selector('[data-test-subj=checkboxSelectRow-create-free-cloud-db]');
    //ICONS
    moduleColumn = Selector('[data-test-subj=tableHeaderCell_modules_3]');
    moduleSearchIcon = Selector("[data-testid^='Redis Query Engine']");
    moduleGraphIcon = Selector('[data-testid^=Graph]');
    moduleJSONIcon = Selector('[data-testid^=JSON]');
    moduleTimeseriesIcon = Selector("[data-testid^='Time Series']");
    moduleBloomIcon = Selector('[data-testid^=Probabilistic]');
    moduleAIIcon = Selector('[data-testid^=AI]');
    moduleGearsIcon = Selector('[data-testid^=Gears]');
    redisStackIcon = Selector('[data-testid=redis-stack-icon]');
    tooltipRedisStackLogo = Selector('[data-testid=tooltip-redis-stack-icon]');
    iconNotUsedDatabase = Selector('[data-testid^=database-status-tryDatabase-]');
    iconDeletedDatabase = Selector('[data-testid^=database-status-checkIfDeleted-]');
    //TEXT INPUTS (also referred to as 'Text fields')
    searchInput = Selector('[data-testid=search-database-list]');
    importDatabaseInput = Selector('[data-testid=import-file-modal-filepicker]');
    //TEXT ELEMENTS
    moduleTooltip = Selector('[data-radix-popper-content-wrapper]');
    moduleQuantifier = Selector('[data-testid=_module]');
    dbNameList = Selector('[data-testid^=instance-name]', { timeout: 3000 });
    tableRowContent = Selector('[data-test-subj=database-alias-column]');
    hostPort = Selector('[data-testid=host-port]');
    failedImportMessage = Selector('[data-testid=result-failed]');
    importResult = Selector('[data-testid^=table-result-]');
    userProfileAccountInfo = Selector('[data-testid^=profile-account-]');
    portCloudDb = Selector('[class*=column_host]');
    // DIALOG
    successResultsAccordion = Selector('[data-testid^=success-results-]');
    partialResultsAccordion = Selector('[data-testid^=partial-results-]');
    failedResultsAccordion = Selector('[data-testid^=failed-results-]');
    notificationUnusedDbMessage = Selector('[class^=_warningTooltipContent]');
    // CONTAINERS
    databaseContainer = Selector('.databaseContainer');
    connectionTypeTitle  = Selector('[data-test-subj=tableHeaderCell_connectionType_2]');
    addDatabaseImport = Selector('[data-testid=add-db_import]');

    async navigateToDatabase(dbName: string): Promise<void> {
        await t.click(this.NavigationPanel.myRedisDBButton);
        await this.clickOnDBByName(dbName);
    }

    /**
     * Click on the database by name
     * @param dbName The name of the database to be opened
     */
    async clickOnDBByName(dbName: string): Promise<void> {
        if (await this.Toast.toastCloseButton.exists) {
            await t.click(this.Toast.toastCloseButton);
        }
        const db = this.dbNameList.withExactText(dbName.trim());
        await t.expect(db.exists).ok(`"${dbName}" database doesn't exist`, { timeout: 10000 });
        await t.click(db);
    }

    //Delete all the databases from the list
    async deleteAllDatabases(): Promise<void> {
        await t.click(this.NavigationPanel.myRedisDBButton);
        const dbNames = this.tableRowContent;
        const count = await dbNames.count;
        if (count > 1) {
            await t
                .click(this.selectAllCheckbox)
                .click(this.deleteButtonInPopover)
                .click(this.confirmDeleteAllDbButton);
        }
        else if (count === 1) {
            await t
                .click(this.deleteDatabaseButton)
                .click(this.confirmDeleteButton);
        }
        if (await this.Toast.toastCloseButton.exists) {
            await t.click(this.Toast.toastCloseButton);
        }
    }

    /**
     * Delete DB by name
     * @param dbName The name of the database to be deleted
     */
    async deleteDatabaseByName(dbName: string): Promise<void> {
        const dbNames = this.tableRowContent;
        const count = await dbNames.count;
        for (let i = 0; i < count; i++) {
            if ((await dbNames.nth(i).innerText || '').includes(dbName)) {
                await t
                    .click(this.deleteRowButton.nth(i-1))
                    .click(this.confirmDeleteButton);
                break;
            }
        }
    }

    /**
     * Click on the edit database button by name
     * @param databaseName The name of the database to be edited
     */
    async clickOnEditDBByName(databaseName: string): Promise<void> {
        const dbNames = this.dbNameList;
        const count = dbNames.count;
        for (let i = 0; i < await count; i++) {
            if ((await dbNames.nth(i).innerText || '').includes(databaseName)) {
                await t.click(this.editDatabaseButton.nth(i));
                break;
            }
        }
    }

    /**
     * Check module inside of tooltip
     * @param moduleNameList Array with modules list
     */
    async checkModulesInTooltip(moduleNameList: string[]): Promise<void> {
        for (const item of moduleNameList) {
            await t.expect(this.moduleTooltip.find('span').withText(`${item} v.`).exists).ok(item);
        }
    }

    /**
     * Check module icons on the page
     * @param moduleList Array with modules list
     */
    async checkModulesOnPage(moduleList: Selector[]): Promise<void> {
        for (const item of moduleList) {
            await t.expect(item.exists).ok(`${item} icon`);
        }
    }

    /**
     * Get all databases from List of DBs page
     */
    async getAllDatabases(): Promise<string[]> {

        const databases: string[] = [];
        await t.expect(this.dbNameList.exists).ok()
        const n = await this.dbNameList.count;
        for(let k = 0; k < n; k++) {
            const name = await this.dbNameList.nth(k).textContent;
            databases.push(name);
        }
        return databases;
    }

    /**
     * Get all databases from List of DBs page
     * @param actualList Actual databases list
     * @param sortedList Expected list
     */
    async compareDatabases(actualList: string[], sortedList: string[]): Promise<void> {
        for (let k = 0; k < actualList.length; k++) {
            await t.expect(actualList[k].trim()).eql(sortedList[k].trim());
        }
    }

    /**
     * Verify database status is visible
     * @param databaseName The name of the database
    */
    async verifyDatabaseStatusIsVisible(databaseName: string): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(databaseName);
        const databaseNewPoint = Selector(`[data-testid=database-status-new-${databaseId}]`);

        await t.expect(databaseNewPoint.exists).ok(`Database status is not visible for ${databaseName}`);
    }

    /**
    * Verify database status is not visible
    * @param databaseName The name of the database
    */
    async verifyDatabaseStatusIsNotVisible(databaseName: string): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(databaseName);
        const databaseEditBtn = Selector(`[data-testid=database-status-new-${databaseId}]`);

        await t.expect(databaseEditBtn.exists).notOk(`Database status is still visible for ${databaseName}`);
    }

    /**
    * Filter array with database objects by result field and return names
     * @param listOfDb Actual databases list
     * @param result The expected import result
    */
    getDatabaseNamesFromListByResult(listOfDb: DatabasesForImport, result: string): string[] {
        return listOfDb.filter(element => element.result === result).map(item => item.name!);
    }
}

/**
 * Database for import parameters
 * @param host Host of connection
 * @param port Port of connection
 * @param name The name of connection
 * @param result The expected result of connection import
 * @param username The username of connection
 * @param auth Password of connection
 * @param cluster Is the connection has cluster
 * @param indName The name of coonection with index
 * @param db The index of connection
 * @param ssh_port The ssh port of connection
 * @param timeout_connect The connect timeout of connection
 * @param timeout_execute The execute timeout of connection
 * @param other_field The test field
 * @param ssl Is the connection have ssl
 * @param ssl_ca_cert_path The CA certificate of connection by path
 * @param ssl_local_cert_path The Client certificate of connection by path
 * @param ssl_private_key_path The Client key of connection by path
 */
export type DatabasesForImport = {
    host?: string,
    port?: number | string,
    name?: string,
    result?: string,
    username?: string,
    auth?: string,
    cluster?: boolean | string,
    indName?: string,
    db?: number,
    ssh_port?: number,
    timeout_connect?: number,
    timeout_execute?: number,
    other_field?: string,
    ssl?: boolean,
    ssl_ca_cert_path?: string,
    ssl_local_cert_path?: string,
    ssl_private_key_path?: string
}[];
