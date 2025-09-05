import { Selector, t } from 'testcafe';
import { Common } from '../../../helpers/common';
import { FiltersDialog } from '../../dialogs';

export class TreeView {
    FiltersDialog = new FiltersDialog();

    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    treeViewSettingsBtn = Selector('[data-testid=tree-view-settings-btn]');
    sortingProgressBar = Selector('[data-testid=progress-key-tree]');
    // TEXT ELEMENTS
    treeViewKeysNumber = Selector('[data-testid^=count_]');
    treeViewDeviceFolder = Selector('[data-testid^=node-item_device] div');

    /**
     * Get folder selector by folder name
     * @param folderName The name of the folder
     */
    getFolderSelectorByName(folderName: string): Selector {
        return Selector(`[data-testid^="node-item_${folderName}"]`);
    }

    /**
     * Get folder counter selector by folder name
     * @param folderName The name of the folder
     */
    getFolderCountSelectorByName(folderName: string): Selector {
        return Selector(`[data-testid^="count_${folderName}"]`);
    }

    /**
    * Verifying if the Keys are in the List of keys
    * @param keyNames The names of the keys
    * @param isDisplayed True if keys should be displayed
    */
    async verifyFolderDisplayingInTheList(folderName: string, isDisplayed: boolean): Promise<void> {
        isDisplayed
            ? await t.expect(this.getFolderSelectorByName(folderName).exists).ok(`The folder ${folderName} not found`)
            : await t.expect(this.getFolderSelectorByName(folderName).exists).notOk(`The folder ${folderName} found`);
    }

    /**
     * Change delimiter value
     * @param delimiter string with delimiter value
     */
    async changeDelimiterInTreeView(delimiter: string): Promise<void> {
        // Open delimiter popup
        await t.click(this.treeViewSettingsBtn);
        await this.FiltersDialog.clearDelimiterCombobox();
        // Apply new value to the field
        await this.FiltersDialog.addDelimiterItem(delimiter);
        // Click on save button
        await t.click(this.FiltersDialog.treeViewDelimiterValueSave);
    }

    /**
     * Change ordering value
     * @param order ASC/DESC ordering for tree view
     */
    async changeOrderingInTreeView(order: string): Promise<void> {
        // Open settings popup
        await t.click(this.treeViewSettingsBtn);
        await t.click(this.FiltersDialog.sortingBtn);
        order === 'ASC'
            ? await t.click(this.FiltersDialog.sortingASCoption)
            : await t.click(this.FiltersDialog.sortingDESCoption);

        // Click on save button
        await t.click(this.FiltersDialog.treeViewDelimiterValueSave);
        await Common.waitForElementNotVisible(this.sortingProgressBar);
    }

    /**
    * Get text from tree element by number
    * @param number The number of tree folder
    */
    async getTextFromNthTreeElement(number: number): Promise<string> {
        return (await Selector('[role="treeitem"]').nth(number).find('[data-testid^=folder-]').textContent).replace(/\s/g, '');
    }

    /**
    * Open tree folder with multiple level
    * @param names folder names with sequence of subfolder
    */
    async openTreeFolders(names: string[]): Promise<void> {
        let base = `node-item_${names[0]}`;
        await this.clickElementIfNotExpanded(base);
        if (names.length > 1) {
            for (let i = 1; i < names.length; i++) {
                base = `${base}:${names[i]}:`;
                await this.clickElementIfNotExpanded(base);
            }
        }
    }

    /**
    * Get all keys from tree view list with order
    */
    async getAllItemsArray(): Promise<string[]> {
        const textArray: string[] = [];
        const treeViewItemElements = Selector('[role="treeitem"]');
        const itemCount = await treeViewItemElements.count;

        for (let i = 0; i < itemCount; i++) {
            const treeItem = treeViewItemElements.nth(i);
            const keyItem = treeItem.find('[data-testid^="key-"]');
            if (await keyItem.exists) {
                textArray.push(await keyItem.textContent);
            }
        }

        return textArray;
    }

    /**
     * click on the folder element if it is not expanded
     * @param base the base element
     */
    private async clickElementIfNotExpanded(base: string): Promise<void> {
        const baseSelector = Selector(`[data-testid^="${base}"]`);
        const  elementSelector = await baseSelector.getAttribute('data-testid');
        if (!elementSelector?.includes('expanded')) {
            await t.click(Selector(`[data-testid^="${base}"]`));
        }
    }
}
