import { Selector, t } from 'testcafe';

export class FiltersDialog {
    // INPUTS
    delimiterCombobox = Selector('[data-testid=delimiter-combobox]');
    delimiterComboboxInput = Selector('[data-testid=delimiter-combobox] input[data-test-subj=autoTagInput]');
    // BUTTONS
    treeViewDelimiterValueCancel = Selector('[data-testid=tree-view-cancel-btn]');
    treeViewDelimiterValueSave = Selector('[data-testid=tree-view-apply-btn]');
    sortingBtn = Selector('[data-testid=tree-view-sorting-select]');
    sortingASCoption = Selector('[data-testid=tree-view-sorting-item-ASC]').parent('[role=option]');
    sortingDESCoption = Selector('[data-testid=tree-view-sorting-item-DESC]').parent('[role=option]');

    /**
     * Get Delimiter badge selector by title
     * @param delimiterTitle title of the delimiter item
     */
    getDelimiterBadgeByTitle(delimiterTitle: string): Selector {
        return this.delimiterCombobox.find(`span[title='${delimiterTitle}']`);
    }

    /**
     * Get Delimiter close button selector by title
     * @param delimiterTitle title of the delimiter item
     */
    getDelimiterCloseBtnByTitle(delimiterTitle: string): Selector {
        return this.getDelimiterBadgeByTitle(delimiterTitle).find('button');
    }

    /**
     * Add new delimiter
     * @param delimiterName name of the delimiter item
     */
     async addDelimiterItem(delimiterName: string): Promise<void> {
        await t.click(this.delimiterComboboxInput);
        await t.typeText(this.delimiterComboboxInput, delimiterName, { paste: true }).pressKey('enter')
    }

    /**
     * Delete existing delimiter
     * @param delimiterName name of the delimiter item
     */
    async removeDelimiterItem(delimiterName: string): Promise<void> {
        await t.click(this.getDelimiterCloseBtnByTitle(delimiterName));
    }

    /**
     * Remove all existing delimiters in combobox
     */
    async clearDelimiterCombobox(): Promise<void> {
        const delimiters = this.delimiterCombobox.find('button');
        const count = await delimiters.count;
        for (let i = 0; i < count; i++) {
            await t.click(delimiters.nth(i));
        }
    }
}
