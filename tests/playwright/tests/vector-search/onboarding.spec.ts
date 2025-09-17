import { VectorSearchPage } from '../../pageObjects/pages/vector-search/vector-search-page'
import { test } from '../../fixtures/test'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../helpers/utils'
import { CreateIndexPage } from '../../pageObjects/pages/vector-search/create-index-page'
import { ossStandaloneV6Config } from '../../helpers/conf'

test.describe('Vector Search - Onboarding', () => {
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
        await searchPage.navigateToVectorSearchPage({ forceOnboarding: true })
    })

    test.afterEach(async () => {
        await cleanupInstance()
    })

    test('should open "Create Index" flow when clicking on "Get started" button', async () => {
        // Verify that commands results are empty
        await searchPage.waitForLocatorVisible(searchPage.onboardingContainer)

        // Click on "Get started" button
        await searchPage.onboardingGetStartedButton.click()

        // Verify that "Create index" flow is opened
        await createIndexPage.verifyCreateIndexPageLoaded()

        // But it should not dismiss the onboarding screen yet
        // Click on "Cancel" button to go back to Search page
        await createIndexPage.cancelButton.click()

        // Verify that onboarding screen is still visible
        await searchPage.waitForLocatorVisible(searchPage.onboardingContainer)
    })

    test('should dismiss onboarding when clicking on "Skip for now" button', async () => {
        // Verify that onboarding screen is visible
        await searchPage.waitForLocatorVisible(searchPage.onboardingContainer)

        // Click on "Skip for now" button
        await searchPage.onboardingSkipButton.click()

        // Verify that onboarding screen is not visible
        await searchPage.waitForLocatorVisible(searchPage.vectorSearchPage)

        // Verify that onboarding screen is not visible after dismissing it
        await searchPage.reload()

        // Verify that onboarding screen is not visible anymore
        await searchPage.waitForLocatorNotVisible(
            searchPage.onboardingContainer,
        )
        await searchPage.waitForLocatorVisible(searchPage.vectorSearchPage)
    })

    test('should dismiss onboarding when clicking on "X" button', async () => {
        // Verify that onboarding screen is visible
        await searchPage.waitForLocatorVisible(searchPage.onboardingContainer)

        // Click on "X" button
        await searchPage.onboardingDismissButton.click()

        // Verify that onboarding screen is not visible
        await searchPage.waitForLocatorVisible(searchPage.vectorSearchPage)

        // Verify that onboarding screen is not visible after dismissing it
        await searchPage.reload()

        // Verify that onboarding screen is not visible anymore
        await searchPage.waitForLocatorNotVisible(
            searchPage.onboardingContainer,
        )
        await searchPage.waitForLocatorVisible(searchPage.vectorSearchPage)
    })

    test('should open the onboarding screen unless it is manuyally dismissed', async () => {
        // Verify that onboarding screen is visible
        await searchPage.waitForLocatorVisible(searchPage.onboardingContainer)

        // Verify that onboarding screen is visible unless we dismiss it manually
        await searchPage.reload()

        // Verify that onboarding screen is still visible
        await searchPage.waitForLocatorVisible(searchPage.onboardingContainer)
    })
})
