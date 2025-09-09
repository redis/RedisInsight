import { PresetDataType } from 'uiSrc/pages/vector-search/create-index/types'
import { VectorSearchPage } from '../../pageObjects/pages/vector-search/vector-search-page'
import { test, expect } from '../../fixtures/test'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../helpers/utils'
import { CreateIndexPage } from '../../pageObjects/pages/vector-search/create-index-page'
import { ossStandaloneV6Config } from '../../helpers/conf'
import { CreateRedisearchIndexParameters } from '../../types'
import { redisearchIndexFactory } from '../../factories/redisearch-index.factory'

const mockIndex: CreateRedisearchIndexParameters = redisearchIndexFactory.build(
    {
        indexName: PresetDataType.BIKES,
    },
)

test.describe('Vector Search - Saved Queries', () => {
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
    })

    test.afterEach(async ({ api: { indexService } }) => {
        // Delete all seeded indexes
        await indexService.deleteRedisearchIndexApi(
            mockIndex.indexName,
            ossStandaloneV6Config,
        )

        await cleanupInstance()
    })

    test('should open Saved Queries panel when there are no indexes', async () => {
        await searchPage.openSavedQueriesPanel()
        await expect(searchPage.savedQueriesNoDataMessage).toBeVisible()

        // Verify that the "Create index" button is visible and clickable
        await expect(searchPage.savedQueriesGettingStartedButton).toBeVisible()
        await searchPage.savedQueriesGettingStartedButton.click()
        await createIndexPage.verifyCreateIndexPageLoaded()
    })

    test('should open Saved Queries page when there is index', async ({
        api: { indexService },
    }) => {
        // Prepare the test by creating an index
        await indexService.createRedisearchIndexApi(
            mockIndex,
            ossStandaloneV6Config,
        )

        // Open the Manage Indexes panel
        await searchPage.openSavedQueriesPanel()
        await expect(searchPage.savedQueriesNoDataMessage).not.toBeVisible()

        // Verify that the index is displayed in the list
        await expect(searchPage.savedQueriesContainer).toContainText(
            mockIndex.indexName,
        )

        // Verify that the queries are displayed in the list
        // TODO: Enable this once we reimplement saved queries soon
        // const mockSavedQueries = mockSavedIndexes.find(
        //     (index) => index.value === mockIndex.indexName,
        // )

        await expect(searchPage.savedQueriesContainer).toContainText(
            'Search for "Nord" bikes ordered by price',
            // mockSavedQueries?.queries[0].label!,
        )
        await expect(searchPage.savedQueriesContainer).toContainText(
            'Find road alloy bikes under 20kg',
            // mockSavedQueries?.queries[1].label!,
        )
    })

    test('should click the Insert button of the first saved query in the list', async ({
        api: { indexService },
    }) => {
        // Prepare the test by creating an index
        await indexService.createRedisearchIndexApi(
            mockIndex,
            ossStandaloneV6Config,
        )

        // Open the Saved Queries panel
        await searchPage.openSavedQueriesPanel()
        await expect(searchPage.savedQueriesNoDataMessage).not.toBeVisible()

        // Ensure the queries are displayed
        await expect(searchPage.savedQueriesContainer).toContainText(
            'Search for "Nord" bikes ordered by price', // TODO: Replace this with actual query, once we reimplement them soon
        )

        // Click the Insert button for the first saved query
        const firstInsertButton = searchPage.savedQueriesInsertButton.first()
        await searchPage.waitForLocatorVisible(firstInsertButton)
        await firstInsertButton.click()

        // Verify that the query is inserted into the editor
        await expect(searchPage.editorTextBox).toHaveValue(
            'FT.SEARCH idx:bikes_vss "@brand:Nord" SORTBY price ASC', // TODO: Replace this with actual query, once we reimplement them soon
        )
    })
})
