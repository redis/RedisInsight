/* eslint-disable @typescript-eslint/lines-between-class-members */
import { Locator, Page, expect } from '@playwright/test'

import { CreateIndexPage } from './create-index-page'
import { BasePage } from '../../base-page'
import { Toast } from '../../components/common/toast'
import { BrowserPage } from '../../browser-page'

export class VectorSearchPage extends BasePage {
    private readonly toast: Toast

    // PAGES
    private readonly createIndexPage: CreateIndexPage

    // SELECTORS
    public readonly vectorSearchPage: Locator
    public readonly browserPage: BrowserPage
    public readonly searchTab: Locator
    public readonly cloudLoginModal: Locator

    // VECTOR SET NOT AVAILABLE BANNER
    public readonly vectorSetNotAvailableBanner: Locator
    public readonly freeRedisCloudDatabaseButton: Locator

    // RQE NOT AVAILABLE CARD
    public readonly rqeNotAvailableCard: Locator
    public readonly createRedisCloudDatabaseButton: Locator

    // ONBOARDING
    public readonly onboardingContainer: Locator
    public readonly onboardingDismissButton: Locator
    public readonly onboardingGetStartedButton: Locator
    public readonly onboardingSkipButton: Locator

    // EDITOR
    public readonly editorContainer: Locator
    public readonly editorViewLine: Locator
    public readonly editorTextBox: Locator
    public readonly editorSuggesstionPopup: Locator
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
    public readonly startWizardButton: Locator

    // MANAGE INDEXES
    public readonly manageIndexesContainer: Locator
    public readonly manageIndexesButton: Locator
    public readonly manageIndexesNoDataMessage: Locator
    public readonly manageIndexesGettingStartedButton: Locator
    public readonly manageIndexesDeleteButton: Locator
    public readonly manageIndexesDeleteConfirmationButton: Locator
    public readonly manageIndexesIndexCollapsedInfo: Locator
    public readonly manageIndexesIndexDetails: Locator

    constructor(page: Page) {
        super(page)
        this.page = page
        this.toast = new Toast(page)

        // PAGES
        this.createIndexPage = new CreateIndexPage(page)
        this.browserPage = new BrowserPage(page)

        // CONTAINERS
        this.vectorSearchPage = page.getByTestId('vector-search-page')
        this.searchTab = page.getByRole('tab', { name: 'Search' })
        this.cloudLoginModal = page.getByTestId('social-oauth-dialog')

        // VECTOR SET NOT AVAILABLE BANNER
        this.vectorSetNotAvailableBanner = page.getByTestId(
            'vector-set-not-available-banner',
        )
        this.freeRedisCloudDatabaseButton =
            this.vectorSetNotAvailableBanner.getByRole('button', {
                name: 'Free Redis Cloud DB',
            })

        // RQE NOT AVAILABLE CARD
        this.rqeNotAvailableCard = page.getByTestId(
            'vector-search-page--rqe-not-available',
        )
        this.createRedisCloudDatabaseButton =
            this.rqeNotAvailableCard.getByRole('button', {
                name: 'Get Started For Free',
            })

        // ONBOARDING
        this.onboardingContainer = page.getByTestId('vector-search-onboarding')
        this.onboardingDismissButton = this.onboardingContainer.getByTestId(
            'vector-search-onboarding--dismiss-button',
        )
        this.onboardingGetStartedButton = this.onboardingContainer.getByRole(
            'button',
            {
                name: 'Explore vector search',
            },
        )
        this.onboardingSkipButton = this.onboardingContainer.getByRole(
            'button',
            {
                name: 'Skip for now',
            },
        )

        // EDITOR
        this.editorContainer = page.getByTestId('vector-search-query-editor')
        this.editorViewLine = this.editorContainer.locator('.view-line')
        this.editorTextBox = this.editorContainer.getByRole('textbox', {
            name: 'Editor content;Press Alt+F1',
        })
        this.editorSuggesstionPopup = page.locator(
            '.monaco-editor .suggest-widget.visible',
        )
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
        this.startWizardButton = page.getByTestId('start-wizard-button')

        // MANAGE INDEXES
        this.manageIndexesContainer = page.getByTestId('manage-indexes-screen')
        this.manageIndexesButton = page.getByRole('button', {
            name: 'Manage indexes',
        })
        this.manageIndexesNoDataMessage =
            this.manageIndexesContainer.getByTestId('no-data-message')
        this.manageIndexesGettingStartedButton =
            this.manageIndexesContainer.getByRole('button', {
                name: 'Get started',
            })
        this.manageIndexesDeleteButton =
            this.manageIndexesContainer.getByTestId('manage-index-delete-btn')
        this.manageIndexesDeleteConfirmationButton = this.page.getByTestId(
            'manage-index-delete-confirmation-btn',
        )
        this.manageIndexesIndexCollapsedInfo =
            this.manageIndexesContainer.getByTestId('index-collapsed-info')
        this.manageIndexesIndexDetails =
            this.manageIndexesContainer.getByTestId('index-attributes-list')
    }

    async navigateToVectorSearchPage({
        forceOnboarding = false,
    }: {
        forceOnboarding?: boolean
    } = {}): Promise<void> {
        // Toggle the visibility of the onboarding screen, based on the locaStorage flag
        await this.page.evaluate((vectorSearchOnboarding: boolean) => {
            localStorage.setItem(
                'vectorSearchOnboarding', // BrowserStorageItem.vectorSearchOnboarding,
                (!vectorSearchOnboarding).toString(),
            )
        }, forceOnboarding)

        // Note: Temporray disable the navigation to the vector search page through the search tab because of a feature flag
        // await this.searchTab.getByRole('paragraph').click()

        // Note: Temporary get the instance ID from the URL and navigate to the vector search page directly
        await this.navigateToVectorSearchPageFromUrl()

        if (forceOnboarding) {
            await this.waitForLocatorVisible(this.onboardingContainer)
        } else {
            await this.waitForLocatorVisible(this.vectorSearchPage)
        }
    }

    // Note: Temporary navigate to the vector search page from the URL because of a feature flag
    async navigateToVectorSearchPageFromUrl(): Promise<void> {
        // Navigate to Browser page to make sure we can get the instance ID from the URL and navigate to the vector search page directly
        await this.browserPage.navigateToBrowserPage()

        const url = await this.page.url().split('/')
        const instanceId = url[url.length - 2]

        await this.navigateTo(`/${instanceId}/vector-search`)
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

    async openManageIndexesPanel(): Promise<void> {
        await this.manageIndexesButton.click()
        await this.waitForLocatorVisible(this.manageIndexesContainer)
    }

    async deleteIndex(): Promise<void> {
        await this.manageIndexesDeleteButton.click()
        await this.waitForLocatorVisible(
            this.manageIndexesDeleteConfirmationButton,
        )
        await this.manageIndexesDeleteConfirmationButton.click()

        await this.verifySuccessToast('Index has been deleted')
    }

    async verifySuccessToast(
        expectedMessage: string,
        timeout = 2000,
    ): Promise<void> {
        await this.waitForLocatorVisible(this.toast.toastContainer, timeout)
        await expect(this.toast.toastMessage).toContainText(expectedMessage)
        // await this.toast.closeToast() // Note: Temporarily disabled due to flakyness
    }

    async expandIndexDetails(indexName: string): Promise<void> {
        await this.manageIndexesContainer
            .getByTestId(`manage-indexes-list--item--${indexName}`)
            .locator('button')
            .first()
            .click()

        await this.waitForLocatorNotVisible(
            this.manageIndexesIndexCollapsedInfo,
        )
        await this.waitForLocatorVisible(this.manageIndexesIndexDetails)

        await this.waitForLocatorVisible(
            this.manageIndexesContainer.getByText('Identifier'),
        )
        await this.waitForLocatorVisible(
            this.manageIndexesContainer.getByText('Attribute'),
        )
        await this.waitForLocatorVisible(
            this.manageIndexesContainer.getByText('Type'),
        )
        await this.waitForLocatorVisible(
            this.manageIndexesContainer.getByText('Weight'),
        )
        await this.waitForLocatorVisible(
            this.manageIndexesContainer.getByText('Noindex'),
        )
    }

    async collapseIndexDetails(indexName: string): Promise<void> {
        await this.manageIndexesContainer
            .getByTestId(`manage-indexes-list--item--${indexName}`)
            .locator('button')
            .first()
            .click()

        await this.waitForLocatorNotVisible(this.manageIndexesIndexDetails)
        await this.waitForLocatorVisible(this.manageIndexesIndexCollapsedInfo)
    }
}
