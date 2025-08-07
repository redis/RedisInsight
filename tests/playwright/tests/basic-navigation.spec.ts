import { test, expect } from '../fixtures/test'

test.describe('Basic Navigation and Element Visibility', () => {
    test('should navigate to the homepage and verify title', async ({
        page,
    }) => {
        const title = await page.title()

        expect(title).toBe('Redis databases')
    })
})
