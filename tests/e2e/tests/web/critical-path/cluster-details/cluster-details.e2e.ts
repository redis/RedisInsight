import { Selector } from 'testcafe';
import { BrowserPage, MyRedisDatabasePage, ClusterDetailsPage, WorkbenchPage } from '../../../../pageObjects';
import { ExploreTabs, rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { commonUrl, ossClusterConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';

const clusterDetailsPage = new ClusterDetailsPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const headerColumns = {
    'Type': 'OSS Cluster',
    'Version': '7.0.0',
    'User': 'default'
};
type HeaderColumn = keyof typeof headerColumns;

const keyName = Common.generateWord(10);
const commandToAddKey = `set ${keyName} test`;

fixture `Overview`
    .meta({ type: 'critical_path', rte: rte.ossCluster })
    .page(commonUrl)
    .beforeEach(async t => {
        await databaseHelper.acceptLicenseTermsAndAddOSSClusterDatabase(ossClusterConfig);
        // Go to Analysis Tools page
        await t.click(browserPage.NavigationTabs.analysisButton);
    });
test('Overview tab header for OSS Cluster', async t => {
    const uptime = /[1-9][0-9]\s|[0-9]\smin|[1-9][0-9]\smin|[0-9]\sh/;

    // Verify that user see "Overview" tab by default for OSS Cluster
    await t.expect(clusterDetailsPage.overviewTab.withAttribute('aria-selected', 'true').exists).ok('The Overview tab not opened');
    // Verify that user see "Overview" header with OSS Cluster info
    for (const key in headerColumns) {
        const columnSelector = Selector(`[data-testid=cluster-details-item-${key}]`);
        await t.expect(columnSelector.textContent).contains(`${headerColumns[key as HeaderColumn]}`, `Cluster detail ${key} is incorrect`);
    }
    // Verify that Uptime is displayed as time in seconds or minutes from start
    await t.expect(clusterDetailsPage.clusterDetailsUptime.textContent).match(uptime, 'Uptime value is not correct');
});
// todo: enable after RI-7449 fix
test.skip
    .after(async() => {
    //Clear database and delete
        await browserPage.Cli.sendCommandInCli(`DEL ${keyName}`);
        await browserPage.Cli.sendCommandInCli('FT.DROPINDEX idx:schools DD');
        await databaseAPIRequests.deleteOSSClusterDatabaseApi(ossClusterConfig);
    })('Primary node statistics table displaying', async t => {
    // Remember initial table values
        const initialValues: number[] = [];
        const nodes = (await databaseAPIRequests.getClusterNodesApi(ossClusterConfig)).sort();
        const columns = ['Commands/s', 'Clients', 'Total Keys', 'Network Input', 'Network Output', 'Total Memory'];

        for (const column in columns) {
            initialValues.push(await clusterDetailsPage.getTotalValueByColumnName(column));
        }
        const nodesNumberInHeader = parseInt((await clusterDetailsPage.tableHeaderCell.nth(0).textContent).match(/\d+/)![0]);

        // Add key from CLI
        await t.click(browserPage.Cli.cliExpandButton);
        await t.typeText(browserPage.Cli.cliCommandInput, commandToAddKey);
        await t.pressKey('enter');
        await t.click(browserPage.Cli.cliCollapseButton);
        // Verify nodes in header column equal to rows
        await t.expect(await clusterDetailsPage.getPrimaryNodesCount()).eql(nodesNumberInHeader, 'Primary nodes in table are not displayed');

        // todo: change verification of nodes since order is not guaranteed
        // Verify that all nodes from BE response are displayed in table
        for (const node of nodes) {
            await t.expect(clusterDetailsPage.tableRow.nth(nodes.indexOf(node)).textContent).contains(node, `Node ${node} is not displayed in table`);
        }
        //Run Create hash index command to load network and memory
        await clusterDetailsPage.NavigationHeader.togglePanel(true);
        const tutorials = await clusterDetailsPage.InsightsPanel.setActiveTab(ExploreTabs.Tutorials);

        await t.click(tutorials.dataStructureAccordionTutorialButton);
        await t.click(tutorials.internalLinkWorkingWithHashes);
        await tutorials.runBlockCode('Create a hash');
        // Go to Analysis Tools page
        await t.click(browserPage.NavigationTabs.analysisButton);
        // Verify that values in table are dynamic
        for (const column in columns) {
            await t.expect(await clusterDetailsPage.getTotalValueByColumnName(column)).notEql(initialValues[columns.indexOf(column)], `${column} not dynamic`);
        }
    });
