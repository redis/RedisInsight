import { VectorSearchPage } from '../../pageObjects/pages/vector-search/vector-search-page'
import { test } from '../../fixtures/test'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../helpers/utils'
import { CreateIndexPage } from '../../pageObjects/pages/vector-search/create-index-page'
import { ossStandaloneV6Config } from '../../helpers/conf'
import { BrowserPage } from '../../pageObjects/browser-page'

test.describe('Vector Search - Onboarding', () => {
    let searchPage: VectorSearchPage
    let createIndexPage: CreateIndexPage
    let browserPage: BrowserPage
    let cleanupInstance: () => Promise<void>

    test.beforeEach(async ({ page, api: { databaseService } }) => {
        searchPage = new VectorSearchPage(page)
        createIndexPage = new CreateIndexPage(page)
        browserPage = new BrowserPage(page)

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
    })

    test('should dismiss onboarding when clicking on "Skip for now" button', async () => {
        // Verify that onboarding screen is visible
        await searchPage.waitForLocatorVisible(searchPage.onboardingContainer)

        // Click on "Skip for now" button
        await searchPage.onboardingSkipButton.click()

        // Verify that onboarding screen is not visible
        await searchPage.waitForLocatorVisible(searchPage.vectorSearchPage)
    })

    test('should dismiss onboarding when clicking on "X" button', async () => {
        // Verify that onboarding screen is visible
        await searchPage.waitForLocatorVisible(searchPage.onboardingContainer)

        // Click on "X" button
        await searchPage.onboardingDismissButton.click()
    })

    test('should not open the onboarding screen when it is already dismissed', async () => {
        // Verify that onboarding screen is visible
        await searchPage.waitForLocatorVisible(searchPage.onboardingContainer)

        // Go to Browser page
        await browserPage.navigateToBrowserPage()

        // Navigate back to vector search page
        await searchPage.navigateToVectorSearchPage()

        // Verify that onboarding screen is not visible anymore
        await searchPage.waitForLocatorVisible(searchPage.vectorSearchPage)
    })
})
