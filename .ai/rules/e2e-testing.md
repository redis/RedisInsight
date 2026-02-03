# E2E Testing Standards (Playwright)

## Location

All E2E tests are in `tests/e2e-playwright/`. This is a **standalone package** - no imports from `redisinsight/ui/` or `redisinsight/api/`.

## Test Plan

**Always refer to `tests/e2e-playwright/TEST_PLAN.md`** for:
- Test coverage status (✅ implemented, 🔲 not implemented)
- Feature implementation order
- Test data requirements

**After implementing tests, update TEST_PLAN.md** to mark tests as ✅.

## Project Structure

```
tests/e2e-playwright/
├── TEST_PLAN.md         # Master test plan with coverage status
├── config/              # Configuration (env, databases)
│   └── databases/       # Database configs by type
├── fixtures/            # Playwright fixtures
├── helpers/             # API helpers for setup/teardown
├── pages/               # Page Object Models
│   ├── BasePage.ts      # Base class for all pages
│   ├── InstancePage.ts  # Base class for database instance pages
│   ├── components/      # Shared components (InstanceHeader, NavigationTabs, BottomPanel)
│   └── {feature}/       # Feature-specific pages (browser/, cli/, etc.)
├── test-data/           # Test data factories
├── tests/               # Test specs organized by project
│   ├── main/            # Default parallel tests
│   │   └── {feature}/
│   │       └── {action}/
│   ├── auto-update/     # Serial tests with special setup
│   └── electron/        # Electron-specific tests
└── types/               # TypeScript types
```

## Playwright Projects

Tests are organized into **projects** based on execution requirements. Each project can have different parallelism, timeouts, and setup.

| Project | Folder | Parallelism | Use Case |
|---------|--------|-------------|----------|
| `main` | `tests/main/` | Parallel | Standard tests that can run concurrently |
| `auto-update` | `tests/auto-update/` | Serial | Tests requiring special setup or causing flakiness |
| `electron` | `tests/electron/` | Serial | Electron-specific features (deep links, etc.) |

### Running Projects

```bash
npx playwright test --project=main           # Only main parallel tests
npx playwright test --project=auto-update    # Only auto-update tests
npx playwright test                           # All projects
```

### When to Create a New Project

Create a new project folder when tests:
- Require different parallelism settings (serial vs parallel)
- Need different global setup/teardown
- Would cause flakiness when run with other tests
- Require special environment configuration

### Adding a New Project

1. Create folder under `tests/` (e.g., `tests/my-feature/`)
2. Add project configuration in `playwright.config.ts`:

```typescript
{
  name: 'my-feature',
  testDir: './tests/my-feature',
  fullyParallel: false, // or true
  workers: 1,
  timeout: 120000,
  // Optional: different setup
  // globalSetup: './my-feature-setup.ts',
}
```

## Page Objects

### Page Object Hierarchy

```
BasePage (abstract)
  ├── DatabasesPage           # Databases list page
  ├── SettingsPage            # Settings page
  └── InstancePage (abstract) # Base for all database instance pages
        ├── instanceHeader    # Database name, stats, breadcrumb
        ├── navigationTabs    # Browse, Workbench, Analyze, Pub/Sub
        ├── bottomPanel       # CLI, Command Helper, Profiler
        └── BrowserPage       # Browser-specific (extends InstancePage)
              └── WorkbenchPage (future)
              └── AnalyzePage (future)
              └── PubSubPage (future)
```

### Extend the Appropriate Base Class

- **BasePage** - For standalone pages (DatabasesPage, SettingsPage)
- **InstancePage** - For pages within a connected database (BrowserPage, WorkbenchPage, etc.)

Page objects are **stateless** - they don't store database objects. Pass `databaseId` to navigation methods.

```typescript
// For database instance pages - extend InstancePage
import { Page, Locator } from '@playwright/test';
import { InstancePage } from '../InstancePage';

export class WorkbenchPage extends InstancePage {
  readonly editor: Locator;

  constructor(page: Page) {
    super(page);
    this.editor = page.getByTestId('workbench-editor');
  }

  // InstancePage provides: instanceHeader, navigationTabs, bottomPanel
  // Plus navigation methods: navigateToBrowser(), openCli(), etc.

  async goto(databaseId: string): Promise<void> {
    await this.gotoDatabase(databaseId);
    await this.navigationTabs.gotoWorkbench();
    await this.waitForLoad();
  }
}
```

### Component-Based Structure

Break large pages into components:

```typescript
// pages/feature/FeaturePage.ts
export class FeaturePage extends InstancePage {
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
├── main/                # Default parallel tests (most tests go here)
│   └── {feature}/       # e.g., databases, browser, workbench
│       └── {action}/    # e.g., add, edit, delete
│           ├── standalone.spec.ts
│           └── cluster.spec.ts
├── auto-update/         # Serial tests with special setup
└── electron/            # Electron-specific tests
```

### Test Setup Pattern

Use simple, explicit setup with clear separation of concerns. **Page objects are fixtures** - they don't store database state. Pass `databaseId` to `goto()` methods.

```typescript
import { test, expect } from '../../../fixtures/base';
import { standaloneConfig } from '../../../config/databases/standalone';
import { DatabaseInstance } from '../../../types';

test.describe('Feature > Action', () => {
  let database: DatabaseInstance;

  // Setup: Create database once for all tests
  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase({
      name: 'test-feature-db',
      host: standaloneConfig.host,
      port: standaloneConfig.port,
    });
  });

  // Teardown: Clean up database after all tests
  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteDatabase(database.id);
  });

  test.describe('Sub-feature', () => {
    // Navigation: Pass databaseId to goto() - page is a fixture
    test.beforeEach(async ({ featurePage }) => {
      await featurePage.goto(database.id);
    });

    // Tests receive page fixtures they need
    test('should do something', async ({ featurePage }) => {
      await featurePage.doAction();
      await expect(featurePage.result).toBeVisible();
    });

    // Tests that need both page and apiHelper
    test('should create and verify', async ({ featurePage, apiHelper }) => {
      await apiHelper.createKey(database.id, 'test-key', 'value');
      await featurePage.refresh();
      await expect(featurePage.keyList).toContainText('test-key');
    });
  });
});
```

### Key Principles

1. **`beforeAll`** - Create database/test data via API (runs once)
2. **`afterAll`** - Clean up database/test data via API (runs once)
3. **`beforeEach`** - Navigate to page via UI using `goto(databaseId)` (runs before each test)
4. **Individual tests** - Receive page fixtures they need in the signature
5. **Page objects are stateless** - Don't store database objects in pages, pass IDs to methods

### Avoid These Anti-Patterns

```typescript
// ❌ BAD: Storing database in page object
const browserPage = createBrowserPage(database);  // OLD pattern - don't use

// ✅ GOOD: Pass databaseId to goto()
await browserPage.goto(database.id);

// ❌ BAD: Using page fixture without declaring it in test signature
test('should work', async () => {
  await browserPage.doSomething();  // browserPage is undefined!
});

// ✅ GOOD: Declare fixtures in test signature
test('should work', async ({ browserPage }) => {
  await browserPage.doSomething();
});

// ❌ BAD: Navigation inside each test
test('should work', async ({ browserPage }) => {
  await browserPage.goto(database.id);  // Should be in beforeEach
  // ...
});

// ❌ BAD: Using test.describe.serial when not needed
test.describe.serial('Feature', () => { // Use regular describe unless tests truly depend on each other
  // ...
});
```

## Test Data

### Use Fishery Factories with Faker

Use the [fishery](https://github.com/thoughtbot/fishery) library for test data factories:

```typescript
import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

export const TEST_PREFIX = 'test-';

export const ConfigFactory = Factory.define<Config>(() => ({
  name: `${TEST_PREFIX}${faker.string.alphanumeric(8)}`,
  host: '127.0.0.1',
  port: 6379,
}));

// Usage in tests
const config = ConfigFactory.build();
const config = ConfigFactory.build({ name: 'custom-name' });
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

### Use Discovered Patterns in Page Objects

After exploring, use discovered patterns directly in Page Object locators:

```typescript
// Use data-testid when available
this.addButton = page.getByTestId('btn-add-key');

// Use role + name for accessible elements
this.submitButton = page.getByRole('button', { name: 'Submit' });

// Use placeholder for form fields
this.searchInput = page.getByPlaceholder('Search...');
```

**Note**: Keep TEST_PLAN.md as a simple visual list of test cases. Document UI patterns in Page Object comments if needed.

## Best Practices

### ✅ DO

- **Explore UI with Playwright MCP before writing tests**
- **Use Page Object navigation methods** (e.g., `browserPage.goto()`, `workbenchPage.goto()`)
- Use `data-testid` attributes for stable selectors
- Use `getByRole`, `getByLabel` for accessible elements
- Wait for elements with `waitFor({ state: 'visible' })`
- Clean up test data in `afterEach`
- Use API for setup, UI for assertions
- Handle both List view and Tree view in key assertions

### ❌ DON'T

- **NEVER use `page.goto()` directly** - tests must work in both browser and Electron
- Write tests without exploring the actual UI first
- Use fixed timeouts (`waitForTimeout`)
- Use CSS selectors for dynamic content
- Leave test data after tests
- Import from `redisinsight/ui/` or `redisinsight/api/`
- Hardcode test data (use faker)
- Assume element structure without verification

## Navigation (IMPORTANT)

**All navigation must use UI-based methods, NOT URL navigation.**

Tests must work in both browser mode (http://localhost:8080) and Electron mode (no baseURL). Direct `page.goto()` calls fail in Electron because there's no baseURL.

### ✅ Correct Navigation Pattern

```typescript
// Use Page Object's goto() method
test.beforeEach(async ({ createBrowserPage }) => {
  browserPage = createBrowserPage(database);
  await browserPage.goto();  // Uses UI navigation internally
});

// Use BasePage navigation methods
await browserPage.gotoHome();       // Click Redis logo
await browserPage.gotoWorkbench();  // Click Workbench tab
await browserPage.gotoBrowser();    // Click Browse tab
await browserPage.gotoPubSub();     // Click Pub/Sub tab
await browserPage.gotoSettings();   // Navigate to settings via UI
```

### ❌ Incorrect Navigation Pattern

```typescript
// NEVER do this - fails in Electron
await page.goto(`/${database.id}/browser`);
await page.goto('/settings');
await page.goto('/');
```

## Running Tests

```bash
npm test                    # Main project tests (default)
npm run test:main           # Main project tests only
npm run test:electron       # Electron tests (auto-detects platform)
npm run test:all            # All projects
ENV=ci npm test             # CI environment
ENV=staging npm test        # Staging environment
```

## Code Quality (IMPORTANT)

**Always run linter and type checker after making changes:**

```bash
npm run lint                # ESLint check
npx tsc --noEmit            # TypeScript type check
```

Both must pass before committing. Common issues:
- Unused variables/imports
- Missing return types
- `any` types (avoid when possible)
- Null/undefined handling (use proper types like `Promise<string | null>`)

## Test Isolation (IMPORTANT)

Tests should be isolated and not depend on execution order:

### 1. Shared Database with beforeAll/afterAll

```typescript
test.describe('Feature Name', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase({ name: 'test-feature-db', ... });
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteDatabase(database.id);
  });

  // Tests can run in parallel - they share the database but don't modify shared state
});
```

### 2. Use Serial Only When Tests Truly Depend on Each Other

```typescript
// Only use .serial when tests modify state that subsequent tests depend on
test.describe.serial('Workflow that modifies state', () => {
  test('step 1: create item', ...);
  test('step 2: modify item created in step 1', ...);
  test('step 3: delete item', ...);
});
```

### 3. Unique Test Data Per Test (when needed)

```typescript
test('should create unique item', async ({ apiHelper }) => {
  const uniqueName = `test-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  // Use uniqueName for this test's data
});
```

## Feature-to-Path Mapping

Follow this naming convention for test and page object paths:

| Feature | Test Path | Page Object Path |
|---------|-----------|------------------|
| Database List | `tests/main/databases/list/` | `pages/databases/` |
| Add Database | `tests/main/databases/add/` | `pages/databases/` |
| Import Database | `tests/main/databases/import/` | `pages/databases/` |
| Browser - Key List | `tests/main/browser/key-list/` | `pages/browser/` |
| Browser - Add Key | `tests/main/browser/add-key/` | `pages/browser/` |
| Browser - Key Details | `tests/main/browser/key-details/` | `pages/browser/` |
| Workbench | `tests/main/workbench/` | `pages/workbench/` |
| CLI | `tests/main/cli/` | `pages/cli/` |
| Pub/Sub | `tests/main/pubsub/` | `pages/pubsub/` |
| Slow Log | `tests/main/analytics/slow-log/` | `pages/analytics/` |
| DB Analysis | `tests/main/analytics/analysis/` | `pages/analytics/` |
| Settings | `tests/main/settings/` | `pages/settings/` |
| Navigation | `tests/main/navigation/` | `pages/navigation/` |
| Auto-Update | `tests/auto-update/` | `pages/` (shared) |
| Deep Links | `tests/electron/deep-links/` | `pages/` (shared) |

**Note**: Most tests go in `tests/main/`. Only use other project folders for tests with special requirements (serial execution, different setup, etc.).
