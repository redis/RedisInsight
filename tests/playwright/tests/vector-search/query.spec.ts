import { VectorSearchPage } from '../../pageObjects/pages/vector-search/vector-search-page'
import { test, expect } from '../../fixtures/test'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../helpers/utils'
import { CreateIndexPage } from '../../pageObjects/pages/vector-search/create-index-page'
import { ossStandaloneV6Config } from '../../helpers/conf'

test.describe('Vector Search - Query', () => {
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

    test.afterEach(async () => {
        await cleanupInstance()
    })

    test('should open Vector Search page with empty query and no results', async () => {
        // Verify that commands results are empty
        await searchPage.waitForLocatorVisible(searchPage.commandsResults)
        await searchPage.waitForLocatorVisible(searchPage.commandsResultsEmpty)

        // Click on "Get started" button
        await searchPage.getStartedButton.click()

        // Verify that "Create index" flow is opened
        await createIndexPage.verifyCreateIndexPageLoaded()
    })

    test('should open Vector Search page and query data', async () => {
        // Click on editor, fill in a query and submit it
        await searchPage.editorViewLine.click()
        await searchPage.editorTextBox.fill('FT._LIST')
        await searchPage.waitForLocatorVisible(
            searchPage.editorSuggesstionPopup,
        )
        await searchPage.editorSubmitButton.click()
        await searchPage.waitForLocatorNotVisible(
            searchPage.editorSuggesstionPopup,
        )

        // Verify the query results
        await searchPage.waitForLocatorVisible(searchPage.commandsResults)
        await searchPage.waitForLocatorNotVisible(
            searchPage.commandsResultsEmpty,
        )

        // Check for query card
        await searchPage.waitForLocatorVisible(searchPage.queryCardContainer)

        // Click on "Clear Results" button and verify that query card is removed
        await searchPage.clearCommandsResultsButton.click()
        await searchPage.waitForLocatorVisible(searchPage.commandsResultsEmpty)

        // Click on "Clear" button in editor and verify that editor is empty
        await searchPage.editorClearButton.click()
        await expect(searchPage.editorTextBox).toHaveValue('')
    })

    test.describe('Query Results actions', () => {
        test.beforeEach(async () => {
            // Click on editor, fill in a query and submit it
            await searchPage.editorViewLine.click()
            await searchPage.editorTextBox.fill('FT._LIST')
            await searchPage.editorSubmitButton.click()

            // Verify the query results
            await searchPage.waitForLocatorVisible(searchPage.commandsResults)
            await searchPage.waitForLocatorNotVisible(
                searchPage.commandsResultsEmpty,
            )
        })

        test('should delete a query result', async () => {
            // Click on "Clear" button
            await searchPage.queryCardDeleteButton.click()

            // Verify that commands results are empty
            await searchPage.waitForLocatorVisible(
                searchPage.commandsResultsEmpty,
            )
        })

        test('should re-run a query again', async () => {
            // Verify that there is only one query card
            await searchPage.waitForQueryCardCount(1)

            // Click on "Clear" button
            await searchPage.queryCardReRunButton.click()

            // Verify that there is two query cards
            await searchPage.waitForQueryCardCount(2)
        })

        test('should collapse/uncollapse a query result', async () => {
            // Verify that we start with the query card un-collapsed
            await expect(searchPage.queryCardContent).toBeVisible()

            // Click on "Collapse" button and verify that the query card is collapsed
            await searchPage.queryCardToggleCollapseButton.click()
            await expect(searchPage.queryCardContent).toBeHidden()

            // Click on "Un-Collapse" button again and verify that the query card is un-collapsed
            await searchPage.queryCardToggleCollapseButton.click()
            await expect(searchPage.queryCardContent).toBeVisible()
        })

        test('should open a query result in full screen', async () => {
            // Verify that we start with the query card not in full screen
            await searchPage.waitForQueryCardFullScreen(false)

            // Click on "Full Screen" button and verify that the query card is opened in full screen
            await searchPage.queryCardToggleFullScreenButton.click()
            await searchPage.waitForQueryCardFullScreen(true)

            // Click on "Full Screen" button again and verify that the query card is closed from full screen
            await searchPage.queryCardToggleFullScreenButton.click()
            await searchPage.waitForQueryCardFullScreen(false)
        })
    })
})
