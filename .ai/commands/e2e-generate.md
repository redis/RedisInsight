---
description: Explore a page using Playwright MCP and generate E2E tests
argument-hint: <url> [focus-area]
---

# Generate E2E Tests

Use Playwright MCP to explore a page, discover testable functionality, and generate E2E tests.

**Follow all standards in `.ai/rules/e2e-testing.md`**

## Input

1. **URL** (required) - Page to explore (e.g., `http://localhost:8080/browser`)
2. **Focus area** (optional) - Specific functionality (e.g., "add key", "settings")

## Process

### Step 1: Check Test Plan

Review `tests/e2e-playwright/TEST_PLAN.md` to find tests to implement:
- ✅ = Already implemented (skip)
- 🔲 = Not implemented (create new)

### Step 2: Explore the Page with Playwright MCP

```
browser_navigate_Playwright → url
browser_snapshot_Playwright
browser_click_Playwright → element, ref
browser_snapshot_Playwright (after each action)
```

Look for:
- `data-testid` attributes → use with `page.getByTestId()`
- Element roles (button, combobox, grid) → use with `page.getByRole()`
- Form field placeholders → use with `page.getByPlaceholder()`

### Step 3: Check Existing Infrastructure

```bash
ls tests/e2e-playwright/tests/
ls tests/e2e-playwright/pages/
ls tests/e2e-playwright/test-data/
```

### Step 4: Generate Test Artifacts

Based on exploration, create/update:

1. **Page Object** - `tests/e2e-playwright/pages/{feature}/{Feature}Page.ts`
2. **Test Data Factory** - `tests/e2e-playwright/test-data/{feature}/index.ts`
3. **Fixture** (if new page) - Update `tests/e2e-playwright/fixtures/base.ts`
4. **Test File** - `tests/e2e-playwright/tests/{feature}/{action}/*.spec.ts`

### Step 5: Verify

```bash
cd tests/e2e-playwright
npx playwright test --grep "<new-test-name>" --reporter=list
npm run lint && npx tsc --noEmit
```

### Step 6: Update Test Plan

Mark implemented tests as ✅ in `tests/e2e-playwright/TEST_PLAN.md`

## Exploration Checklist

- [ ] Main page purpose and entry points
- [ ] Forms and their fields
- [ ] Buttons and their actions
- [ ] Lists/tables and CRUD operations
- [ ] Dialogs/modals triggered by actions
- [ ] Loading states and spinners
- [ ] Success/error toasts
- [ ] Empty states
- [ ] Validation messages
- [ ] `data-testid` attributes

## Feature-to-URL Mapping

| Feature | URL Pattern |
|---------|-------------|
| Database Management | `http://localhost:8080` |
| Browser | `http://localhost:8080/{dbId}/browser` |
| Workbench | `http://localhost:8080/{dbId}/workbench` |
| CLI | (Panel on any database page) |
| Pub/Sub | `http://localhost:8080/{dbId}/pub-sub` |
| Slow Log | `http://localhost:8080/{dbId}/analytics/slowlog` |
| Database Analysis | `http://localhost:8080/{dbId}/analytics/database-analysis` |
| Settings | `http://localhost:8080/settings` |

**Note:** Replace `{dbId}` with an actual database UUID.

## Example Usage

```
@e2e-generate http://localhost:8080
@e2e-generate http://localhost:8080/browser "add string key"
@e2e-generate http://localhost:8080/workbench
```
