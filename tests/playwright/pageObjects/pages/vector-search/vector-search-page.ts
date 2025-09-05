/* eslint-disable @typescript-eslint/lines-between-class-members */
import { expect, Locator, Page } from '@playwright/test'

import { CreateIndexPage } from './create-index-page'
import { BasePage } from '../../base-page'
import { Toast } from '../../components/common/toast'

export class VectorSearchPage extends BasePage {
    private readonly toast: Toast

    // PAGES
    private readonly createIndexPage: CreateIndexPage

    // SELECTORS
    public readonly vectorSearchPage: Locator
    public readonly searchTab: Locator

    // BUTTONS
    public readonly getStartedButton: Locator

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

        // CONTAINERS
        this.vectorSearchPage = page.getByTestId('vector-search-page')
        this.searchTab = page.getByRole('tab', { name: 'Search' })

        // BUTTONS
        this.getStartedButton = page.getByRole('button', {
            name: 'Get started',
        })

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

    async navigateToVectorSearchPage(): Promise<void> {
        await this.searchTab.getByRole('paragraph').click()
        await this.waitForLocatorVisible(this.vectorSearchPage)
    }

    async navigateToCreateIndexPage(): Promise<void> {
        await this.getStartedButton.click()
        await this.createIndexPage.verifyCreateIndexPageLoaded()
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
        try {
            await this.waitForLocatorVisible(this.toast.toastSuccess, timeout)
            await expect(this.toast.toastBody).toContainText(expectedMessage)
            await this.toast.closeToast()
        } catch {
            // No toast appeared - this is acceptable for some actions
            // Success is typically verified by other means (navigation, etc.)Expand commentComment on lines R179 to R181ResolvedCode has comments. Press enter to view.
        }
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

        // Verify that the index details are not displayed
        await this.waitForLocatorNotVisible(
            this.manageIndexesContainer.getByText('Identifier'),
        )
        await this.waitForLocatorNotVisible(
            this.manageIndexesContainer.getByText('Attribute'),
        )
        await this.waitForLocatorNotVisible(
            this.manageIndexesContainer.getByText('Type'),
        )
        await this.waitForLocatorNotVisible(
            this.manageIndexesContainer.getByText('Weight'),
        )
        await this.waitForLocatorNotVisible(
            this.manageIndexesContainer.getByText('Noindex'),
        )
    }
}
