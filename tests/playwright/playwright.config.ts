import { defineConfig, devices } from '@playwright/test'
import { Status } from 'allure-js-commons'
import dotenv from 'dotenv'
import * as os from 'os'

dotenv.config({
    path: process.env.envPath ?? 'env/.local-web.env',
    override: true,
})

export type TestOptions = {
    apiUrl: string
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<TestOptions>({
    testDir: './tests',
    /* Maximum time one test can run for. */
    timeout: 600 * 1000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 5000,
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    // workers: process.env.CI ? 1 : undefined,
    workers: 1,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['line'],
        ['html'],
        [
            'allure-playwright',
            {
                resultsDir: 'allure-results',
                detail: true,
                suiteTitle: true,
                links: {
                    issue: {
                        nameTemplate: 'Issue #%s',
                        urlTemplate: 'https://issues.example.com/%s',
                    },
                    tms: {
                        nameTemplate: 'TMS #%s',
                        urlTemplate: 'https://tms.example.com/%s',
                    },
                    jira: {
                        urlTemplate: (v: any) =>
                            `https://jira.example.com/browse/${v}`,
                    },
                },
                categories: [
                    {
                        name: 'foo',
                        messageRegex: 'bar',
                        traceRegex: 'baz',
                        matchedStatuses: [Status.FAILED, Status.BROKEN],
                    },
                ],
                environmentInfo: {
                    os_platform: os.platform(),
                    os_release: os.release(),
                    os_version: os.version(),
                    node_version: process.version,
                },
            },
        ],
    ],

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://127.0.0.1:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        testIdAttribute: 'data-testid',
        headless: true,
        deviceScaleFactor: undefined,
        viewport: { width: 1920, height: 1080 },
        video: {
            mode: 'on',
            size: { width: 1920, height: 1080 },
        },
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'Chromium',
            testMatch: ['**.spec.ts'],
            use: {
                ...devices['Desktop Chrome'],
                baseURL: process.env.COMMON_URL,
                // headless: false,
                launchOptions: {
                    args: [
                        '--no-sandbox',
                        '--start-maximized',
                        '--disable-dev-shm-usage',
                        '--ignore-certificate-errors',
                        '--disable-search-engine-choice-screen',
                        // '--disable-blink-features=AutomationControlled',
                        // '--disable-component-extensions-with-background-pages',
                    ],
                },
            },
        },
    ],

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://127.0.0.1:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
})
