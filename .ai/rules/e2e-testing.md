# E2E Testing Standards (Playwright)

## Location

All E2E tests are in `tests/e2e-v2/`. This is a **standalone package** - no imports from `redisinsight/ui/` or `redisinsight/api/`.

## Test Plan

**Always refer to `tests/e2e-v2/TEST_PLAN.md`** for:
- Test coverage status (✅ implemented, 🔲 not implemented)
- Test priorities (🔴 critical, 🟠 smoke, 🟢 regression)
- Feature implementation order
- Test data requirements

**After implementing tests, update TEST_PLAN.md** to mark tests as ✅.

## Project Structure

```
tests/e2e-v2/
├── TEST_PLAN.md         # Master test plan with coverage status
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

## UI Exploration with Playwright MCP

**Before writing tests, ALWAYS use Playwright MCP to explore the UI:**

### Why Explore First?
- Discover actual `data-testid` attributes used in the application
- Understand element roles and accessible names for `getByRole()`
- See page structure and component hierarchy
- Avoid trial-and-error test writing

### Exploration Workflow

1. **Navigate to the page**: `browser_navigate_Playwright` to target URL
2. **Take snapshot**: `browser_snapshot_Playwright` to see element tree
3. **Interact with elements**: `browser_click_Playwright` to trigger dialogs, dropdowns, etc.
4. **Wait for async content**: `browser_wait_for_Playwright` for dynamic content
5. **Document findings**: Add discovered UI patterns to `TEST_PLAN.md` under the feature section

### What to Look For

- `data-testid` attributes → use with `page.getByTestId()`
- Element roles (button, combobox, grid, treeitem) → use with `page.getByRole()`
- Accessible names → use with `{ name: 'text' }` option
- Form field placeholders → use with `page.getByPlaceholder()`
- Text content patterns → use with `page.getByText()`

### Document Patterns in TEST_PLAN.md

After exploring a feature, add a "UI Patterns" subsection under that feature in `TEST_PLAN.md`:

```markdown
### Feature Name
| Status | Priority | Test Case |
...

#### UI Patterns
- **Element**: `page.getByTestId('element-id')` or `page.getByRole('button', { name: 'text' })`
```

## Best Practices

### ✅ DO

- **Explore UI with Playwright MCP before writing tests**
- Use `data-testid` attributes for stable selectors
- Use `getByRole`, `getByLabel` for accessible elements
- Wait for elements with `waitFor({ state: 'visible' })`
- Clean up test data in `afterEach`
- Tag all tests with appropriate tags
- Use API for setup, UI for assertions
- Handle both List view and Tree view in key assertions

### ❌ DON'T

- Write tests without exploring the actual UI first
- Use fixed timeouts (`waitForTimeout`)
- Use CSS selectors for dynamic content
- Leave test data after tests
- Import from `redisinsight/ui/` or `redisinsight/api/`
- Hardcode test data (use faker)
- Assume element structure without verification

## Running Tests

```bash
npm test                    # All tests (local)
npm run test:smoke          # Smoke tests only
npm run test:critical       # Critical tests only
ENV=ci npm test             # CI environment
ENV=staging npm test        # Staging environment
```

## Test Isolation (IMPORTANT)

Tests that share database state should use:

### 1. Serial Execution

```typescript
test.describe.serial('Feature Name', () => {
  // Tests run sequentially within this describe block
});
```

### 2. Unique Prefixes Per Test File

```typescript
let uniquePrefix: string;

test.beforeEach(async ({ apiHelper }) => {
  const uniqueId = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
  uniquePrefix = `test-feature-${uniqueId}`;
  // Create test data with uniquePrefix
});

test.afterEach(async ({ apiHelper }) => {
  // Only clean up this test's data
  await apiHelper.deleteDatabasesByPattern(new RegExp(`^${uniquePrefix}`));
});
```

### 3. Wait for Page Load

```typescript
test.beforeEach(async ({ featurePage }) => {
  await featurePage.goto();
  await featurePage.expectElementVisible(expectedElement);
});
```

## Test Plan Priorities

When implementing tests, follow this priority order from `TEST_PLAN.md`:

1. **Phase 1** - Core: Browser (keys), Workbench, CLI
2. **Phase 2** - Key Types: List, Set, ZSet, Stream, JSON
3. **Phase 3** - Analytics: Slow Log, DB Analysis, Pub/Sub
4. **Phase 4** - Advanced: Settings, Cluster, Vector Search
5. **Phase 5** - Integrations: Redis Cloud, Sentinel

## Feature-to-Path Mapping

| Feature | Test Path | Page Object Path |
|---------|-----------|------------------|
| Database List | `tests/databases/list/` | `pages/databases/` |
| Add Database | `tests/databases/add/` | `pages/databases/` |
| Import Database | `tests/databases/import/` | `pages/databases/` |
| Browser Keys | `tests/browser/keys/` | `pages/browser/` |
| Workbench | `tests/workbench/` | `pages/workbench/` |
| Pub/Sub | `tests/pubsub/` | `pages/pubsub/` |
| Slow Log | `tests/analytics/slowlog/` | `pages/analytics/` |
| DB Analysis | `tests/analytics/analysis/` | `pages/analytics/` |
| Settings | `tests/settings/` | `pages/settings/` |
