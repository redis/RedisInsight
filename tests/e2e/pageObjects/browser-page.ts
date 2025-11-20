import { Selector, t } from 'testcafe';
import { Common } from '../helpers/common';
import { InstancePage } from './instance-page';
import { BulkActions, TreeView } from './components/browser';
import { AddElementInList } from '../helpers/constants';
import { createEnhancedSelector, EnhancedSelector } from './enhanced-selector';

export class BrowserPage extends InstancePage {
    BulkActions = new BulkActions();
    TreeView = new TreeView();

    //CSS Selectors
    cssSelectorGrid = '[aria-label="grid"]';
    cssSelectorRows = '[aria-label="row"]';
    cssSelectorKey = '[data-testid^=key-]';
    cssFilteringLabel = '[data-testid=multi-search]';
    cssJsonValue = '[data-testid=value-as-json]';
    cssRowInVirtualizedTable = '[role=gridcell]';
    cssVirtualTableRow = '[aria-label=row]';
    cssKeyBadge = '[data-testid^=badge-]';
    cssKeyTtl = '[data-testid^=ttl-]';
    cssKeySize = '[data-testid^=size-]';
    cssRemoveSuggestionItem = '[data-testid^=remove-suggestion-item-]';

    //BUTTONS
    applyButton = Selector('[data-testid=apply-btn]');
    deleteKeyButton = Selector('[data-testid=delete-key-btn]');
    submitDeleteKeyButton = Selector('[data-testid=submit-delete-key]');
    confirmDeleteKeyButton = Selector('[data-testid=delete-key-confirm-btn]');
    editKeyTTLButton = Selector('[data-testid=edit-ttl-btn]');
    refreshKeysButton = Selector('[data-testid=keys-refresh-btn]');
    refreshKeyButton = Selector('[data-testid=key-refresh-btn]');
    editKeyNameButton = Selector('[data-testid=edit-key-btn]');
    editKeyValueButton = Selector('[data-testid=edit-key-value-btn]', { timeout: 500 });
    closeKeyButton = Selector('[data-testid=close-key-btn]');
    plusAddKeyButton = Selector('[data-testid=btn-add-key]');
    addKeyValueItemsButton = Selector('[data-testid=add-key-value-items-btn]');
    saveHashFieldButton = Selector('[data-testid=save-fields-btn]');
    saveMemberButton = Selector('[data-testid=save-members-btn]');
    searchButtonInKeyDetails = Selector('[data-testid=search-button]');
    addKeyButton = Selector('button').withExactText('Add Key');
    keyTypeDropDown = Selector('[data-testid=select-key-type]');
    confirmRemoveHashFieldButton = Selector('[role=dialog] [data-testid^=remove-hash-button]');
    removeSetMemberButton = Selector('[data-testid^=set-remove-btn]');
    removeHashFieldButton = Selector('[data-testid^=remove-hash-button]');
    removeZsetMemberButton = Selector('[data-testid^=zset-remove-button]');
    confirmRemoveSetMemberButton = Selector('[role=dialog] [data-testid^=set-remove-btn-]');
    confirmRemoveZSetMemberButton = Selector('[role=dialog] [data-testid^=zset-remove-button-]');
    saveElementButton = Selector('[data-testid=save-elements-btn]');
    removeElementFromListIconButton = Selector('[data-testid=remove-key-value-items-btn]');
    removeElementFromListButton = Selector('[data-testid=remove-elements-btn]');
    confirmRemoveListElementButton = Selector('[data-testid=remove-submit]');
    removeElementFromListSelect = Selector('[data-testid=destination-select]');
    destinationSelect = Selector('[data-testid=destination-select]');
    addJsonObjectButton = Selector('[data-testid=add-object-btn]');
    addJsonFieldButton = Selector('[data-testid=add-field-btn]');
    expandJsonObject = Selector('[data-testid=expand-object]');
    scoreButton = Selector('[data-testid=score-button]');
    sortingButton = Selector('[data-testid=header-sorting-button]');
    editJsonObjectButton = Selector('[data-testid=edit-json-field]');
    applyEditButton = Selector('[data-testid=apply-edit-btn]');
    cancelEditButton = Selector('[data-testid=cancel-edit-btn]');
    scanMoreButton = Selector('[data-testid=scan-more]');
    resizeBtnKeyList = Selector('[data-test-subj=resize-btn-keyList-keyDetails]');
    treeViewButton = Selector('[data-testid=view-type-list-btn]');
    browserViewButton = Selector('[data-testid=view-type-browser-btn]');
    searchButton = Selector('[data-testid=search-btn]');
    clearFilterButton = Selector('[data-testid=reset-filter-btn]');
    fullScreenModeButton = Selector('[data-testid=toggle-full-screen]');
    closeRightPanel = Selector('[data-testid=close-right-panel-btn]');
    addNewStreamEntry = Selector('[data-testid=add-key-value-items-btn]');
    removeEntryButton = Selector('[data-testid^=remove-entry-button-]');
    confirmRemoveEntryButton = Selector('[data-testid^=remove-entry-button-]').withExactText('Remove');
    clearStreamEntryInputs = Selector('[data-testid=remove-item]');
    saveGroupsButton = Selector('[data-testid=save-groups-btn]');
    acknowledgeButton = Selector('[data-testid=acknowledge-btn]');
    confirmAcknowledgeButton = Selector('[data-testid=acknowledge-submit]');
    claimPendingMessageButton = Selector('[data-testid=claim-pending-message]');
    submitButton = Selector('[data-testid=btn-submit]');
    consumerDestinationSelect = Selector('[data-testid=destination-select]');
    removeConsumerButton = Selector('[data-testid^=remove-consumer-button]');
    removeConsumerGroupButton = Selector('[data-testid^=remove-groups-button]');
    optionalParametersSwitcher = Selector('[data-testid=optional-parameters-switcher]');
    forceClaimCheckbox = Selector('[data-testid=force-claim-checkbox]').sibling();
    editStreamLastIdButton = Selector('[data-testid^=stream-group_edit-btn]');
    saveButton = Selector('[data-testid=save-btn]');
    bulkActionsButton = Selector('[data-testid=btn-bulk-actions]');
    editHashButton = Selector('[data-testid^=hash_edit-btn-]');
    editHashFieldTtlButton = Selector('[data-testid^=hash-ttl_edit-btn-]', { timeout: 500 });
    editZsetButton = Selector('[data-testid^=zset_edit-btn-]');
    editListButton = Selector('[data-testid^=list_edit-btn-]');
    cancelStreamGroupBtn = Selector('[data-testid=cancel-stream-groups-btn]');
    patternModeBtn = Selector('[data-testid=search-mode-pattern-btn]');
    redisearchModeBtn = Selector('[data-testid=search-mode-redisearch-btn]');
    showFilterHistoryBtn = Selector('[data-testid=show-suggestions-btn]');
    clearFilterHistoryBtn = Selector('[data-testid=clear-history-btn]');
    loadSampleDataBtn = Selector('[data-testid=load-sample-data-btn]');
    executeBulkKeyLoadBtn = Selector('[data-testid=load-sample-data-btn-confirm]');
    backToBrowserBtn = Selector('[data-testid=back-right-panel-btn]');
    loadAllBtn = Selector('[data-testid=load-all-value-btn]');
    downloadAllValueBtn = Selector('[data-testid=download-all-value-btn]');
    openTutorialsBtn = Selector('[data-testid=explore-msg-btn]')
    keyItem = Selector('[data-testid*="node-item"][data-testid*="keys:"]');
    columnsBtn = Selector('[data-testid=btn-columns-actions]')
    //CONTAINERS
    streamGroupsContainer = Selector('[data-testid=stream-groups-container]');
    streamConsumersContainer = Selector('[data-testid=stream-consumers-container]');
    breadcrumbsContainer = Selector('[data-testid=breadcrumbs-container]');
    virtualTableContainer = Selector('[data-testid=virtual-table-container]');
    streamEntriesContainer = Selector('[data-testid=stream-entries-container]');
    streamMessagesContainer = Selector('[data-testid=stream-messages-container]');
    loader = Selector('[data-testid=type-loading]');
    newIndexPanel = Selector('[data-testid=create-index-panel]');
    //LINKS
    internalLinkToWorkbench = Selector('[data-testid=internal-workbench-link]');
    userSurveyLink = Selector('[data-testid=user-survey-link]');
    redisearchFreeLink = Selector('[data-testid=get-started-link]');
    guideLinksBtn = Selector('[data-testid^=guide-button-]');
    //OPTION ELEMENTS
    stringOption = Selector('[data-test-subj=string]').parent('[role=option]');
    jsonOption = Selector('[data-test-subj=ReJSON-RL]').parent('[role=option]');
    setOption = Selector('[data-test-subj=set]').parent('[role=option]');
    zsetOption = Selector('[data-test-subj=zset]').parent('[role=option]');
    listOption = Selector('[data-test-subj=list]').parent('[role=option]');
    hashOption = Selector('[data-test-subj=hash]').parent('[role=option]');
    streamOption = Selector('[data-test-subj=stream]').parent('[role=option]');
    pushToTailSelection = Selector('[role=option] span').withExactText('Push to tail').parent('[role=option]');
    pushToHeadSelection = Selector('[role=option] span').withExactText('Push to head').parent('[role=option]');
    removeFromHeadSelection = Selector('span').withExactText('Remove from head').parent('[role=option]');
    filterOptionType = Selector('[data-test-subj^=filter-option-type-]');
    filterByKeyTypeDropDown = Selector('[data-testid=select-filter-key-type]', { timeout: 500 });
    filterAllKeyType = Selector('[role=option] span').withExactText('All Key Types').parent('[role=option]');
    consumerOption = Selector('[data-testid=consumer-option]');
    claimTimeOptionSelect = Selector('[data-testid=time-option-select]');
    relativeTimeOption = Selector('#idle');
    timestampOption = Selector('#time');
    formatSwitcher = Selector('[data-testid=select-format-key-value]', { timeout: 2000 });
    formatSwitcherIcon = Selector('[data-testid^=key-value-formatter-option-selected]');
    refreshIndexButton = Selector('[data-testid=refresh-indexes-btn]');
    selectIndexDdn = Selector('[data-testid=select-index-placeholder],[data-testid=select-search-mode]', { timeout: 1000 });
    createIndexBtn = Selector('[data-testid=create-index-btn]');
    cancelIndexCreationBtn = Selector('[data-testid=create-index-cancel-btn]');
    confirmIndexCreationBtn = Selector('[data-testid=create-index-btn]');
    resizeTrigger = Selector('[data-testid^=resize-trigger-]');
    filterHistoryOption = Selector('[data-testid^=suggestion-item-]');
    filterHistoryItemText = Selector('[data-testid=suggestion-item-text]');
    //TABS
    streamTabGroups = Selector('[data-testid=stream-details] [role=tablist] p').withExactText('Consumer Groups').parent('[role=tab]');
    streamTabConsumers = Selector('[data-testid=stream-details] [role=tab][aria-controls*=-content-Consumers]');
    streamTabs = Selector('[data-testid=stream-tabs]');
    //TEXT INPUTS (also referred to as 'Text fields')
    addKeyNameInput = Selector('[data-testid=key]');
    keyNameInput = Selector('[data-testid=edit-key-input]');
    keyTTLInput = Selector('[data-testid=ttl]');
    editKeyTTLInput = Selector('[data-testid=edit-ttl-input]');
    ttlText = Selector('[data-testid=key-ttl-text] span');
    hashFieldValueInput = Selector('[data-testid=field-value]');
    hashFieldNameInput = Selector('[data-testid=field-name]');
    hashFieldValueEditor = Selector('[data-testid^=hash_value-editor]');
    hashTtlFieldInput = Selector('[data-testid=hash-ttl]');
    listKeyElementEditorInput = Selector('[data-testid^=list_value-editor-]');
    stringKeyValueInput = Selector('[data-testid=string-value]');
    jsonKeyValueInput = Selector('[data-mode-id=json]');
    jsonUploadInput = Selector('[data-testid=upload-input-file]');
    setMemberInput = Selector('[data-testid=member-name]');
    zsetMemberScoreInput = Selector('[data-testid=member-score]');
    filterByPatterSearchInput = Selector('[data-testid=search-key]');
    hashFieldInput = Selector('[data-testid=hash-field]');
    hashValueInput = Selector('[data-testid=hash-value]');
    searchInput = Selector('[data-testid=search]');
    jsonKeyInput = Selector('[data-testid=json-key]');
    jsonValueInput = Selector('[data-testid=json-value]');
    countInput = Selector('[data-testid=count-input]');
    streamEntryId = Selector('[data-testid=entryId]');
    streamField = Selector('[data-testid=field-name]');
    streamValue = Selector('[data-testid=field-value]');
    addAdditionalElement = Selector('[data-testid=add-item]');
    streamFieldsValues = Selector('[data-testid^=stream-entry-field-]');
    streamEntryIDDateValue = Selector('[data-testid^=stream-entry-][data-testid$=date]');
    groupNameInput = Selector('[data-testid=group-name-field]');
    consumerIdInput = Selector('[data-testid=id-field]');
    streamMinIdleTimeInput = Selector('[data-testid=min-idle-time]');
    claimIdleTimeInput = Selector('[data-testid=time-count]');
    claimRetryCountInput = Selector('[data-testid=retry-count]');
    lastIdInput = Selector('[data-testid=last-id-field]');
    inlineItemEditor = Selector('[data-testid=inline-item-editor]');
    indexNameInput = Selector('[data-testid=index-name]');
    prefixFieldInput = Selector('[data-test-subj=comboBoxInput]');
    indexIdentifierInput = Selector('[data-testid^=identifier-]');
    //TEXT ELEMENTS
    keySizeDetails = Selector('[data-testid=key-size-text]');
    keyLengthDetails = Selector('[data-testid=key-length-text]');
    keyNameInTheList = Selector(this.cssSelectorKey);
    hashFieldsList = Selector('[data-testid^=hash-field-] span');
    hashValuesList = Selector('[data-testid^=hash_content-value-] p');
    hashField = Selector('[data-testid^=hash-field-]').nth(0);
    hashFieldValue = Selector('[data-testid^=hash_content-value-]');
    setMembersList = Selector('[data-testid^=set-member-value-]');
    zsetMembersList = Selector('[data-testid^=zset-member-value-]');
    zsetScoresList = Selector('[data-testid^=zset_content-value-]');
    listElementsList = Selector('[data-testid^=list_content-value-]');
    jsonKeyValue = createEnhancedSelector('[data-testid=json-data]');
    jsonError = Selector('[data-testid=edit-json-error]');
    tooltip = Selector('[role=tooltip]', { timeout: 500 });
    dialog = Selector('[role=dialog]', { timeout: 500 });
    noResultsFound = Selector('[data-test-subj=no-result-found]');
    noResultsFoundOnly = Selector('[data-testid=no-result-found-only]');
    searchAdvices = Selector('[data-test-subj=search-advices]');
    keysNumberOfResults = Selector('[data-testid=keys-number-of-results]');
    scannedValue = Selector('[data-testid=keys-number-of-scanned]');
    totalKeysNumber = Selector('[data-testid=keys-total]');
    keyDetailsBadge = Selector('[data-testid=key-details-header] [data-testid^=badge-]');
    modulesTypeDetails = Selector('[data-testid=modules-type-details]');
    filteringLabel = Selector('[data-testid^=badge-]');
    keysSummary = Selector('[data-testid=keys-summary]');
    multiSearchArea = Selector(this.cssFilteringLabel);
    keyDetailsHeader = Selector('[data-testid=key-details-header]');
    keyListTable = Selector('[data-testid=keyList-table]');
    keyListMessage = Selector('[data-testid=no-result-found-msg]');
    keyDetailsTable = Selector('[data-testid=key-details]');
    keyNameFormDetails = Selector('p[data-testid=edit-key-input]');
    keyDetailsTTL = Selector('[data-testid=key-ttl-text]');
    progressLine = Selector('div.euiProgress');
    progressKeyList = Selector('[data-testid=progress-key-list]');
    jsonScalarValue = Selector('[data-testid=json-scalar-value]');
    noKeysToDisplayText = Selector('[data-testid=no-result-found-msg]');
    streamEntryDate = Selector('[data-testid*=-date][data-testid*=stream-entry]');
    streamEntryIdValue = Selector('.streamItemId[data-testid*=stream-entry]');
    streamFields = Selector('[data-testid=stream-entries-container] .truncateText');
    streamVirtualContainer = Selector('[data-testid=virtual-grid-container] div div').nth(0);
    streamEntryFields = Selector('[data-testid^=stream-entry-field]');
    confirmationMessagePopover = Selector('[role=dialog][data-state=open]');
    streamGroupId = Selector('.streamItemId[data-testid^=stream-group-id]');
    streamGroupName = Selector('[data-testid^=stream-group-name]');
    streamMessage = Selector('[data-testid*=-date][data-testid^=stream-message]');
    streamConsumerName = Selector('[data-testid^=stream-consumer-]');
    consumerGroup = Selector('[data-testid^=stream-group-]');
    entryIdInfoIcon = Selector('[data-testid=entry-id-info-icon]');
    entryIdError = Selector('[data-testid=id-error]');
    pendingCount = Selector('[data-testid=pending-count]');
    streamRangeBar = Selector('[data-testid=mock-fill-range]');
    rangeLeftTimestamp = Selector('[data-testid=range-left-timestamp]');
    rangeRightTimestamp = Selector('[data-testid=range-right-timestamp]');
    jsonValue = Selector('[data-testid=value-as-json]');
    stringValueAsJson = Selector(this.cssJsonValue);
    // POPUPS
    changeValueWarning = Selector('[data-testid=approve-popover]');
    // TABLE
    keyListItem = Selector('[role=rowgroup] [role=row]');
    // Dialog
    noReadySearchDialogTitle = Selector('[data-testid=welcome-page-title]');
    //checkbox
    showTtlCheckbox =  Selector('[data-testid=test-check-ttl]~label');
    showTtlColumnCheckbox =  Selector('[data-testid=show-ttl]~label');
    showSizeColumnCheckbox =  Selector('[data-testid=show-key-size]~label');

    //Get Hash key field ttl value
    //for Redis databases 7.4 and higher
    getHashTtlFieldInput = (fieldName: string): EnhancedSelector => (createEnhancedSelector(`[data-testid=hash-ttl_content-value-${fieldName}]`));
    getListElementInput = (count: number): Selector => (Selector(`[data-testid*=element-${count}]`));
    getKeySize = (keyName: string): Selector => (Selector(`[data-testid=size-${keyName}]`));
    getKeyTTl = (keyName: string): Selector => (Selector(`[data-testid=ttl-${keyName}]`));


    /**
     * Common part for Add any new key
     * @param keyName The name of the key
     * @param TTL The Time to live value of the key
     */
    async commonAddNewKey(keyName: string, TTL?: string): Promise<void> {
        await Common.waitForElementNotVisible(this.progressLine);
        await Common.waitForElementNotVisible(this.loader);
        await t
            .click(this.plusAddKeyButton)
            .click(this.addKeyNameInput)
            .typeText(this.addKeyNameInput, keyName, { replace: true, paste: true });
        if (TTL !== undefined) {
            await t
                .click(this.keyTTLInput)
                .typeText(this.keyTTLInput, TTL, { replace: true, paste: true });
        }
        await t.click(this.keyTypeDropDown);
    }

    /**
     * Adding a new String key
     * @param keyName The name of the key
     * @param TTL The Time to live value of the key
     * @param value The key value
     */
    async addStringKey(keyName: string, value = ' ', TTL?: string): Promise<void> {
        await t.click(this.plusAddKeyButton);
        await t.click(this.keyTypeDropDown);
        await t.click(this.stringOption);
        await t.click(this.addKeyNameInput);
        await t.typeText(this.addKeyNameInput, keyName, { replace: true, paste: true });
        if (TTL !== undefined) {
            await t.click(this.keyTTLInput)
                .typeText(this.keyTTLInput, TTL, { replace: true, paste: true });
        }
        await t.click(this.stringKeyValueInput);
        await t.typeText(this.stringKeyValueInput, value);
        await t.click(this.addKeyButton);
    }

    /**
     *Adding a new Json key
     * @param keyName The name of the key
     * @param value The key value
     * @param TTL The Time to live value of the key (optional parameter)
     */
    async addJsonKey(keyName: string, value: string, TTL?: string): Promise<void> {
        await t.click(this.plusAddKeyButton);
        await t.click(this.keyTypeDropDown);
        await t.click(this.jsonOption);
        await t.click(this.addKeyNameInput);
        await t.typeText(this.addKeyNameInput, keyName, { replace: true, paste: true });
        await t.click(this.jsonKeyValueInput);
        await t.typeText(this.jsonKeyValueInput, value, { replace: true, paste: true });
        if (TTL !== undefined) {
            await t.click(this.keyTTLInput);
            await t.typeText(this.keyTTLInput, TTL);
        }
        await t.click(this.addKeyButton);
    }

    /**
     * Adding a new Set key
     * @param keyName The name of the key
     * @param TTL The Time to live value of the key
     * @param members The key members
     */
    async addSetKey(keyName: string, TTL = ' ', members = ' '): Promise<void> {
        if (await this.Toast.toastCloseButton.exists) {
            await t.click(this.Toast.toastCloseButton);
        }
        await Common.waitForElementNotVisible(this.progressLine);
        await Common.waitForElementNotVisible(this.loader);
        await t.click(this.plusAddKeyButton);
        await t.click(this.keyTypeDropDown);
        await t.click(this.setOption);
        await t.click(this.addKeyNameInput);
        await t.typeText(this.addKeyNameInput, keyName, { replace: true, paste: true });
        await t.click(this.keyTTLInput);
        await t.typeText(this.keyTTLInput, TTL);
        await t.typeText(this.setMemberInput, members, { replace: true, paste: true });
        await t.click(this.addKeyButton);
    }

    /**
     * Adding a new ZSet key
     * @param keyName The name of the key
     * @param scores The score of the key member
     * @param TTL The Time to live value of the key
     * @param members The key members
     */
    async addZSetKey(keyName: string, scores = ' ', TTL = ' ', members = ' '): Promise<void> {
        await Common.waitForElementNotVisible(this.progressLine);
        await Common.waitForElementNotVisible(this.loader);
        await t.click(this.plusAddKeyButton);
        await t.click(this.keyTypeDropDown);
        await t.click(this.zsetOption);
        await t.click(this.addKeyNameInput);
        await t.typeText(this.addKeyNameInput, keyName, { replace: true, paste: true });
        await t.click(this.keyTTLInput);
        await t.typeText(this.keyTTLInput, TTL, { replace: true, paste: true });
        await t.typeText(this.setMemberInput, members, { replace: true, paste: true });
        await t.typeText(this.zsetMemberScoreInput, scores, { replace: true, paste: true });
        await t.click(this.addKeyButton);
    }

    /**
     * Adding a new List key
     * @param keyName The name of the key
     * @param TTL The Time to live value of the key
     * @param element The key element
     */
    async addListKey(keyName: string, TTL = ' ', element: string[] = [' '], position: AddElementInList = AddElementInList.Tail): Promise<void> {
        await Common.waitForElementNotVisible(this.progressLine);
        await Common.waitForElementNotVisible(this.loader);
        await t.click(this.plusAddKeyButton);
        await t.click(this.keyTypeDropDown);
        await t.click(this.listOption);
        await t.click(this.addKeyNameInput);
        await t.typeText(this.addKeyNameInput, keyName, { replace: true, paste: true });
        await t.click(this.keyTTLInput);
        await t.typeText(this.keyTTLInput, TTL, { replace: true, paste: true });

        if(position === AddElementInList.Head){
            await t.click(this.destinationSelect);
            await t.click(this.pushToHeadSelection);
            await t.expect(this.pushToHeadSelection.exists).notOk();
        }

        for(let i = 0; i < element.length; i++ ) {
            await t.click(this.getListElementInput(i));
            await t.typeText(this.getListElementInput(i), element[i], { replace: true, paste: true });
            // If there's more than one element and it's not the last element, add a new row
            if (element.length > 1 && i < element.length - 1) {
                await t.click(this.addAdditionalElement);
            }
        }
        await t.click(this.addKeyButton);
    }

    /**
     * Adding a new Hash key
     * @param keyName The name of the key
     * @param TTL The Time to live value of the key
     * @param field The field name of the key
     * @param value The value of the key
     * @param fieldTtl The ttl of the field for Redis databases 7.4 and higher*/
    async addHashKey(keyName: string, TTL = ' ', field = ' ', value = ' ', fieldTtl = ''): Promise<void> {
        if (await this.Toast.toastCloseButton.visible) {
            await t.click(this.Toast.toastCloseButton);
        }
        await Common.waitForElementNotVisible(this.progressLine);
        await Common.waitForElementNotVisible(this.loader);
        await t.click(this.plusAddKeyButton);
        await t.click(this.keyTypeDropDown);
        await t.click(this.hashOption);
        await t.click(this.addKeyNameInput);
        await t.typeText(this.addKeyNameInput, keyName, { replace: true, paste: true });
        await t.click(this.keyTTLInput);
        await t.typeText(this.keyTTLInput, TTL, { replace: true, paste: true });
        await t.typeText(this.hashFieldNameInput, field, { replace: true, paste: true });
        await t.typeText(this.hashFieldValueInput, value, { replace: true, paste: true });
        if(fieldTtl !== ''){
            await t.typeText(this.hashTtlFieldInput, fieldTtl, { replace: true, paste: true });
        }
        await t.click(this.addKeyButton);
    }

    /**
     * Adding a new Stream key
     * @param keyName The name of the key
     * @param field The field name of the key
     * @param value The value of the key
     * @param TTL The Time to live value of the key
     */
    async addStreamKey(keyName: string, field: string, value: string, TTL?: string): Promise<void> {
        await this.commonAddNewKey(keyName, TTL);
        await t.click(this.streamOption);
        // Verify that user can see Entity ID filled by * by default on add Stream key form
        await t.expect(this.streamEntryId.withAttribute('value', '*').exists).ok('Preselected Stream Entity ID field not displayed');
        await t.typeText(this.streamField, field, { replace: true, paste: true });
        await t.typeText(this.streamValue, value, { replace: true, paste: true });
        await t.expect(this.addKeyButton.withAttribute('disabled').exists).notOk('Add Key button not clickable');
        await t.click(this.addKeyButton);
        await t.click(this.Toast.toastCloseButton);
    }

    /**
     * Adding a new Entry to a Stream key
     * @param field The field name of the key
     * @param value The value of the key
     * @param entryId The identification of specific entry of the Stream Key
     */
    async addEntryToStream(field: string, value: string, entryId?: string): Promise<void> {
        await t
            .click(this.addNewStreamEntry)
            // Specify field, value and add new entry
            .typeText(this.streamField, field, { replace: true, paste: true })
            .typeText(this.streamValue, value, { replace: true, paste: true });
        if (entryId !== undefined) {
            await t.typeText(this.streamEntryId, entryId, { replace: true, paste: true });
        }
        await t
            .click(this.saveElementButton)
            // Validate that new entry is added
            .expect(this.streamEntriesContainer.textContent).contains(field, 'Field parameter not correct')
            .expect(this.streamEntriesContainer.textContent).contains(value, 'Value parameter not correct');
    }

    /**
     * Adding a new Entry to a Stream key
     * @param fields The field name of the key
     * @param values The value of the key
     * @param entryId The identification of specific entry of the Stream Key
     */
    async fulfillSeveralStreamFields(fields: string[], values: string[], entryId?: string): Promise<void> {
        for (let i = 0; i < fields.length; i++) {
            await t.typeText(this.streamField.nth(-1), fields[i], { replace: true, paste: true })
                .typeText(this.streamValue.nth(-1), values[i], { replace: true, paste: true });
            if (i < fields.length - 1) {
                await t.click(this.addAdditionalElement);
            }
        }
        if (entryId !== undefined) {
            await t.typeText(this.streamEntryId, entryId, { replace: true, paste: true });
        }
    }

    /**
     * Select keys filter group type
     * @param groupName The group name
     */
    async selectFilterGroupType(groupName: string): Promise<void> {
        await t
            .click(this.filterByKeyTypeDropDown)
            .click(this.filterOptionType.withExactText(groupName));
    }

    /**
     * Select all key type filter group type
     */
    async setAllKeyType(): Promise<void> {
        await t
            .click(this.filterByKeyTypeDropDown)
            .click(this.filterAllKeyType);
    }

    /**
     * Searching by Key name in the list
     * @param keyName The name of the key
     */
    async navigateToKey(keyName: string): Promise<void> {
        // todo: check if we outside of database
        await this.searchByKeyName(keyName);
        await this.openKeyDetailsByKeyName(keyName);
    }

    /**
     * Searching by Key name in the list
     * @param keyName The name of the key
     */
    async searchByKeyName(keyName: string): Promise<void> {
        await t.click(this.filterByPatterSearchInput);
        await t.typeText(this.filterByPatterSearchInput, keyName, { replace: true, paste: true });
        await t.pressKey('enter');
    }

    /**
     * Get selector by key name
     * @param keyName The name of the key
     */
    getKeySelectorByName(keyName: string): Selector {
        return Selector(`[data-testid="key-${keyName}"]`);
    }

    /**
     * Verifying if the Key is in the List of keys
     * @param keyName The name of the key
     */
    async isKeyIsDisplayedInTheList(keyName: string): Promise<boolean> {
        const keyNameInTheList = this.getKeySelectorByName(keyName);
        await Common.waitForElementNotVisible(this.loader);
        return keyNameInTheList.exists;
    }

    //Delete key from details
    async deleteKey(): Promise<void> {
        if (await this.Toast.toastCloseButton.exists) {
            await t.click(this.Toast.toastCloseButton);
        }
        await t.click(this.keyNameInTheList);
        await t.click(this.deleteKeyButton);
        await t.click(this.confirmDeleteKeyButton);
    }

    /**
     * Delete key by Name from details
     * @param keyName The name of the key
     */
    async deleteKeyByName(keyName: string): Promise<void> {
        await this.searchByKeyName(keyName);
        await t.hover(this.keyNameInTheList);
        await t.click(this.keyNameInTheList);
        await t.click(this.deleteKeyButton);
        await t.click(this.confirmDeleteKeyButton);
    }

    /**
     * Delete keys by their Names
     * @param keyNames The names of the key array
     */
    async deleteKeysByNames(keyNames: string[]): Promise<void> {
        for (const name of keyNames) {
            await this.deleteKeyByName(name);
        }
    }

    /**
     * Delete Key By name after Hovering
     * @param keyName The name of the key
     */
    async deleteKeyByNameFromList(keyName: string): Promise<void> {
        await this.searchByKeyName(keyName);
        await t.hover(this.keyNameInTheList);
        await t.click(Selector(`[data-testid="delete-key-btn-${keyName}"]`));
        await t.click(this.submitDeleteKeyButton);
    }

    /**
     * Edit key name from details
     * @param keyName The name of the key
     */
    async editKeyName(keyName: string): Promise<void> {
        await t
            .click(this.editKeyNameButton)
            .typeText(this.keyNameInput, keyName, { replace: true, paste: true })
            .click(this.EditorButton.applyBtn);
    }

    /**
     * Edit String key value from details
     * @param value The value of the key
     */
    async editStringKeyValue(value: string): Promise<void> {
        await t
            .click(this.stringKeyValueInput)
            .typeText(this.stringKeyValueInput, value, { replace: true, paste: true })
            .click(this.EditorButton.applyBtn);
    }

    //Get String key value from details
    async getStringKeyValue(): Promise<string> {
        return this.stringKeyValueInput.textContent;
    }

    //Get Zset key score from details
    async getZsetKeyScore(): Promise<string> {
        return this.zsetScoresList.textContent;
    }

    /**
     * Add field to hash key
     * @param keyFieldValue The value of the hash field
     * @param keyValue The hash value
     * @param fieldTtl The hash field ttl value for Redis databases 7.4 and higher
     */
    async addFieldToHash(keyFieldValue: string, keyValue: string, fieldTtl = ''): Promise<void> {
        if (await this.Toast.toastCloseButton.exists) {
            await t.click(this.Toast.toastCloseButton);
        }
        await t.click(this.addKeyValueItemsButton);
        await t.typeText(this.hashFieldInput, keyFieldValue, { replace: true, paste: true });
        await t.typeText(this.hashValueInput, keyValue, { replace: true, paste: true });
        if(fieldTtl !== ''){
            await t.typeText(this.hashTtlFieldInput, fieldTtl, { replace: true, paste: true });
        }
        await t.click(this.saveHashFieldButton);
    }

    /**
     * Edit Hash key the first value from details
     * @param value The  new value of the key
     */
    async editHashKeyValue(value: string): Promise<void> {
        await t
            .hover(this.hashFieldValue)
            .click(this.editHashButton)
            .typeText(this.hashFieldValueEditor, value, { replace: true, paste: true })
            .click(this.EditorButton.applyBtn);
    }

    /**
     * Edit Hash field ttl value
     * @param fieldName The field name
     * @param fieldTtl The hash field ttl value for Redis databases 7.4 and higher
     */
    async editHashFieldTtlValue(fieldName: string, fieldTtl: string): Promise<void> {
        await t
            .hover(this.getHashTtlFieldInput(fieldName))
            .click(this.editHashFieldTtlButton)
            .typeText(this.inlineItemEditor, fieldTtl, { replace: true, paste: true })
            .click(this.applyButton);
    }

    //Get Hash key value from details
    async getHashKeyValue(): Promise<string> {
        return this.hashFieldValue.textContent;
    }

    /**
     * Edit List key value from details
     * @param value The value of the key
     */
    async editListKeyValue(value: string): Promise<void> {
        await t
            .hover(this.listElementsList)
            .click(this.editListButton)
            .typeText(this.listKeyElementEditorInput, value, { replace: true, paste: true })
            .click(this.EditorButton.applyBtn);
    }

    //Get List key value from details
    async getListKeyValue(): Promise<string> {
        return this.listElementsList.textContent;
    }

    //Get JSON key value from details
    async getJsonKeyValue(): Promise<string> {
        return this.jsonKeyValue.textContentWithoutButtons;
    }

    /**
     * Search by the value in the key details
     * @param value The value of the search parameter
     */
    async searchByTheValueInKeyDetails(value: string): Promise<void> {
        await t
            .click(this.searchButtonInKeyDetails)
            .typeText(this.searchInput, value, { replace: true, paste: true })
            .pressKey('enter');
    }

    /**
     * Search by the value in the key details
     * @param value The value of the search parameter
     */
    async secondarySearchByTheValueInKeyDetails(value: string): Promise<void> {
        await t
            .typeText(this.searchInput, value, { replace: true, paste: true })
            .pressKey('enter');
    }

    /**
     * Search by the value in the set key details
     * @param value The value of the search parameter
     */
    async searchByTheValueInSetKey(value: string): Promise<void> {
        await t
            .click(this.searchInput)
            .typeText(this.searchInput, value, { replace: true, paste: true })
            .pressKey('enter');
    }

    /**
     * Add member to the Set key
     * @param keyMember The value of the set member
     */
    async addMemberToSet(keyMember: string): Promise<void> {
        if (await this.Toast.toastCloseButton.exists) {
            await t.click(this.Toast.toastCloseButton);
        }
        await t
            .click(this.addKeyValueItemsButton)
            .typeText(this.setMemberInput, keyMember, { replace: true, paste: true })
            .click(this.saveMemberButton);
    }

    /**
     * Add member to the ZSet key
     * @param keyMember The value of the Zset member
     * @param score The value of the score
     */
    async addMemberToZSet(keyMember: string, score: string): Promise<void> {
        if (await this.Toast.toastCloseButton.exists) {
            await t.click(this.Toast.toastCloseButton);
        }
        await t
            .click(this.addKeyValueItemsButton)
            .typeText(this.setMemberInput, keyMember, { replace: true, paste: true })
            .typeText(this.zsetMemberScoreInput, score, { replace: true, paste: true })
            .click(this.saveMemberButton);
    }

    /**
     * Open key details with search
     * @param keyName The name of the key
     */
    async openKeyDetails(keyName: string): Promise<void> {
        await this.searchByKeyName(keyName);
        await t.click(this.keyNameInTheList);
    }

    /**
     * Open key details of the key by name
     * @param keyName The name of the key
     */
    async openKeyDetailsByKeyName(keyName: string): Promise<void> {
        const keyNameInTheList = Selector(`[data-testid="key-${keyName}"]`);
        await t.click(keyNameInTheList);
    }

    /**
     * Add element to the List key
     * @param element The value of the list element
     */
    async addElementToList(element: string[], position: AddElementInList = AddElementInList.Tail ): Promise<void> {
        if (await this.Toast.toastCloseButton.exists) {
            await t.click(this.Toast.toastCloseButton);
        }
        await t
            .click(this.addKeyValueItemsButton)
        if(position === AddElementInList.Head){
            await t.click(this.destinationSelect);
            await t.click(this.pushToHeadSelection);
            await t.expect(this.pushToHeadSelection.exists).notOk();
        }
        for (let i = 0; i < element.length; i ++){
            await t.typeText(this.getListElementInput(i), element[i], { replace: true, paste: true });
            // If there's more than one element and it's not the last element, add a new row
            if (element.length > 1 && i < element.length - 1) {
                await t.click(this.addAdditionalElement);
            }
        }
        await t.click(this.saveElementButton);
    }

    //Remove List element from head for Redis databases less then v. 6.2.
    async removeListElementFromHeadOld(): Promise<void> {
        await t.click(this.removeElementFromListIconButton);
        await t.expect(this.countInput.withAttribute('disabled').exists).ok('Input field not disabled');
        //Select Remove from head selection
        await t.click(this.removeElementFromListSelect);
        await t.click(this.removeFromHeadSelection);
        //Confirm removing
        await t.click(this.removeElementFromListButton);
        await t.click(this.confirmRemoveListElementButton);
    }

    /**
     * Remove List element from tail
     * @param count The count if elements for removing
     */
    async removeListElementFromTail(count: string): Promise<void> {
        await t.click(this.removeElementFromListIconButton);
        await t.typeText(this.countInput, count, { replace: true, paste: true });
        await t.click(this.removeElementFromListButton);
        await t.click(this.confirmRemoveListElementButton);
    }

    /**
     * Remove List element from head
     * @param count The count if elements for removing
     */
    async removeListElementFromHead(count: string): Promise<void> {
        await t.click(this.removeElementFromListIconButton);
        //Enter count of the removing elements
        await t.typeText(this.countInput, count, { replace: true, paste: true });
        //Select Remove from head selection
        await t.click(this.removeElementFromListSelect);
        await t.click(this.removeFromHeadSelection);
        //Confirm removing
        await t.click(this.removeElementFromListButton);
        await t.click(this.confirmRemoveListElementButton);
    }

    /**
     * Add json key with value on the same level of the structure
     * @param jsonKey The json key name
     * @param jsonKeyValue The value of the json key
     */
    async addJsonKeyOnTheSameLevel(jsonKey: string, jsonKeyValue: string): Promise<void> {
        await t.click(this.addJsonObjectButton);
        await t.typeText(this.jsonKeyInput, jsonKey, { paste: true });
        await t.typeText(this.jsonValueInput, jsonKeyValue, { paste: true });
        await t.click(this.EditorButton.applyBtn);
    }

    /**
     * Add json key with value inside the Json structure
     * @param jsonKey The json key name
     * @param jsonKeyValue The value of the json key
     */
    async addJsonKeyInsideStructure(jsonKey: string, jsonKeyValue: string): Promise<void> {
        await t.click(this.expandJsonObject);
        await t.click(this.addJsonFieldButton);
        await t.typeText(this.jsonKeyInput, jsonKey, { paste: true });
        await t.typeText(this.jsonValueInput, jsonKeyValue, { paste: true });
        await t.click(this.EditorButton.applyBtn);
    }

    /**
     * Add json value inside the Json structure
     * @param jsonKeyValue The value of the json key
     */
    async addJsonValueInsideStructure(jsonKeyValue: string): Promise<void> {
        await t.click(this.expandJsonObject);
        await t.click(this.addJsonFieldButton);
        await t.typeText(this.jsonValueInput, jsonKeyValue, { paste: true });
        await t.click(this.applyButton);
    }

    /**
     * Add json structure
     * @param jsonStructure The structure of the json key
     */
    async addJsonStructure(jsonStructure: string): Promise<void> {
        if (await this.expandJsonObject.exists) {
            await t.click(this.expandJsonObject);
        }
        await t.click(this.editJsonObjectButton);
        await t.typeText(this.jsonValueInput, jsonStructure, { paste: true });
        await t.click(this.applyEditButton);
    }

    //Delete entry from Stream key
    async deleteStreamEntry(): Promise<void> {
        await t.click(this.removeEntryButton)
            .click(this.confirmRemoveEntryButton);
    }

    /**
     * Get key length from opened key details
     */
    async getKeyLength(): Promise<string> {
        const rawValue = await this.keyLengthDetails.textContent;
        return rawValue.split(' ')[rawValue.split(' ').length - 1];
    }

    /**
     * Create new consumer group in Stream key
     * @groupName The name of the Consumer Group
     * @id The ID of the Consumer Group
     */
    async createConsumerGroup(groupName: string, id?: string): Promise<void> {
        await t
            .click(this.addKeyValueItemsButton)
            .typeText(this.groupNameInput, groupName, { replace: true, paste: true });
        if (id !== undefined) {
            await t.typeText(this.consumerIdInput, id, { replace: true, paste: true });
        }
        await t.click(this.saveGroupsButton);
    }

    /**
     * Open pendings view in Stream key
     * @keyName The name of the Stream Key
     */
    async openStreamPendingsView(keyName: string): Promise<void> {
        await this.openKeyDetails(keyName);
        await t.click(this.streamTabGroups);
        await t.click(this.consumerGroup);
        await t.click(this.streamConsumerName);
    }

    /**
     * Open formatter and select option
     * @param formatter The name of format
     */
    async selectFormatter(formatter: string): Promise<void> {
        const option = Selector(`[data-test-subj="format-option-${formatter}"]`);
        await t
            .click(this.formatSwitcher)
            .click(option);
    }

    /**
     * Verify that keys can be scanned more and results increased
    */
    async verifyScannningMore(): Promise<void> {
        for (let i = 10; i < 100; i += 10) {
            // Remember results value
            const rememberedScanResults = Number((await this.keysNumberOfResults.textContent).replace(/\s/g, ''));
            await t.expect(this.progressKeyList.exists).notOk('Progress Bar is still displayed', { timeout: 30000 });
            const scannedValueText = this.scannedValue.textContent;
            const regExp = new RegExp(`${i} ` + '...');
            await t
                .expect(scannedValueText).match(regExp, `The database is not automatically scanned by ${i} 000 keys`)
                .click(this.scanMoreButton);
            const scannedResults = Number((await this.keysNumberOfResults.textContent).replace(/\s/g, ''));
            await t.expect(scannedResults).gt(rememberedScanResults);
        }
    }

    /**
     * Open Select Index droprown and select option
     * @param index The name of format
    */
    async selectIndexByName(index: string): Promise<void> {
        const option = Selector(`[data-test-subj="mode-option-type-${index}"]`);
        const placeholder = Selector('[data-testid="select-index-placeholder"]');
        const dropdown = Selector('[data-testid="select-search-mode"]');

        // Click placeholder if it exists, otherwise click dropdown
        const triggerElement = await placeholder.exists ? placeholder : dropdown;

        await t
            .click(triggerElement)
            .click(option);
    }

    /**
    * Verify that database has no keys
    */
    async verifyNoKeysInDatabase(): Promise<void> {
        await t.expect(this.keyListMessage.exists).ok('Database not empty')
            .expect(this.keysSummary.exists).notOk('Total value is displayed for empty database');
    }

    /**
    * Clear filter on Browser page
    */
    async clearFilter(): Promise<void> {
        await t.click(this.clearFilterButton);
    }

    /**
     * Open Guide link by name
     * @param guide The guide name
     */
    async clickGuideLinksByName(guide: string): Promise<void> {
        const linkGuide = Selector('[data-testid^="guide-button-"]').withExactText(guide);
        await t.click(linkGuide);
    }
}

/**
 * Add new keys parameters
 * @param keyName The name of the key
 * @param TTL The ttl of the key
 * @param value The value of the key
 * @param members The members of the key
 * @param scores The scores of the key member
 * @param field The field of the key
 */
export type AddNewKeyParameters = {
    keyName: string,
    value?: string,
    TTL?: string,
    members?: string,
    scores?: string,
    field?: string,
    fields?: [{
        field?: string,
        valuse?: string
    }]
};

export type BaseKeyParameters = {
    keyName: string,
    ttl?: number
};

/**
 * Hash key parameters
 * @param keyName The name of the key
 * @param fields The Array with fields
 * @param field The field of the field
 * @param value The value of the field

 */
export type HashKeyParameters = BaseKeyParameters & {
    fields: {
        field: string,
        value: string
    }[]
};

/**
 * Stream key parameters
 * @param keyName The name of the key
 * @param entries The Array with entries
 * @param id The id of entry
 * @param fields The Array with fields
 */
export type StreamKeyParameters = BaseKeyParameters & {
    entries: {
        id: string,
        fields: {
            name: string,
            value: string
        }[]
    }[]
};

/**
 * Set key parameters
 * @param keyName The name of the key
 * @param members The Array with members
 */
export type SetKeyParameters = BaseKeyParameters & {
    members: string[]
};

/**
 * Sorted Set key parameters
 * @param keyName The name of the key
 * @param members The Array with members
 * @param name The name of the member
 * @param id The id of the member
 */
export type SortedSetKeyParameters = BaseKeyParameters & {
    members: {
        name: string,
        score: number
    }[]
};

/**
 * List key parameters
 * @param keyName The name of the key
 * @param element The element in list
 */
export type ListKeyParameters = BaseKeyParameters & {
    elements: string[]
};

/**
 * String key parameters
 * @param keyName The name of the key
 * @param value The value in the string
 */
export type StringKeyParameters = BaseKeyParameters & {
    value: string
};

/**
 * Json key parameters
 * @param keyName The name of the key
 * @param value The value in the json
 */
export type JsonKeyParameters = BaseKeyParameters & {
    data: any
};

/**
 * The key arguments for multiple keys/fields adding
 * @param keysCount The number of keys to add
 * @param fieldsCount The number of fields in key to add
 * @param elementsCount The number of elements in key to add
 * @param membersCount The number of members in key to add
 * @param keyName The full key name
 * @param keyNameStartWith The name of key should start with
 * @param fieldStartWitht The name of field should start with
 * @param fieldValueStartWith The name of field value should start with
 * @param elementStartWith The name of element should start with
 * @param memberStartWith The name of member should start with
 */

export type AddKeyArguments = {
    keysCount?: number,
    fieldsCount?: number,
    elementsCount?: number,
    membersCount?: number,
    keyName?: string,
    keyNameStartWith?: string,
    fieldStartWith?: string,
    fieldValueStartWith?: string,
    elementStartWith?: string,
    memberStartWith?: string
};

/**
 * Keys Data parameters
 * @param textType The type of the key
 * @param keyName The name of the key
 */
export type KeyData = {
    textType: string,
    keyName: string
}[];
