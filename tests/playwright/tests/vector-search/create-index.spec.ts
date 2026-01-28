import {
    SampleDataContent,
    SampleDataType,
    SearchIndexType,
} from 'uiSrc/pages/vector-search-deprecated/create-index/types'
import { VectorSearchPage } from '../../pageObjects/pages/vector-search/vector-search-page'
import { test } from '../../fixtures/test'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../helpers/utils'
import { CreateIndexPage } from '../../pageObjects/pages/vector-search/create-index-page'
import { ossStandaloneV6Config } from '../../helpers/conf'

test.describe('Vector Search - Create Index', () => {
    let searchPage: VectorSearchPage
    let createIndexPage: CreateIndexPage
    let cleanupInstance: () => Promise<void>

    test.beforeEach(async ({ page, api: { databaseService } }) => {
        searchPage = new VectorSearchPage(page)
        createIndexPage = new CreateIndexPage(page)
        cleanupInstance = await addStandaloneInstanceAndNavigateToIt(
            page,
            databaseService,
            ossStandaloneV6Config,
        )

        await navigateToStandaloneInstance(page, ossStandaloneV6Config)
        await searchPage.navigateToVectorSearchPage()
        await searchPage.navigateToCreateIndexPage()
    })

    test.afterEach(async () => {
        await cleanupInstance()
    })

    test('should create a vector search index', async () => {
        // Step 1
        await createIndexPage.step1SelectIndexType(
            SearchIndexType.REDIS_QUERY_ENGINE,
        )
        await createIndexPage.step1SelectSampleDataset(
            SampleDataType.PRESET_DATA,
        )
        await createIndexPage.step1SelectDataContent(
            SampleDataContent.E_COMMERCE_DISCOVERY,
        )
        await createIndexPage.step1ClickNextButton()

        // Step 2
        await createIndexPage.step2ClickCommandPreviewButton()
        await createIndexPage.step2ClickCloseCommandPreviewButton()
        await createIndexPage.step2ClickCreateIndexButton()

        await createIndexPage.verifySuccessToast('Index has been created')
    })

    test('should cancel the create index wizard', async () => {
        // Fill in step 1
        await createIndexPage.step1SelectIndexType(
            SearchIndexType.REDIS_QUERY_ENGINE,
        )
        await createIndexPage.step1SelectSampleDataset(
            SampleDataType.PRESET_DATA,
        )
        await createIndexPage.step1SelectDataContent(
            SampleDataContent.E_COMMERCE_DISCOVERY,
        )
        await createIndexPage.step1ClickNextButton()

        // Cancel the wizard
        await createIndexPage.clickCancelButton()
    })
})
