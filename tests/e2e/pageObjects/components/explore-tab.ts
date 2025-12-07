import { Selector, t } from 'testcafe';

export class ExploreTab {
    dataStructureAccordionTutorialButton = Selector('[data-testid=ri-accordion-header-ds]');
    internalLinkWorkingWithHashes = Selector('[data-testid=internal-link-ds-hashes]');
    redisStackTutorialsButton = Selector('[data-testid=accordion-button-redis_stack]');
    timeSeriesLink = Selector('[data-testid=accordion-button-ds-ts]');
    internalTimeSeriesLink = Selector('[data-testid=internal-link-ds-ts-ret-compact]');
    scrolledEnablementArea = Selector('[data-testid=enablement-area__page]');
    closeEnablementPage = Selector('[data-testid=enablement-area__page-close]');
    tutorialLinkField = Selector('[data-testid=tutorial-link-field]');
    tutorialLatestDeleteIcon = Selector('[data-testid^=delete-tutorial-icon-]').nth(0);
    tutorialDeleteButton = Selector('button[data-testid^=delete-tutorial-]');
    preselectArea = Selector('[data-testid=enablementArea]');
    enablementAreaPagination = Selector('[data-testid=enablement-area__toggle-pagination-menu-btn]');
    paginationPopoverButtons = Selector('[data-testid=enablement-area__pagination-menu] [role=menuitem]');
    enablementAreaPaginationPopover = Selector('[data-testid=enablement-area__pagination-menu]');
    nextPageButton = Selector('[data-testid=enablement-area__next-page-btn]');
    prevPageButton = Selector('[data-testid=enablement-area__prev-page-btn]');
    guidesGraphAccordion = Selector('[data-testid=accordion-button-graph]');
    guidesIntroductionGraphLink = Selector('[data-testid=internal-link-introduction]');
    enablementAreaEmptyContent = Selector('[data-testid=enablement-area__empty-prompt]');
    tutorialsWorkingWithGraphLink = Selector('[data-testid=internal-link-working_with_graphs]');
    codeBlock = Selector('[data-testid=code-button-block-content]');
    codeBlockLabel = Selector('[data-testid=code-button-block-label]');
    cloudFreeLinkTooltip = Selector('[data-testid=tutorials-get-started-link]');
    openDatabasePopover = Selector('[data-testid=database-not-opened-popover]');
    tutorialPopoverConfirmRunButton = Selector('[data-testid=tutorial-popover-apply-run]');
    //Custom tutorials
    customTutorials = Selector('[data-testid=ri-accordion-header-custom-tutorials]');
    tutorialOpenUploadButton = Selector('[data-testid=open-upload-tutorial-btn]');
    tutorialSubmitButton = Selector('[data-testid=submit-upload-tutorial-btn]');
    tutorialImport = Selector('[data-testid=import-tutorial]');
    tutorialAccordionButton = Selector('[data-testid^=ri-accordion-header-]');
    uploadDataBulkBtn = Selector('[data-testid=upload-data-bulk-btn]');
    uploadDataBulkApplyBtn = Selector('[data-testid=upload-data-bulk-apply-btn]');
    downloadFileBtn = Selector('[data-testid=download-redis-upload-file]');
    tutorialLink = Selector('[data-testid=garnetinsight-link]');

    //CSS
    cssTutorialDeleteIcon = '[data-testid^=delete-tutorial-icon-]';

    runMask = '[data-testid="run-btn-$name"]';
    copyMask = '[data-testid="copy-btn-$name"]';

    /**
     * Run code
     * @param block Name of the block
     */
    async copyBlockCode(block: string): Promise<void> {
        const copyButton = Selector(this.copyMask.replace(/\$name/g, block));
        await t.scrollIntoView(copyButton);
        await t.click(copyButton);
    }

    /**
     * Run code
     * @param block Name of the block
     */
    async runBlockCode(block: string): Promise<void> {
        const runButton = Selector(this.runMask.replace(/\$name/g, block));
        await t.scrollIntoView(runButton);
        await t.click(runButton);
        if (await this.tutorialPopoverConfirmRunButton.exists) {
            await t.click(this.tutorialPopoverConfirmRunButton);
        }
    }

    /**
     * get code
     * @param block Name of the block
     */
    async getBlockCode(block: string): Promise<string> {
        return await this.codeBlockLabel.withExactText(block).parent().parent().nextSibling().textContent;
    }

    /**
     * get run selector
     * @param block Name of the block
     */
    getRunSelector(block: string): Selector {
        return Selector(this.runMask.replace(/\$name/g, block));
    }

    /**
     * Get selector with tutorial name
     * @param tutorialName name of the uploaded tutorial
     */
    getAccordionButtonWithName(tutorialName: string): Selector {
        return Selector(`[data-testid=ri-accordion-header-${tutorialName}]`);
    }

    /**
     * Get internal tutorial link with .md name
     * @param internalLink name of the .md file
     */
    getInternalLinkWithManifest(internalLink: string): Selector {
        return Selector(`[data-testid="internal-link-${internalLink}.md"]`);
    }

    /**
     * Find image in tutorial by alt text
     * @param alt Image alt text
     */
    getTutorialImageByAlt(alt: string): Selector {
        return Selector('img').withAttribute('alt', alt);
    }

    /**
     * Wait until image rendered
     * @param selector Image selector
     */
    async waitUntilImageRendered(selector: Selector): Promise<void> {
        const searchTimeout = 5 * 1000; // 5 sec maximum wait
        const startTime = Date.now();
        let imageHeight;

        do {
            imageHeight = await selector.getStyleProperty('height');
        }
        while ((imageHeight == '0px') && Date.now() - startTime < searchTimeout);
    }

    /**
     * Get internal tutorial link without .md name
     * @param internalLink name of the label
     */
    getInternalLinkWithoutManifest(internalLink: string): Selector {
        return Selector(`[data-testid="internal-link-${internalLink}"]`);
    }

    /**
     * Delete tutorial by name
     * @param name A tutorial name
     */
    async deleteTutorialByName(name: string): Promise<void> {
        const deleteTutorialBtn = this.tutorialAccordionButton.withText(name).find(this.cssTutorialDeleteIcon);
        if (await this.closeEnablementPage.exists) {
            await t.click(this.closeEnablementPage);
        }
        await this.toggleMyTutorialPanel();
        await t.click(deleteTutorialBtn);
        await t.click(this.tutorialDeleteButton);
    }

    /**
     * Find tutorial selector by name
     * @param name A tutorial name
     */
    getTutorialByName(name: string): Selector {
        return Selector('div').withText(name);
    }

    /**
     * Expand/Collapse My tutorial Panel
     * @param state State of panel
     */
    async toggleMyTutorialPanel(state: boolean = true): Promise<void> {
        const currentState = await this.customTutorials.getAttribute('aria-expanded') === 'true';
        if (currentState !== state) {
            await t.click(this.customTutorials);
        }
    }
}
