# E2E Testing Standards (Playwright)

## Location

All E2E tests are in `tests/e2e-v2/`. This is a **standalone package** - no imports from `redisinsight/ui/` or `redisinsight/api/`.

## Project Structure

```
tests/e2e-v2/
├── config/              # Configuration (env, databases, tags)
│   ├── databases/       # Database configs by type
│   └── tags.ts          # Test tags (@smoke, @critical, etc.)
├── fixtures/            # Playwright fixtures
├── helpers/             # API helpers for setup/teardown
├── pages/               # Page Object Models
│   ├── BasePage.ts      # Base class for all pages
│   └── {feature}/       # Feature-specific pages
├── test-data/           # Test data factories
├── tests/               # Test specs (nested by feature)
│   └── {feature}/
│       └── {action}/    # e.g., tests/databases/add/
└── types/               # TypeScript types
```

## Page Objects

### Always Extend BasePage

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class MyPage extends BasePage {
  readonly myButton: Locator;

  constructor(page: Page) {
    super(page);
    this.myButton = page.getByTestId('my-button');
  }

  async goto(): Promise<void> {
    await this.page.goto('/my-page');
    await this.waitForLoad();
  }
}
```

### Component-Based Structure

Break large pages into components:

```typescript
// pages/feature/FeaturePage.ts
export class FeaturePage extends BasePage {
  readonly dialog: FeatureDialog;
  readonly list: FeatureList;

  constructor(page: Page) {
    super(page);
    this.dialog = new FeatureDialog(page);
    this.list = new FeatureList(page);
  }
}
```

## Test Structure

### File Organization

```
tests/
└── {feature}/           # e.g., databases, browser, workbench
    └── {action}/        # e.g., add, edit, delete
        ├── standalone.spec.ts
        └── cluster.spec.ts
```

### Test Template

```typescript
import { test, expect } from '../../../fixtures/base';
import { getTestConfig } from '../../../test-data/{feature}';
import { Tags } from '../../../config';

test.describe('Feature > Action', () => {
  test.beforeEach(async ({ featurePage }) => {
    await featurePage.goto();
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteTestData();
  });

  test(`should do something ${Tags.SMOKE}`, async ({ featurePage }) => {
    const config = getTestConfig();

    await featurePage.doAction(config);

    await expect(featurePage.result).toBeVisible();
  });
});
```

## Test Tags

Always tag tests appropriately:

```typescript
import { Tags } from '../../../config';

// Critical tests - must pass for release
test(`should work ${Tags.CRITICAL} ${Tags.SMOKE}`, ...);

// Regression tests - full coverage
test(`should handle edge case ${Tags.REGRESSION}`, ...);

// Slow tests - may skip in CI
test(`should process large data ${Tags.SLOW}`, ...);
```

## Test Data

### Use Factories with Faker

```typescript
import { faker } from '@faker-js/faker';

export const TEST_PREFIX = 'test-';

export function generateConfig(overrides?: Partial<Config>): Config {
  return {
    name: `${TEST_PREFIX}${faker.string.alphanumeric(8)}`,
    host: '127.0.0.1',
    port: 6379,
    ...overrides,
  };
}
```

### Cleanup Pattern

Always prefix test data with `test-` for easy cleanup:

```typescript
// In apiHelper
async deleteTestData(): Promise<number> {
  return this.deleteByPattern(new RegExp(`^${TEST_PREFIX}`));
}
```

## Fixtures

### Add New Fixtures to base.ts

```typescript
// fixtures/base.ts
type Fixtures = {
  myPage: MyPage;
  apiHelper: ApiHelper;
};

export const test = base.extend<Fixtures>({
  myPage: async ({ page }, use) => {
    await use(new MyPage(page));
  },
  apiHelper: async ({}, use) => {
    const helper = new ApiHelper();
    await use(helper);
    await helper.dispose();
  },
});
```

## Best Practices

### ✅ DO

- Use `data-testid` attributes for stable selectors
- Use `getByRole`, `getByLabel` for accessible elements
- Wait for elements with `expect().toBeVisible()`
- Clean up test data in `afterEach`
- Tag all tests with appropriate tags
- Use API for setup, UI for assertions

### ❌ DON'T

- Use fixed timeouts (`waitForTimeout`)
- Use CSS selectors for dynamic content
- Leave test data after tests
- Import from `redisinsight/ui/` or `redisinsight/api/`
- Hardcode test data (use faker)

## Running Tests

```bash
npm test                    # All tests (local)
npm run test:smoke          # Smoke tests only
npm run test:critical       # Critical tests only
ENV=ci npm test             # CI environment
ENV=staging npm test        # Staging environment
```

