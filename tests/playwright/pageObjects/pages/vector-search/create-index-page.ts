/* eslint-disable @typescript-eslint/lines-between-class-members */
import { expect, Locator, Page } from '@playwright/test'

import {
    SampleDataContent,
    SampleDataType,
    SearchIndexType,
} from 'uiSrc/pages/vector-search-deprecated/create-index/types'
import {
    indexDataContent,
    indexType as indexTypesData,
    sampleDatasetOptions,
} from 'uiSrc/pages/vector-search-deprecated/create-index/steps/config'
import { BasePage } from '../../base-page'
import { Toast } from '../../components/common/toast'

export class CreateIndexPage extends BasePage {
    private toast: Toast

    // CONTAINERS
    public readonly vectorSearchPage: Locator
    public readonly createIndexPage: Locator
    public readonly wizardTitle: Locator

    // STEP 1 CONTAINERS
    public readonly step1Container: Locator
    public readonly step1IndexTypeContainer: Locator
    public readonly step1SampleDatasetContainer: Locator
    public readonly step1DataContentContainer: Locator
    public readonly step1NextButton: Locator

    // STEP 2 CONTAINERS
    public readonly step2Container: Locator
    public readonly step2CommandPreviewDrawer: Locator
    public readonly step2OpenCommandPreviewButton: Locator
    public readonly step2CloseCommandPreviewButton: Locator
    public readonly step2CreateIndexButton: Locator

    // BUTTONS
    public readonly cancelButton: Locator

    constructor(page: Page) {
        super(page)
        this.page = page
        this.toast = new Toast(page)

        // CONTAINERS
        this.vectorSearchPage = page.getByTestId('vector-search-page')
        this.createIndexPage = page.getByTestId(
            'vector-search--create-index-page',
        )
        this.wizardTitle = page.getByText('New vector search')

        // STEP 1 CONTAINERS
        this.step1Container = page.getByTestId('create-index-step1')
        this.step1IndexTypeContainer = page.getByTestId('step-data--index-type')
        this.step1SampleDatasetContainer = page.getByTestId(
            'step-data--sample-dataset',
        )
        this.step1DataContentContainer = page.getByTestId(
            'step-data--data-content',
        )
        this.step1NextButton = page.getByText('Proceed to index')

        // STEP 2 CONTAINERS
        this.step2Container = page.getByTestId('create-index-step2')
        this.step2OpenCommandPreviewButton = page.getByText('Command preview')
        this.step2CommandPreviewDrawer = page.getByTestId(
            'preview-command-drawer',
        )
        this.step2CloseCommandPreviewButton =
            this.step2CommandPreviewDrawer.getByText('Close')
        this.step2CreateIndexButton = page.getByRole('button', {
            name: 'Create index',
        })

        // BUTTONS
        this.cancelButton = page.getByRole('button', {
            name: 'Cancel',
        })
    }

    async verifyCreateIndexPageLoaded(): Promise<void> {
        await this.waitForLocatorVisible(this.createIndexPage)
        await this.waitForLocatorVisible(this.wizardTitle)
        await this.waitForLocatorVisible(this.step1Container)
    }

    async step1SelectIndexType(indexType: SearchIndexType): Promise<void> {
        await this.waitForLocatorVisible(this.step1IndexTypeContainer)

        const indexTypeData = indexTypesData.find(
            (type) => type.value === indexType,
        )
        if (!indexTypeData) {
            throw new Error(`Index type ${indexType} not found`)
        }

        const indexTypeElement = this.step1IndexTypeContainer.getByText(
            indexTypeData.label!,
        )

        await this.waitForLocatorVisible(indexTypeElement)
        await indexTypeElement.click()
    }

    async step1SelectSampleDataset(
        sampleDataset: SampleDataType,
    ): Promise<void> {
        await this.waitForLocatorVisible(this.step1SampleDatasetContainer)

        const sampleDatasetData = sampleDatasetOptions.find(
            (dataset) => dataset.value === sampleDataset,
        )
        if (!sampleDatasetData) {
            throw new Error(`Sample dataset ${sampleDataset} not found`)
        }

        const sampleDatasetElement = this.step1SampleDatasetContainer.getByText(
            sampleDatasetData.label!,
        )

        await this.waitForLocatorVisible(sampleDatasetElement)
        await sampleDatasetElement.click()
    }

    async step1SelectDataContent(
        dataContent: SampleDataContent,
    ): Promise<void> {
        await this.waitForLocatorVisible(this.step1DataContentContainer)

        const dataContentData = indexDataContent.find(
            (data) => data.value === dataContent,
        )
        if (!dataContentData) {
            throw new Error(`Data content ${dataContent} not found`)
        }

        const dataContentElement = this.step1DataContentContainer.getByText(
            dataContentData.label!,
        )

        await this.waitForLocatorVisible(dataContentElement)
        await dataContentElement.click()
    }

    async step1ClickNextButton(): Promise<void> {
        await this.waitForLocatorVisible(this.step1NextButton)
        await this.step1NextButton.click()

        await this.waitForLocatorVisible(this.step2Container)
    }

    async step2ClickCommandPreviewButton(): Promise<void> {
        await this.waitForLocatorVisible(this.step2OpenCommandPreviewButton)
        await this.step2OpenCommandPreviewButton.click()

        await this.waitForLocatorVisible(this.step2CommandPreviewDrawer)
    }

    async step2ClickCloseCommandPreviewButton(): Promise<void> {
        await this.waitForLocatorVisible(this.step2CloseCommandPreviewButton)
        await this.step2CloseCommandPreviewButton.click()

        await this.waitForLocatorVisible(this.step2Container)
    }

    async step2ClickCreateIndexButton(): Promise<void> {
        await this.waitForLocatorVisible(this.step2CreateIndexButton)
        await this.step2CreateIndexButton.click()

        // Verify we're back on the vector search page
        await this.waitForLocatorVisible(this.vectorSearchPage)

        // Check for success toast
        await this.verifySuccessToast('Index has been created')
    }

    async verifySuccessToast(
        expectedMessage: string,
        timeout = 2000,
    ): Promise<void> {
        await this.waitForLocatorVisible(this.toast.toastContainer, timeout)
        await expect(this.toast.toastMessage).toContainText(expectedMessage)
        // await this.toast.closeToast() // Note: Temporarily disabled due to flakyness
    }

    async clickCancelButton(): Promise<void> {
        await this.waitForLocatorVisible(this.cancelButton)
        await this.cancelButton.click()

        await this.waitForLocatorVisible(this.vectorSearchPage)
    }
}
