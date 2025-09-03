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

    // BUTTONS
    public readonly getStartedButton: Locator

    constructor(page: Page) {
        super(page)
        this.page = page

        // PAGES
        this.createIndexPage = new CreateIndexPage(page)

        // CONTAINERS
        this.vectorSearchPage = page.getByTestId('vector-search-page')
        this.searchTab = page.getByRole('tab', { name: 'Search' })

        // BUTTONS
        this.getStartedButton = page.getByRole('button', {
            name: 'Get started',
        })
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
