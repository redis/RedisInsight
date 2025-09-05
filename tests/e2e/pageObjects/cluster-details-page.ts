import { Selector } from 'testcafe';
import { InstancePage } from './instance-page';

export class ClusterDetailsPage extends InstancePage {
    //CSS Selectors
    cssTableRow = 'tbody tr';
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    overviewTab = Selector('[data-testid=analytics-tabs] [role=tab] p').withExactText('Overview').parent('[role=tab]');
    // COMPONENTS
    clusterDetailsUptime = Selector('[data-testid=cluster-details-uptime]');
    //TABLE COMPONENTS
    tableHeaderCell = Selector('[data-testid=primary-nodes-table] thead th');
    primaryNodesTable = Selector('[data-testid=primary-nodes-table]');
    tableRow = Selector('tbody tr');

    /**
     * Get Primary nodes count in table
     */
    async getPrimaryNodesCount(): Promise<number> {
        return await this.primaryNodesTable.find(this.cssTableRow).count;
    }

    /**
     * Get total value from all rows in column
     * @param column The column name
     */
    async getTotalValueByColumnName(column: string): Promise<number> {
        let totalNumber = 0;
        let columnInSelector = '';
        switch (column) {
            case 'Commands/s':
                columnInSelector = 'opsPerSecond';
                break;
            case 'Clients':
                columnInSelector = 'connectedClients';
                break;
            case 'Total Keys':
                columnInSelector = 'totalKeys';
                break;
            case 'Network Input':
                columnInSelector = 'networkInKbps';
                break;
            case 'Network Output':
                columnInSelector = 'networkOutKbps';
                break;
            case 'Total Memory':
                columnInSelector = 'usedMemory';
                break;
            default: columnInSelector = '';
        }
        const rowSelector = Selector(`[data-testid^=${columnInSelector}-value]`);
        for (let i = 0; i < await rowSelector.count; i++) {
            totalNumber += Number(await rowSelector.nth(i).textContent);
        }
        return totalNumber;
    }
}
