import { VectorSearchPage } from '../../pageObjects/pages/vector-search/vector-search-page'
import { test } from '../../fixtures/test'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../helpers/utils'
import { ossStandaloneConfig, ossStandaloneV6Config } from '../../helpers/conf'
import { ossStandaloneV5Config } from '../../helpers/conf'

test.describe('Vector Search - Query', () => {
    let searchPage: VectorSearchPage
    let cleanupInstance: () => Promise<void>

    test.beforeEach(async ({ page }) => {
        searchPage = new VectorSearchPage(page)
    })

    test.afterEach(async () => {
        await cleanupInstance()
    })

    test('should open Vector Search page', async ({
        page,
        api: { databaseService },
    }) => {
        // Init database instance that supports vector search
        cleanupInstance = await addStandaloneInstanceAndNavigateToIt(
            page,
            databaseService,
            ossStandaloneV6Config,
        )

        await navigateToStandaloneInstance(page, ossStandaloneV6Config)
        await searchPage.navigateToVectorSearchPage()

        // Verify that Vector Search page is opened and the start wizard button is visible
        await searchPage.waitForLocatorVisible(searchPage.startWizardButton)
    })

    test('should not open Vector Search page if Redis Query Engine module is not enabled', async ({
        page,
        api: { databaseService },
    }) => {
        cleanupInstance = await addStandaloneInstanceAndNavigateToIt(
            page,
            databaseService,
            ossStandaloneV5Config,
        )

        await navigateToStandaloneInstance(page, ossStandaloneV5Config)
        await searchPage.searchTab.click()

        // Verify that Vector Search page is opened and the start wizard button is visible
        await searchPage.waitForLocatorVisible(searchPage.rqeNotAvailableCard)

        // Verify that "Get Started For Free" button is visible
        await searchPage.waitForLocatorVisible(
            searchPage.createRedisCloudDatabaseButton,
        )
        await searchPage.createRedisCloudDatabaseButton.click()

        // Verify that Cloud Login modal is opened
        await searchPage.waitForLocatorVisible(searchPage.cloudLoginModal)
    })

    test('should open Vector Search page, but show a message if Redis version does not support Vector Sets', async ({
        page,
        api: { databaseService },
    }) => {
        // Init database instance that supports vector search
        cleanupInstance = await addStandaloneInstanceAndNavigateToIt(
            page,
            databaseService,
            ossStandaloneConfig,
        )

        await navigateToStandaloneInstance(page, ossStandaloneConfig)
        await searchPage.navigateToVectorSearchPage()

        // Verify that Vector Search page is opened and banner with information about Vector Sets is visible
        await searchPage.waitForLocatorVisible(
            searchPage.vectorSetNotAvailableBanner,
        )

        // Verify that "Free Redis Cloud DB" button is visible
        await searchPage.waitForLocatorVisible(
            searchPage.freeRedisCloudDatabaseButton,
        )
        await searchPage.freeRedisCloudDatabaseButton.click()

        // Verify that Cloud Login modal is opened
        await searchPage.waitForLocatorVisible(searchPage.cloudLoginModal)
    })
})
