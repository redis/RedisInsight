import { faker } from '@faker-js/faker'
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

const mockHashIndex: CreateRedisearchIndexParameters =
    redisearchIndexFactory.build({
        indexName: 'test-index-hash',
        keyType: 'HASH' as const,
        prefixes: [`product:${faker.string.alphanumeric({ length: 5 })}:`],
        fields: [
            { name: 'title', type: 'TEXT' as const },
            { name: 'description', type: 'TEXT' as const },
            { name: 'category', type: 'TAG' as const },
            { name: 'price', type: 'NUMERIC' as const },
        ],
    })

const mockJsonIndex: CreateRedisearchIndexParameters =
    redisearchIndexFactory.build({
        indexName: 'test-index-json',
        keyType: 'JSON' as const,
        prefixes: [`product:${faker.string.alphanumeric({ length: 5 })}:`],
        fields: [
            { name: '$.title', type: 'TEXT' as const },
            { name: '$.description', type: 'TEXT' as const },
            { name: '$.category', type: 'TAG' as const },
            { name: '$.price', type: 'NUMERIC' as const },
        ],
    })

test.describe('Vector Search - Manage Indexes', () => {
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
        // Delete all indexes
        await indexService.deleteRedisearchIndexApi(
            mockHashIndex.indexName,
            ossStandaloneV6Config,
        )
        await indexService.deleteRedisearchIndexApi(
            mockJsonIndex.indexName,
            ossStandaloneV6Config,
        )

        await cleanupInstance()
    })

    test('should open Manage Indexes page when there are no indexes', async () => {
        await searchPage.openManageIndexesPanel()
        await expect(searchPage.manageIndexesNoDataMessage).toBeVisible()

        // Verify that the "Create index" button is visible and clickable
        await expect(searchPage.manageIndexesGettingStartedButton).toBeVisible()
        await searchPage.manageIndexesGettingStartedButton.click()
        await createIndexPage.verifyCreateIndexPageLoaded()
    })

    test('should open Manage Indexes page when there is HASH index', async ({
        api: { indexService },
    }) => {
        // Prepare the test by creating an index
        await indexService.createRedisearchIndexApi(
            mockHashIndex,
            ossStandaloneV6Config,
        )

        // Open the Manage Indexes panel
        await searchPage.openManageIndexesPanel()
        await expect(searchPage.manageIndexesNoDataMessage).not.toBeVisible()

        // Verify that the index is displayed in the list
        await expect(searchPage.manageIndexesContainer).toContainText(
            mockHashIndex.indexName,
        )
    })

    test('should open Manage Indexes page when there is JSON index', async ({
        api: { indexService },
    }) => {
        await indexService.createRedisearchIndexApi(
            mockJsonIndex,
            ossStandaloneV6Config,
        )

        // Open the Manage Indexes panel
        await searchPage.openManageIndexesPanel()
        await expect(searchPage.manageIndexesNoDataMessage).not.toBeVisible()

        // Verify that the index is displayed in the list
        await expect(searchPage.manageIndexesContainer).toContainText(
            mockJsonIndex.indexName,
        )
    })

    test('should collapse/expand an index details', async ({
        api: { indexService },
    }) => {
        // Prepare the test by creating an index
        await indexService.createRedisearchIndexApi(
            mockHashIndex,
            ossStandaloneV6Config,
        )

        // Open the Manage Indexes panel and verify that the index is displayed in the list
        await searchPage.openManageIndexesPanel()
        await expect(searchPage.manageIndexesContainer).toContainText(
            mockHashIndex.indexName,
        )

        // Expand the index details
        await searchPage.expandIndexDetails(mockHashIndex.indexName)

        // Collapse the index details
        await searchPage.collapseIndexDetails(mockHashIndex.indexName)
    })

    test('should delete an index', async ({ api: { indexService } }) => {
        // Prepare the test by creating an index
        await indexService.createRedisearchIndexApi(
            mockHashIndex,
            ossStandaloneV6Config,
        )

        // Open the Manage Indexes panel and verify that the index is displayed in the list
        await searchPage.openManageIndexesPanel()
        await expect(searchPage.manageIndexesContainer).toContainText(
            mockHashIndex.indexName,
        )

        // Delete the index and verify that it is gone
        await searchPage.deleteIndex()
        await expect(searchPage.manageIndexesContainer).not.toContainText(
            mockHashIndex.indexName,
        )
    })
})
