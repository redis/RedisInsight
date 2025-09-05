/* eslint-disable @typescript-eslint/lines-between-class-members */
import { Locator, Page } from '@playwright/test'

import { CreateIndexPage } from './create-index-page'
import { BasePage } from '../../base-page'

export class VectorSearchPage extends BasePage {
    // PAGES
    private readonly createIndexPage: CreateIndexPage

    // SELECTORS
    public readonly vectorSearchPage: Locator
    public readonly searchTab: Locator
    public readonly cloudLoginModal: Locator

    // VECTOR SET NOT AVAILABLE BANNER
    public readonly vectorSetNotAvailableBanner: Locator
    public readonly freeRedisCloudDatabaseButton: Locator

    // RQE NOT AVAILABLE CARD
    public readonly rqeNotAvailableCard: Locator
    public readonly createRedisCloudDatabaseButton: Locator

    // BUTTONS
    public readonly getStartedButton: Locator
    public readonly startWizardButton: Locator

    constructor(page: Page) {
        super(page)
        this.page = page

        // PAGES
        this.createIndexPage = new CreateIndexPage(page)

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

        // BUTTONS
        this.getStartedButton = page.getByRole('button', {
            name: 'Get started',
        })
        this.startWizardButton = page.getByTestId('start-wizard-button')
    }

    async navigateToVectorSearchPage(): Promise<void> {
        await this.searchTab.getByRole('paragraph').click()
        await this.waitForLocatorVisible(this.vectorSearchPage)
    }

    async navigateToCreateIndexPage(): Promise<void> {
        await this.getStartedButton.click()
        await this.createIndexPage.verifyCreateIndexPageLoaded()
    }
}
