import { Selector, t } from 'testcafe';
import {
    AddNewDatabaseParameters,
    SentinelParameters,
    OSSClusterParameters
} from '../pageObjects/dialogs/add-redis-database-dialog';
import { DiscoverMasterGroupsPage } from '../pageObjects/sentinel/discovered-sentinel-master-groups-page';
import {
    MyRedisDatabasePage,
    BrowserPage,
    AutoDiscoverREDatabases
} from '../pageObjects';
import { UserAgreementDialog } from '../pageObjects/dialogs';
import { DatabaseAPIRequests } from './api/api-database';
import { RedisOverviewPage } from './constants';
import { RdiInstancesListPage } from '../pageObjects/rdi-instances-list-page';
import { updateControlNumber } from './insights';

const myRedisDatabasePage = new MyRedisDatabasePage();
const discoverMasterGroupsPage = new DiscoverMasterGroupsPage();
const autoDiscoverREDatabases = new AutoDiscoverREDatabases();
const browserPage = new BrowserPage();
const userAgreementDialog = new UserAgreementDialog();
const databaseAPIRequests = new DatabaseAPIRequests();
const rdiInstancesListPage = new RdiInstancesListPage();

export class DatabaseHelper {
    /**
     * Add a new database manually using host and port
     * @param databaseParameters The database parameters
     */
    async addNewStandaloneDatabase(
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        // Fill the add database form
        await myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDataBase(
            databaseParameters
        );
        // Click for saving
        await t
            .click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton)
            // Wait for database to be exist
            .expect(
                myRedisDatabasePage.dbNameList.withExactText(
                    databaseParameters.databaseName ?? ''
                ).exists
            )
            .ok('The database not displayed', { timeout: 10000 })
            // Close message
            .click(myRedisDatabasePage.Toast.toastCloseButton);
    }

    /**
     * Add a new database via autodiscover using Sentinel option
     * @param databaseParameters The Sentinel parameters: host, port and sentinel password
     */
    async discoverSentinelDatabase(
        databaseParameters: SentinelParameters
    ): Promise<void> {
        // Fill sentinel parameters to auto-discover Master Groups
        await myRedisDatabasePage.AddRedisDatabaseDialog.discoverSentinelDatabases(
            databaseParameters
        );
        // Click for autodiscover
        await t
            .click(
                myRedisDatabasePage.AddRedisDatabaseDialog
                    .addRedisDatabaseButton
            )
            .expect(discoverMasterGroupsPage.addPrimaryGroupButton.exists)
            .ok('User is not on the second step of Sentinel flow', {
                timeout: 10000
            });
        // Select Master Groups and Add to Garnet Insight
        await discoverMasterGroupsPage.addMasterGroups();
        await t.click(autoDiscoverREDatabases.viewDatabasesButton);
    }

    /**
     * Add a new database from RE Cluster via auto-discover flow
     * @param databaseParameters The database parameters
     */
    async addNewRedisSoftwareDatabase(
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        // Fill the add database form
        await myRedisDatabasePage.AddRedisDatabaseDialog.addAutodiscoverRedisSoftwareDatabase(
            databaseParameters
        );
        // Click on submit button
        await t
            .click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton)
            // Wait for database to be exist in the list of Autodiscover databases and select it
            .expect(
                autoDiscoverREDatabases.databaseName.withExactText(
                    databaseParameters.databaseName ?? ''
                ).exists
            )
            .ok('The database not displayed', { timeout: 10000 })
            .typeText(
                autoDiscoverREDatabases.search,
                databaseParameters.databaseName ?? ''
            )
            .click(autoDiscoverREDatabases.databaseCheckbox)
            // Click Add selected databases button
            .click(autoDiscoverREDatabases.addSelectedDatabases)
            .click(autoDiscoverREDatabases.viewDatabasesButton);
    }

    /**
     * Add a new database from OSS Cluster via auto-discover flow
     * @param databaseParameters The database parameters
     */
    async addOSSClusterDatabase(
        databaseParameters: OSSClusterParameters
    ): Promise<void> {
        // Enter required parameters for OSS Cluster
        await myRedisDatabasePage.AddRedisDatabaseDialog.addOssClusterDatabase(
            databaseParameters
        );
        // Click for saving
        await t
            .click(myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton)
            // Check for info message that DB was added
            .expect(myRedisDatabasePage.Toast.toastHeader.exists)
            .ok('Info message not exists', { timeout: 10000 })
            // Wait for database to be exist
            .expect(
                myRedisDatabasePage.dbNameList.withExactText(
                    databaseParameters.ossClusterDatabaseName
                ).exists
            )
            .ok('The database not displayed', { timeout: 10000 });
    }

    /**
     * Add a new database from Redis Cloud via auto-discover flow
     * @param cloudAPIAccessKey The Cloud API Access Key
     * @param cloudAPISecretKey The Cloud API Secret Key
     */
    async autodiscoverRedisCloudDatabase(
        cloudAPIAccessKey: string,
        cloudAPISecretKey: string
    ): Promise<string> {
        // Fill the add database form and Submit
        await myRedisDatabasePage.AddRedisDatabaseDialog.addAutodiscoverRedisCloudDatabase(
            cloudAPIAccessKey,
            cloudAPISecretKey
        );
        await t.click(
            myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton
        );
        await t
            .expect(
                autoDiscoverREDatabases.title.withExactText(
                    'Redis Cloud Subscriptions'
                ).exists
            )
            .ok('Subscriptions list not displayed', { timeout: 120000 });
        // Select subscriptions
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.selectAllCheckbox);
        await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.showDatabasesButton);
        // Select databases for adding
        const databaseName = await autoDiscoverREDatabases.getDatabaseName();
        await t.click(autoDiscoverREDatabases.databaseCheckbox);
        await t.click(autoDiscoverREDatabases.addSelectedDatabases);
        // Wait for database to be exist in the redis databases list
        await t
            .expect(
                autoDiscoverREDatabases.title.withExactText(
                    'Redis Enterprise Databases Added'
                ).exists
            )
            .ok('Added databases list not displayed', { timeout: 20000 });
        await t.click(autoDiscoverREDatabases.viewDatabasesButton);
        // uncomment when fixed db will be added to cloud subscription
        // await t.expect(myRedisDatabasePage.dbNameList.withExactText(databaseName).exists).ok('The database not displayed', { timeout: 10000 });
        return databaseName;
    }

    /**
     * Accept License terms and add database
     * @param databaseParameters The database parameters
     * @param databaseName The database name
     */
    async acceptLicenseTermsAndAddDatabase(
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        await this.acceptLicenseTerms();
        await this.addNewStandaloneDatabase(databaseParameters);
        // Connect to DB
        await myRedisDatabasePage.clickOnDBByName(
            databaseParameters.databaseName!
        );
    }

    /**
     * Accept License terms and add database using api
     * @param databaseParameters The database parameters
     * @param databaseName The database name
     */
    async acceptLicenseTermsAndAddDatabaseApi(
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        await this.acceptLicenseTerms();

        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName
        );

        if (!databaseId) {
            await databaseAPIRequests.addNewStandaloneDatabaseApi(
                databaseParameters
            );

            // Reload Page to see the new added database through api
            await myRedisDatabasePage.reloadPage();
        }

        // Connect to DB
        await myRedisDatabasePage.clickOnDBByName(
            databaseParameters.databaseName!
        );
    }

    /**
     * Accept License terms and add OSS cluster database
     * @param databaseParameters The database parameters
     * @param databaseName The database name
     */
    async acceptLicenseTermsAndAddOSSClusterDatabase(
        databaseParameters: OSSClusterParameters
    ): Promise<void> {
        await this.acceptLicenseTerms();

        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.ossClusterDatabaseName
        );

        if (!databaseId) {
            await this.addOSSClusterDatabase(databaseParameters);
        }

        // Connect to DB
        await myRedisDatabasePage.clickOnDBByName(
            databaseParameters.ossClusterDatabaseName!
        );
    }

    /**
     * Accept License terms and add Sentinel database using api
     * @param databaseParameters The database parameters
     */
    async acceptLicenseTermsAndAddSentinelDatabaseApi(
        databaseParameters: SentinelParameters
    ): Promise<void> {
        await this.acceptLicenseTerms();
        await databaseAPIRequests.discoverSentinelDatabaseApi(
            databaseParameters
        );
        // Reload Page to see the database added through api
        await myRedisDatabasePage.reloadPage();
        // Connect to DB
        await myRedisDatabasePage.clickOnDBByName(
            databaseParameters.masters![1].alias ?? ''
        );
    }

    /**
     * Accept License terms and add RE Cluster database
     * @param databaseParameters The database parameters
     */
    async acceptLicenseTermsAndAddRedisSoftwareDatabase(
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        await this.acceptLicenseTerms();
        await this.addNewRedisSoftwareDatabase(databaseParameters);
        // Connect to DB
        await myRedisDatabasePage.clickOnDBByName(
            databaseParameters.databaseName ?? ''
        );
    }

    /**
     * Accept License terms and add RE Cloud database
     * @param databaseParameters The database parameters
     */
    async acceptLicenseTermsAndAddRedisCloudDatabase(
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const searchTimeout = 60 * 1000; // 60 sec to wait database appearing
        const dbSelector = myRedisDatabasePage.dbNameList.withExactText(
            databaseParameters.databaseName ?? ''
        );
        const startTime = Date.now();

        await this.acceptLicenseTerms();
        await myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDataBase(
            databaseParameters
        );
        // Click for saving
        await t.click(
            myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton
        );
        await t.wait(3000);
        // Reload page until db appears
        do {
            await myRedisDatabasePage.reloadPage();
        } while (
            !(await dbSelector.exists) &&
            Date.now() - startTime < searchTimeout
        );
        await t
            .expect(
                myRedisDatabasePage.dbNameList.withExactText(
                    databaseParameters.databaseName ?? ''
                ).exists
            )
            .ok('The database not displayed', { timeout: 5000 });
        await myRedisDatabasePage.clickOnDBByName(
            databaseParameters.databaseName ?? ''
        );
        await t
            .expect(browserPage.keysSummary.exists)
            .ok('Key list not loaded', { timeout: 15000 });
    }

    /**
     * Add RE Cloud database
     * @param databaseParameters The database parameters
     */
    async addRedisCloudDatabase(
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const searchTimeout = 60 * 1000; // 60 sec to wait database appearing
        const dbSelector = myRedisDatabasePage.dbNameList.withExactText(
            databaseParameters.databaseName ?? ''
        );
        const startTime = Date.now();

        await myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDataBase(
            databaseParameters
        );
        // Click for saving
        await t.click(
            myRedisDatabasePage.AddRedisDatabaseDialog.addRedisDatabaseButton
        );
        await t.wait(3000);
        // Reload page until db appears
        do {
            await myRedisDatabasePage.reloadPage();
        } while (
            !(await dbSelector.exists) &&
            Date.now() - startTime < searchTimeout
        );
        await t
            .expect(
                myRedisDatabasePage.dbNameList.withExactText(
                    databaseParameters.databaseName ?? ''
                ).exists
            )
            .ok('The database not displayed', { timeout: 5000 });
    }

    // Accept License terms
    async acceptLicenseTerms(): Promise<void> {
        await t.maximizeWindow();
        await userAgreementDialog.acceptLicenseTerms();
        // Required since that file is used both in electron and web tests
        if(process.env.RI_SOCKETS_CORS){
            await updateControlNumber(48.2);
        }

        // Open default databases list tab if RDI opened
        if (await rdiInstancesListPage.addRdiInstanceButton.exists) {
            await myRedisDatabasePage.setActivePage(RedisOverviewPage.DataBase);
        }
        // TODO delete after releasing chatbot
        if (await myRedisDatabasePage.AddRedisDatabaseDialog.aiChatMessage.exists) {
            await t.click(myRedisDatabasePage.AddRedisDatabaseDialog.aiCloseMessage)
        }
    }

    // Accept License terms and connect to the RedisStack database
    async acceptLicenseAndConnectToRedisStack(): Promise<void> {
        await this.acceptLicenseTerms();
        //Connect to DB
        await t
            .click(myRedisDatabasePage.NavigationPanel.myRedisDBButton)
            .click(
                myRedisDatabasePage.AddRedisDatabaseDialog.connectToRedisStackButton
            );
    }

    /**
     * Delete database
     * @param databaseName The database name
     */
    async deleteDatabase(databaseName: string): Promise<void> {
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        if (
            await myRedisDatabasePage.AddRedisDatabaseDialog.addDatabaseButton.exists
        ) {
            await this.deleteDatabaseByNameApi(databaseName);
        }
    }

    /**
     * Delete database with custom name
     * @param databaseName The database name
     */
    async deleteCustomDatabase(databaseName: string): Promise<void> {
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        if (
            await myRedisDatabasePage.AddRedisDatabaseDialog.addDatabaseButton.exists
        ) {
            await myRedisDatabasePage.deleteDatabaseByName(databaseName);
        }
    }

    /**
     * Accept License terms and add database or connect to the Redis stask database
     * @param databaseParameters The database parameters
     * @param databaseName The database name
     */
    async acceptTermsAddDatabaseOrConnectToRedisStack(
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        if (
            await myRedisDatabasePage.AddRedisDatabaseDialog.addDatabaseButton.exists
        ) {
            await this.acceptLicenseTermsAndAddDatabase(databaseParameters);
        }
        else {
            await this.acceptLicenseAndConnectToRedisStack();
        }
    }

    /**
     * Click on the edit database button by name
     * @param databaseName The name of the database
     */
    async clickOnEditDatabaseByName(databaseName: string): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseName
        );
        const databaseEditBtn = Selector(
            `[data-testid=edit-instance-${databaseId}]`
        );

        await t
            .expect(databaseEditBtn.exists)
            .ok(`"${databaseName}" database not displayed`);
        await t.click(databaseEditBtn);
    }

    /**
     * Delete database button by name
     * @param databaseName The name of the database
     */
    async deleteDatabaseByNameApi(databaseName: string): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseName
        );
        const databaseDeleteBtn = Selector(
            `[data-testid=delete-instance-${databaseId}-icon]`
        );

        await t
            .expect(databaseDeleteBtn.exists)
            .ok(`"${databaseName}" database not displayed`);
        await t.click(databaseDeleteBtn);
        await t.click(myRedisDatabasePage.confirmDeleteButton);
    }
}
