import { Page, Locator } from '@playwright/test';
import { FieldTypeModal } from './FieldTypeModal';

/**
 * Create Index Form component
 * Form for creating a new search index (sample data or existing data)
 */
export class CreateIndexForm {
  readonly page: Page;

  readonly container: Locator;
  readonly content: Locator;
  readonly header: Locator;
  readonly footer: Locator;
  readonly createIndexButton: Locator;
  readonly cancelButton: Locator;

  readonly browserPanel: Locator;
  readonly selectKeyOnboarding: Locator;
  readonly selectKeyOnboardingDismiss: Locator;
  readonly selectKeyOnboardingClose: Locator;

  readonly prefixInput: Locator;
  readonly addFieldButton: Locator;
  readonly fieldTypeModal: FieldTypeModal;
  readonly toolbar: Locator;
  readonly tableViewButton: Locator;
  readonly commandViewButton: Locator;
  readonly commandView: Locator;
  readonly viewToggle: Locator;
  readonly emptyState: Locator;

  readonly indexNameDisplay: Locator;
  readonly indexNameEditButton: Locator;
  readonly indexNameInput: Locator;
  readonly indexNameConfirmButton: Locator;
  readonly indexNameCancelButton: Locator;
  readonly indexNameErrorIcon: Locator;
  readonly indexNameErrorTooltip: Locator;
  readonly createIndexSubmitTooltip: Locator;
  readonly typeTabs: Locator;
  readonly indexDetailsTable: Locator;

  constructor(page: Page) {
    this.page = page;

    this.container = page.getByTestId('vector-search--create-index--page');
    this.content = page.getByTestId('vector-search--create-index--content');
    this.header = page.getByTestId('vector-search--create-index--header');
    this.footer = page.getByTestId('vector-search--create-index--footer');
    this.createIndexButton = page.getByRole('button', { name: 'Create index' });
    this.cancelButton = this.footer.getByRole('button', { name: 'Cancel' });

    this.browserPanel = page.getByTestId('vector-search--create-index--browser-panel');
    this.selectKeyOnboarding = page.getByTestId('select-key-onboarding-content');
    this.selectKeyOnboardingDismiss = page.getByTestId('select-key-onboarding-dismiss');
    this.selectKeyOnboardingClose = page.getByTestId('select-key-onboarding-close');

    this.prefixInput = page.getByTestId('vector-search--create-index--prefix-input');
    this.addFieldButton = page.getByRole('button', { name: '+ Add field' });
    this.fieldTypeModal = new FieldTypeModal(page);
    this.toolbar = page.getByTestId('vector-search--create-index--toolbar');
    this.tableViewButton = page.getByRole('button', { name: 'Table view' });
    this.commandViewButton = page.getByRole('button', { name: 'Command view' });
    this.commandView = page.getByTestId('vector-search--create-index--command-view');
    this.viewToggle = page.getByTestId('vector-search--create-index--view-toggle');
    this.emptyState = page.getByTestId('vector-search--create-index--empty-state');

    this.indexNameDisplay = page.getByTestId('index-name-display');
    this.indexNameEditButton = page.getByTestId('index-name-edit-btn');
    this.indexNameInput = page.getByTestId('index-name-edit-input');
    this.indexNameConfirmButton = page.getByTestId('index-name-confirm-btn');
    this.indexNameCancelButton = page.getByTestId('index-name-cancel-btn');
    this.indexNameErrorIcon = page.getByTestId('index-name-error-icon');
    this.indexNameErrorTooltip = page.getByTestId('index-name-error-tooltip');
    this.createIndexSubmitTooltip = page.getByTestId('vector-search--create-index--submit-tooltip');

    this.typeTabs = page.getByTestId('vs-keys-type-tabs');
    this.indexDetailsTable = page.getByTestId('index-details-table');
  }

  /**
   * Switch the browser panel key type tab (HASH or JSON).
   */
  async switchKeyTypeTab(tab: 'HASH' | 'JSON'): Promise<void> {
    await this.typeTabs.getByRole('tab', { name: tab }).click();
  }

  /**
   * Select a key from the browser panel in the "existing data" create-index flow.
   *
   * The key tree uses `:` as the default delimiter. A key like `prefix:key1`
   * renders as a collapsed folder `prefix` with a leaf `key1` inside.
   * Folder nodes have a predictable `data-testid`, but leaf nodes include
   * internal bookkeeping in their testid, so we locate them via
   * `role="treeitem"` filtered by the displayed short name.
   *
   * The tree is virtualized (react-vtree) and only renders items within
   * the scroll viewport. When parallel tests accumulate many keys the
   * target folder may be off-screen; {@link scrollTreeToNode} handles
   * scrolling to reveal it.
   */
  async selectKey(keyName: string, delimiter = ':'): Promise<void> {
    await this.browserPanel.waitFor({ state: 'visible' });
    await this.browserPanel.getByRole('treeitem').first().waitFor({ state: 'visible' });

    const delimiterIndex = keyName.lastIndexOf(delimiter);

    if (delimiterIndex !== -1) {
      const folder = keyName.substring(0, delimiterIndex);
      const collapsed = this.page.getByTestId(`node-item_${folder}`);
      const expanded = this.page.getByTestId(`node-item_${folder}--expanded`);
      const folderNode = expanded.or(collapsed);

      await this.scrollTreeToNode(folderNode);

      if (await collapsed.isVisible()) {
        await collapsed.click();
        await expanded.waitFor({ state: 'visible' });
      }
    }

    const shortName = delimiterIndex !== -1 ? keyName.substring(delimiterIndex + delimiter.length) : keyName;

    const leafNode = this.browserPanel.getByRole('treeitem').filter({ hasText: shortName });

    await this.scrollTreeToNode(leafNode);
    await leafNode.click();
  }

  /**
   * Scroll the virtualized key tree until {@link node} is visible.
   *
   * The tree only renders items inside its scroll viewport, so off-screen
   * nodes don't exist in the DOM. We position the mouse over the tree and
   * send wheel events to scroll incrementally until the node appears.
   *
   * After each wheel event we use {@link Locator.waitFor} with a short
   * timeout instead of the synchronous {@link Locator.isVisible} check,
   * giving React's virtualized renderer time to process the scroll and
   * mount new items before we decide whether to keep scrolling.
   */
  private async scrollTreeToNode(node: Locator): Promise<void> {
    if (await node.isVisible()) {
      return;
    }

    const firstItem = this.browserPanel.getByRole('treeitem').first();
    const box = await firstItem.boundingBox();
    if (!box) {
      return;
    }

    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const MAX_SCROLL_ATTEMPTS = 50;
    const SETTLE_TIMEOUT_MS = 200;
    for (let i = 0; i < MAX_SCROLL_ATTEMPTS; i++) {
      await this.page.mouse.wheel(0, 200);

      try {
        await node.waitFor({ state: 'visible', timeout: SETTLE_TIMEOUT_MS });
        return;
      } catch {
        // Node not rendered yet after this scroll step, continue
      }
    }
  }
}
