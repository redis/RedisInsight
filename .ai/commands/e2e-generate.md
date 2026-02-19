---
description: Explore a page using Playwright MCP and generate E2E tests for a Jira ticket
argument-hint: <ticket-id or ticket-url>
---

# Generate E2E Tests

Use Playwright MCP to explore a page, discover testable functionality, and generate E2E tests based on a Jira ticket.

**Follow all standards in `.ai/rules/e2e-testing.md`**

**Reference:** @tests/e2e-playwright/TEST_PLAN.md

## Prerequisites

- App must be running at `http://localhost:8080` for Playwright exploration

## Input

1. **Ticket ID or URL** (required)

## Process

### Step 1: Fetch Jira Ticket Details

Use the Jira API to get ticket information:
- Summary and description
- Acceptance criteria
- Related components/features

### Step 2: Check Test Plan

Review `tests/e2e-playwright/TEST_PLAN.md` to find related tests:
- ✅ = Already implemented (skip or verify)
- 🔲 = Not implemented (create new)

### Step 3: Explore the Page with Playwright MCP

Navigate to the relevant page based on the ticket's feature area:

```
browser_navigate_Playwright → url (e.g., http://localhost:8080)
browser_snapshot_Playwright
browser_click_Playwright → element, ref
browser_snapshot_Playwright (after each action)
```

Look for:
- `data-testid` attributes → use with `page.getByTestId()`
- Element roles (button, combobox, grid) → use with `page.getByRole()`
- Form field placeholders → use with `page.getByPlaceholder()`

### Step 4: Check Existing Infrastructure

```bash
ls tests/e2e-playwright/tests/
ls tests/e2e-playwright/pages/
ls tests/e2e-playwright/test-data/
```

### Step 5: Generate Test Artifacts

Based on exploration and ticket requirements, create/update:

1. **Page Object** - `tests/e2e-playwright/pages/{feature}/{Feature}Page.ts`
2. **Test Data Factory** - `tests/e2e-playwright/test-data/{feature}/index.ts`
3. **Fixture** (if new page) - Update `tests/e2e-playwright/fixtures/base.ts`
4. **Test File** - `tests/e2e-playwright/tests/{feature}/{action}/*.spec.ts`

### Step 6: Verify

Run only the new tests using list reporter (no HTML report):

```bash
cd tests/e2e-playwright
npx playwright test tests/main/{feature}/{action}/ --project=chromium --reporter=list
npm run lint && npx tsc --noEmit
```

**Note:** Use `--reporter=list` to avoid Playwright generating and hosting an HTML report. Use `--project=chromium` to run only browser tests (faster feedback).

### Step 7: Update Test Plan

Update `tests/e2e-playwright/TEST_PLAN.md` to match actual tests:

- **Rename** test case names to match the actual test titles in spec files
- **Add** new test cases that were created
- **Delete** test cases that were removed or consolidated
- Mark implemented tests as ✅

Test case names in TEST_PLAN.md should exactly match the test titles in spec files (e.g., `should open Help Center and display all menu options`).

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
@e2e-generate RI-7992
@e2e-generate https://redislabs.atlassian.net/browse/RI-7992
```

The command will:
1. Fetch ticket details from Jira
2. Determine the relevant page/feature to test
3. Explore the UI at http://localhost:8080
4. Generate appropriate E2E tests based on ticket requirements
