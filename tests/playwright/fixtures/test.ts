/* eslint-disable no-empty-pattern */
import { test as base, expect } from '@playwright/test'
import {
    BrowserContext,
    ElectronApplication,
    Page,
    _electron as electron,
} from 'playwright'
import log from 'node-color-log'
import { AxiosInstance } from 'axios'
import * as crypto from 'crypto'
import fs from 'fs'
import path from 'path'

import { apiUrl, isElectron, electronExecutablePath } from '../helpers/conf'
import { generateApiClient } from '../helpers/api/http-client'
import { APIKeyRequests } from '../helpers/api/api-keys'
import { DatabaseAPIRequests } from '../helpers/api/api-databases'
import { UserAgreementDialog } from '../pageObjects'

// Coverage type declaration
declare global {
    interface Window {
        // eslint-disable-next-line no-underscore-dangle
        __coverage__: any
    }
}

export function generateUUID(): string {
    return crypto.randomBytes(16).toString('hex')
}

type CommonFixtures = {
    forEachTest: void
    api: {
        apiClient: AxiosInstance
        keyService: APIKeyRequests
        databaseService: DatabaseAPIRequests
    }
}

const commonTest = base.extend<CommonFixtures>({
    // Simple context setup for coverage
    context: async ({ context }, use) => {
        if (process.env.COLLECT_COVERAGE === 'true') {
            const outputDir = path.join(process.cwd(), '.nyc_output')
            await fs.promises.mkdir(outputDir, { recursive: true })

            // Expose coverage collection function
            await context.exposeFunction(
                'collectIstanbulCoverage',
                (coverageJSON: string) => {
                    if (coverageJSON) {
                        fs.writeFileSync(
                            path.join(
                                outputDir,
                                `playwright_coverage_${generateUUID()}.json`,
                            ),
                            coverageJSON,
                        )
                    }
                },
            )
        }

        await use(context)
    },

    api: async ({ page }, use) => {
        const windowId = await page.evaluate(() => window.windowId)

        const apiClient = generateApiClient(apiUrl, windowId)
        const databaseService = new DatabaseAPIRequests(apiClient)
        const keyService = new APIKeyRequests(apiClient, databaseService)

        await use({ apiClient, keyService, databaseService })
    },
    forEachTest: [
        async ({ page }, use) => {
            // before each test:
            if (!isElectron) {
                await page.goto('/')
            } else {
                await page.locator('[data-testid="home-tab-databases"]').click()
            }

            const userAgreementDialog = new UserAgreementDialog(page)
            await userAgreementDialog.acceptLicenseTerms()

            const skipTourElement = page.locator('button', {
                hasText: 'Skip tour',
            })
            if (await skipTourElement.isVisible()) {
                skipTourElement.click()
            }

            await use()

            // Collect coverage after each test
            if (process.env.COLLECT_COVERAGE === 'true') {
                await page
                    .evaluate(() => {
                        if (
                            typeof window !== 'undefined' &&
                            // eslint-disable-next-line no-underscore-dangle
                            window.__coverage__
                        ) {
                            ;(window as any).collectIstanbulCoverage(
                                // eslint-disable-next-line no-underscore-dangle
                                JSON.stringify(window.__coverage__),
                            )
                        }
                    })
                    .catch(() => {
                        // Ignore errors - page might be closed
                    })
            }
        },
        { auto: true },
    ],
})

const electronTest = commonTest.extend<{
    electronApp: ElectronApplication | null
    page: Page
    context: BrowserContext
}>({
    electronApp: async ({}, use) => {
        const electronApp = await electron.launch({
            executablePath: electronExecutablePath,
            args: ['index.html'],
            timeout: 60000,
        })
        electronApp.on('console', (msg) => {
            log.info(`Electron Log: ${msg.type()} - ${msg.text()}`)
        })

        // Wait for window startup
        await new Promise((resolve) => setTimeout(resolve, 2000))

        await use(electronApp)

        log.info('Closing Electron app...')
        await electronApp.close()
    },
    page: async ({ electronApp }, use) => {
        if (!electronApp) {
            throw new Error('Electron app is not initialized')
        }

        const electronPage = await electronApp.firstWindow()

        await use(electronPage)
    },
    context: async ({ electronApp }, use) => {
        if (!electronApp) {
            throw new Error('Electron app is not initialized')
        }

        const electronContext = electronApp.context()

        await use(electronContext)
    },
})

const test = isElectron ? electronTest : commonTest

export { test, expect, isElectron }
