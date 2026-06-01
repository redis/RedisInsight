---
name: e2e-testing
description: >-
  Playwright end-to-end testing standards for RedisInsight: page
  object models, test structure, fixtures, navigation patterns, and
  flaky-test prevention. Use when editing files under
  tests/e2e-playwright/**, writing Playwright tests, adding page
  objects, or when the user mentions Playwright, E2E tests, page
  objects, or end-to-end testing.
---


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

The folder a test lives in determines its execution mode. Each browser platform has a parallel project and a serial project:

| Project             | Folder            | Parallelism | Use Case |
|---------------------|-------------------|-------------|----------|
| `chromium-parallel` | `tests/parallel/` | Parallel (4 workers) | Standard chromium tests |
| `chromium-serial`   | `tests/serial/`   | Serial (1 worker)    | Sequential chromium tests |
| `electron-parallel` | `tests/parallel/` | Serial (1 worker)*   | Standard electron tests |
| `electron-serial`   | `tests/serial/`   | Serial (1 worker)    | Sequential electron tests |

\* Electron uses one worker today because there is a single app instance.

### Execution order

For each platform, the serial project depends on the parallel project via `dependencies: ['<platform>-parallel']` in [playwright.config.ts](../../tests/e2e-playwright/playwright.config.ts), so the order is always:

1. `<platform>-parallel` runs first (with up to N workers)
2. `<platform>-serial` runs after, one worker at a time

Serial tests perform destructive operations on the shared RTE Redis (`FLUSHDB`, broad `deleteAllIndexes`, dangerous commands) so they can't safely run alongside parallel tests on the same RTE. Electron also can't run its two projects concurrently because the desktop app binds its embedded API on a fixed port (`5530`).

If serial grows large enough to become a CI bottleneck, the next step is to give serial tests a dedicated Redis instance (or split into a separate CI job) — not to revert the ordering.

### Running Projects

```bash
# Full platform run (parallel + serial)
npx playwright test --project=chromium-parallel --project=chromium-serial
npx playwright test --project=electron-parallel --project=electron-serial

# Just one mode
npx playwright test --project=chromium-parallel
npx playwright test --project=chromium-serial

npx playwright test                           # All projects
```

### When to put a test in `tests/serial/`

Put a test in `tests/serial/` when it:
- Shares database state across tests via `beforeAll`
- Runs dangerous commands or mutates global app state
- Cannot tolerate concurrent execution with other tests
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

### Navigation Architecture

**BasePage** provides only fundamental navigation:
```typescript
await this.gotoHome();              // Click Redis logo → databases list
await this.gotoDatabase(dbId);      // Click database → Browser page (default)
```

**Each page owns its navigation** via its `goto()` method:
```typescript
await settingsPage.goto();           // Settings page
await browserPage.goto(dbId);        // Browser page for database
await workbenchPage.goto(dbId);      // Workbench page for database
await analyticsPage.goto(dbId);      // Analytics page for database
await pubSubPage.goto(dbId);         // Pub/Sub page for database
```

**NavigationTabs component** handles tab switching within a connected database:
```typescript
await browserPage.navigationTabs.gotoBrowser();
await browserPage.navigationTabs.gotoWorkbench();
await browserPage.navigationTabs.gotoAnalyze();
await browserPage.navigationTabs.gotoPubSub();
```

### ✅ Correct Navigation Pattern

```typescript
// Use Page Object's goto() method in beforeEach
test.beforeEach(async ({ browserPage }) => {
  await browserPage.goto(database.id);  // Navigates and waits for page load
});

// Switch tabs when already connected
await browserPage.navigationTabs.gotoWorkbench();
```

### ❌ Incorrect Navigation Pattern

```typescript
// NEVER do this - fails in Electron
await page.goto(`/${database.id}/browser`);
await page.goto('/settings');
await page.goto('/');
```

## Running Tests

Run these commands from the E2E package directory:

```bash
cd tests/e2e-playwright

npx playwright test                                    # All Playwright projects
npx playwright test --project=chromium-parallel        # Chromium parallel tests
npx playwright test --project=chromium-serial         # Chromium serial tests
npx playwright test --project=electron-parallel        # Electron parallel tests
npx playwright test --project=electron-serial         # Electron serial tests
ENV=ci npx playwright test                             # CI environment
ENV=staging npx playwright test                        # Staging environment
```

## Code Quality (IMPORTANT)

**Always run linter and type checker after making changes:**

```bash
npm run lint                # ESLint check
npm run type-check          # TypeScript type check
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
| Database List | `tests/parallel/databases/list/` | `pages/databases/` |
| Add Database | `tests/parallel/databases/add/` | `pages/databases/` |
| Import Database | `tests/parallel/databases/import/` | `pages/databases/` |
| Browser - Key List | `tests/parallel/browser/key-list/` | `pages/browser/` |
| Browser - Add Key | `tests/parallel/browser/add-key/` | `pages/browser/` |
| Browser - Key Details | `tests/parallel/browser/key-details/` | `pages/browser/` |
| Workbench | `tests/parallel/workbench/` | `pages/workbench/` |
| CLI | `tests/parallel/cli/` | `pages/cli/` |
| Pub/Sub | `tests/parallel/pubsub/` | `pages/pubsub/` |
| Slow Log | `tests/parallel/analytics/slow-log/` | `pages/analytics/` |
| DB Analysis | `tests/parallel/analytics/analysis/` | `pages/analytics/` |
| Settings | `tests/parallel/settings/` | `pages/settings/` |
| Navigation | `tests/parallel/navigation/` | `pages/navigation/` |
| Auto-Update | `tests/auto-update/` | `pages/` (shared) |
| Deep Links | `tests/electron/deep-links/` | `pages/` (shared) |

**Note**: Most tests go in `tests/parallel/`. Only use other project folders for tests with special requirements (serial execution, different setup, etc.).
