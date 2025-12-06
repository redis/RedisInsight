---
description: Explore a page using Playwright MCP and generate E2E tests
argument-hint: <url> [focus-area]
---

# Generate E2E Test (Exploration Mode)

Use Playwright MCP browser tools to explore a page, discover testable functionality, and generate comprehensive E2E tests.

## Test Plan Reference

**IMPORTANT:** Before generating tests, check the test plan at `tests/e2e-v2/TEST_PLAN.md`:
- ✅ = Already implemented (skip or update)
- 🔲 = Not implemented (create new tests)
- 🔴 = Critical priority
- 🟠 = Smoke priority
- 🟢 = Regression priority

After generating tests, **update the TEST_PLAN.md** to mark tests as ✅ implemented.

## Input

1. **URL** (required) - The page to explore (e.g., `http://localhost:8080`, `http://localhost:8080/browser`)
2. **Focus area** (optional) - Specific functionality to focus on (e.g., "add key", "settings")

## Process

### Phase 1: Explore the Page

**Use Playwright MCP tools to understand the page:**

1. **Navigate to the URL:**
   ```
   browser_navigate_Playwright → url
   ```

2. **Take accessibility snapshot to understand structure:**
   ```
   browser_snapshot_Playwright
   ```

3. **Identify interactive elements:**
   - Buttons, links, forms, dialogs
   - Navigation elements
   - Data display areas
   - Look for `data-testid` attributes

4. **Explore functionality by clicking/interacting:**
   ```
   browser_click_Playwright → element, ref
   browser_type_Playwright → element, ref, text
   browser_snapshot_Playwright (after each action)
   ```

5. **Take screenshots for reference:**
   ```
   browser_take_screenshot_Playwright → filename
   ```

### Phase 2: Document Discovered Functionality

After exploration, document:

1. **Page purpose and main features**
2. **User flows identified** (e.g., "add item → fill form → submit → see in list")
3. **Interactive elements found** (with their `data-testid` or selectors)
4. **Edge cases and error states** (validation errors, empty states)
5. **Data requirements** (what test data is needed)

### Phase 3: Check Existing Test Infrastructure

```bash
# View existing structure
ls tests/e2e-v2/tests/
ls tests/e2e-v2/pages/
ls tests/e2e-v2/test-data/
```

### Phase 4: Generate Test Artifacts

Based on exploration, create/update:

#### 1. Page Object (extends BasePage)

```typescript
// tests/e2e-v2/pages/{feature}/{Feature}Page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class {Feature}Page extends BasePage {
  // Locators discovered during exploration
  readonly elementName: Locator;

  constructor(page: Page) {
    super(page);
    // Use data-testid found during exploration
    this.elementName = page.getByTestId('discovered-testid');
  }

  async goto(): Promise<void> {
    await this.page.goto('/{feature}');
    await this.waitForLoad();
  }

  // Methods for each user action discovered
  async performAction(data: ActionData): Promise<void> {
    // Implementation based on exploration
  }
}
```

#### 2. Test Data Factory

```typescript
// tests/e2e-v2/test-data/{feature}/index.ts
import { faker } from '@faker-js/faker';

export const TEST_PREFIX = 'test-';

export function get{Feature}Config(overrides?: Partial<Config>): Config {
  return {
    name: `${TEST_PREFIX}${faker.string.alphanumeric(8)}`,
    // Fields discovered during form exploration
    ...overrides,
  };
}
```

#### 3. Fixture (if new page)

```typescript
// Update tests/e2e-v2/fixtures/base.ts
{feature}Page: async ({ page }, use) => {
  await use(new {Feature}Page(page));
},
```

#### 4. Test Files

```typescript
// tests/e2e-v2/tests/{feature}/{action}/{variant}.spec.ts
import { test, expect } from '../../../fixtures/base';
import { get{Feature}Config } from '../../../test-data/{feature}';
import { Tags } from '../../../config';

test.describe('{Feature} > {Action}', () => {
  test.beforeEach(async ({ {feature}Page }) => {
    await {feature}Page.goto();
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteTestData();
  });

  // Tests based on discovered user flows
  test(`should {action} successfully ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ {feature}Page }) => {
    // ...
  });

  // Tests based on discovered edge cases
  test(`should show validation error ${Tags.REGRESSION}`, async ({ {feature}Page }) => {
    // ...
  });
});
```

## Exploration Checklist

During exploration, look for:

- [ ] Main page purpose and entry points
- [ ] Forms and their fields (for test data factory)
- [ ] Buttons and their actions
- [ ] Lists/tables and CRUD operations
- [ ] Dialogs/modals triggered by actions
- [ ] Navigation patterns
- [ ] Loading states and spinners
- [ ] Success/error toasts or messages
- [ ] Empty states
- [ ] Validation messages
- [ ] `data-testid` attributes for stable selectors

## Key UI Patterns Discovered

### Browser Page

**View Modes:**
- **List view**: Uses `grid` with `row`/`gridcell`, shows "Total: X"
- **Tree view**: Uses `treeitem` elements, shows "Results: X"

**Common TestIDs:**
- `btn-add-key` - Add key button
- `select-key-type` - Key type dropdown in Add Key dialog
- `select-filter-key-type` - Key type filter dropdown
- `view-type-browser-btn` - List view button
- `view-type-list-btn` - Tree view button
- `search-btn` - Search button
- `back-right-panel-btn` - Back button

**Key List Patterns:**
```typescript
// List view - find key by gridcell
page.getByRole('gridcell', { name: keyName })

// Tree view - find key by treeitem (name includes type, key, TTL, size)
page.getByRole('treeitem', { name: new RegExp(keyName) })

// Wait for keys to load (handles both views)
page.getByText(/Total:|Results:/).first()
```

**Add Key Dialog:**
- Key type dropdown: `getByTestId('select-key-type')`
- Key type options: `getByRole('option', { name: type, exact: true })`
- Form fields use placeholders like "Enter Field", "Enter Value", "Enter Member"

## Test Generation Checklist

- [ ] Page object extends `BasePage`
- [ ] Page object has `goto()` method with `waitForLoad()`
- [ ] All discovered `data-testid` attributes used as locators
- [ ] Test data uses `TEST_PREFIX` for cleanup
- [ ] Test data uses `faker` for dynamic values
- [ ] Tests tagged appropriately (`@smoke`, `@critical`, `@regression`)
- [ ] Tests use `beforeEach` for navigation
- [ ] Tests use `afterEach` for cleanup
- [ ] Happy path tests marked as `@smoke @critical`
- [ ] Edge case tests marked as `@regression`

## Tags Reference

- `Tags.CRITICAL` - Must pass for releases
- `Tags.SMOKE` - Quick sanity checks
- `Tags.REGRESSION` - Full test coverage
- `Tags.SLOW` - Long-running tests
- `Tags.FLAKY` - Known unstable tests

## Example Usage

```
@generate-e2e-test http://localhost:8080
@generate-e2e-test http://localhost:8080/browser "add string key"
@generate-e2e-test http://localhost:8080/workbench
```

## Post-Generation: Update Test Plan

After generating tests, update `tests/e2e-v2/TEST_PLAN.md`:

1. Change status from `🔲` to `✅` for implemented tests
2. Add any new test cases discovered during exploration
3. Note any blockers or issues in the Notes section

Example update:
```markdown
| ✅ | 🔴🟠 | Add String key |  <!-- Changed from 🔲 to ✅ -->
```

## Feature-to-URL Mapping

Use this reference to navigate to features in the test plan:

| Test Plan Section | URL Pattern |
|-------------------|-------------|
| 1. Database Management | `http://localhost:8080` |
| 2. Browser Page | `http://localhost:8080/{dbId}/browser` |
| 3. Workbench | `http://localhost:8080/{dbId}/workbench` |
| 4. CLI | (Panel on any database page) |
| 5. Pub/Sub | `http://localhost:8080/{dbId}/pub-sub` |
| 6.1 Slow Log | `http://localhost:8080/{dbId}/analytics/slowlog` |
| 6.2 Database Analysis | `http://localhost:8080/{dbId}/analytics/database-analysis` |
| 6.3 Cluster Details | `http://localhost:8080/{dbId}/analytics/cluster-details` |
| 7. Settings | `http://localhost:8080/settings` |
| 8. Vector Search | `http://localhost:8080/{dbId}/vector-search` |
| 9. Redis Cloud | `http://localhost:8080/redis-cloud/*` |
| 10. Sentinel | `http://localhost:8080/sentinel/*` |

**Note:** Replace `{dbId}` with an actual database UUID after connecting.
