import { VectorSearchPage } from '../../pageObjects/pages/vector-search/vector-search-page'
import { test } from '../../fixtures/test'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../helpers/utils'

test.describe('Vector Search - Query', () => {
    let searchPage: VectorSearchPage
    let cleanupInstance: () => Promise<void>

    test.beforeEach(async ({ page, api: { databaseService } }) => {
        searchPage = new VectorSearchPage(page)
        cleanupInstance = await addStandaloneInstanceAndNavigateToIt(
            page,
            databaseService,
        )

        await navigateToStandaloneInstance(page)
        await searchPage.navigateToVectorSearchPage()
    })

    test.afterEach(async () => {
        await cleanupInstance()
    })
})
