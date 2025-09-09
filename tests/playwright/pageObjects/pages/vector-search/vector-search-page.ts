/* eslint-disable @typescript-eslint/lines-between-class-members */
import { Locator, Page, expect } from '@playwright/test'

import { CreateIndexPage } from './create-index-page'
import { BasePage } from '../../base-page'

export class VectorSearchPage extends BasePage {
    // PAGES
    private readonly createIndexPage: CreateIndexPage

    // SELECTORS
    public readonly vectorSearchPage: Locator
    public readonly searchTab: Locator

    // EDITOR
    public readonly editorContainer: Locator
    public readonly editorViewLine: Locator
    public readonly editorTextBox: Locator
    public readonly editorSubmitButton: Locator
    public readonly editorClearButton: Locator

    // QUERY CARD CONTAINER
    public readonly commandsResults: Locator
    public readonly commandsResultsEmpty: Locator
    public readonly queryCardContainer: Locator
    public readonly queryCardDeleteButton: Locator
    public readonly queryCardReRunButton: Locator
    public readonly queryCardToggleCollapseButton: Locator
    public readonly queryCardToggleFullScreenButton: Locator
    public readonly queryCardContent: Locator

    // SAVED QUERIES
    public readonly savedQueriesContainer: Locator
    public readonly savedQueriesButton: Locator
    public readonly savedQueriesNoDataMessage: Locator
    public readonly savedQueriesGettingStartedButton: Locator
    public readonly savedQueriesInsertButton: Locator

    // BUTTONS
    public readonly getStartedButton: Locator
    public readonly clearCommandsResultsButton: Locator

    constructor(page: Page) {
        super(page)
        this.page = page

        // PAGES
        this.createIndexPage = new CreateIndexPage(page)

        // CONTAINERS
        this.vectorSearchPage = page.getByTestId('vector-search-page')
        this.searchTab = page.getByRole('tab', { name: 'Search' })

        // EDITOR
        this.editorContainer = page.getByTestId('vector-search-query-editor')
        this.editorViewLine = this.editorContainer.locator('.view-line')
        this.editorTextBox = this.editorContainer.getByRole('textbox', {
            name: 'Editor content;Press Alt+F1',
        })
        this.editorSubmitButton = page.getByTestId('btn-submit')
        this.editorClearButton = page.getByTestId('btn-clear')

        // QUERY CARD CONTAINER
        this.commandsResults = page.getByTestId('commands-view')
        this.commandsResultsEmpty = this.commandsResults
            .getByTestId('no-data-message')
            .getByText('No search results.')
        this.queryCardContainer = page.locator(
            '[data-testid^="query-card-container-"]',
        )
        this.queryCardDeleteButton =
            this.queryCardContainer.getByTestId('delete-command')
        this.queryCardReRunButton =
            this.queryCardContainer.getByTestId('re-run-command')
        this.queryCardToggleCollapseButton =
            this.queryCardContainer.getByTestId('toggle-collapse')
        this.queryCardToggleFullScreenButton =
            this.queryCardContainer.getByTestId('toggle-full-screen')
        this.queryCardContent =
            this.queryCardContainer.getByTestId('query-cli-result')

        // SAVED QUERIES
        this.savedQueriesContainer = page.getByTestId('saved-queries-screen')
        this.savedQueriesButton = page.getByRole('button', {
            name: 'Saved queries',
        })
        this.savedQueriesNoDataMessage =
            this.savedQueriesContainer.getByTestId('no-data-message')
        this.savedQueriesGettingStartedButton =
            this.savedQueriesContainer.getByRole('button', {
                name: 'Get started',
            })
        this.savedQueriesInsertButton =
            this.savedQueriesContainer.getByTestId('btn-insert-query')

        // BUTTONS
        this.getStartedButton = this.commandsResults
            .getByTestId('no-data-message')
            .getByRole('button', {
                name: 'Get started',
            })
        this.clearCommandsResultsButton =
            this.commandsResults.getByTestId('clear-history-btn')
    }

    async navigateToVectorSearchPage(): Promise<void> {
        await this.searchTab.getByRole('paragraph').click()
        await this.waitForLocatorVisible(this.vectorSearchPage)
    }

    async navigateToCreateIndexPage(): Promise<void> {
        await this.getStartedButton.click()
        await this.createIndexPage.verifyCreateIndexPageLoaded()
    }

    async waitForQueryCardCount(
        expectedCount: number,
        timeout = 6000,
    ): Promise<void> {
        await expect(this.queryCardContainer).toHaveCount(expectedCount, {
            timeout,
        })
    }

    async waitForQueryCardFullScreen(
        expectedFullScreen: boolean,
        timeout = 6000,
    ): Promise<void> {
        await expect(this.queryCardContainer).toHaveAttribute(
            'data-full-screen',
            expectedFullScreen ? 'true' : 'false',
            {
                timeout,
            },
        )
    }

    async openSavedQueriesPanel(): Promise<void> {
        await this.savedQueriesButton.click()
        await this.waitForLocatorVisible(this.savedQueriesContainer)
    }
}
