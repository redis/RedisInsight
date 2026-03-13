---
name: Vector Search E2E Tests
overview: Update TEST_PLAN.md with ~37 flow-based Vector Search e2e test cases across 9 subsections, and implement the tests across 5 separate pull requests organized by functional area.
todos:
  - id: pr1-infrastructure-and-navigation
    content: 'PR 1: Infrastructure + TEST_PLAN.md update + 3 navigation tests. Create all page objects under pages/vector-search/, extend ApiHelper, add fixture.'
    status: completed
  - id: pr2-list-indexes
    content: 'PR 2: Add 5 test cases for List Indexes page. Extend page objects as needed.'
    status: completed
  - id: pr3-create-index
    content: 'PR 3: Add 13 test cases for Create Index flow (onboarding, sample data, existing data). Extend page objects as needed.'
    status: completed
  - id: pr4-query
    content: 'PR 4: Add 13 test cases for Query page (7) + Save Query (2) + Query Library (4). Extend page objects as needed.'
    status: completed
  - id: pr5-browser
    content: 'PR 5: Add 4 test cases for Browser page integration. Extend page objects as needed.'
    status: completed
isProject: false
---

# Vector Search E2E Test Plan and Implementation

**JIRA Ticket:** [RI-7969](https://redislabs.atlassian.net/browse/RI-7969)
**Epic:** [RI-7947 - Vector Search v2](https://redislabs.atlassian.net/browse/RI-7947)
**Plan Date:** 2026-03-13
**Planner:** Cursor Agent

---

## Executive Summary

Add comprehensive Playwright e2e tests for the Vector Search feature. The work involves:

1. Updating [TEST_PLAN.md](tests/e2e-playwright/TEST_PLAN.md) section 8 from 4 vague items to ~37 flow-based test cases
2. Implementing the tests across 5 focused PRs with shared infrastructure

**Key Decisions:**

- **Semantic selectors preferred** -- use `getByRole`, `getByText`, `getByPlaceholder` over `getByTestId` (test IDs reserved for containers, icons, non-semantic elements)
- `**StandaloneV7ConfigFactory` (redis:7.4, port 8108, no modules) for RQE not available tests
- `**StandaloneConfigFactory` (redislabs/redismod, port 8100, with all modules) for all other tests

**Key Risks:**

- Redis Stack with Search module must be available in test environment (docker-compose)

---

## 1. TEST_PLAN.md Update

Replace the current sparse section 8 with flow-based subsections. Each test case covers a meaningful user flow rather than individual interactions.

### 8.1 Navigation and RQE Availability (3 cases)

| Status | Group | Test Case                                                      |
| ------ | ----- | -------------------------------------------------------------- |
| 🔲     | main  | Navigate to Vector Search page from navbar tab                 |
| 🔲     | main  | Show RQE not available screen for Redis without search module  |
| 🔲     | main  | Show welcome screen when no indexes exist and RQE is available |

### 8.2 Create Index - Onboarding (3 cases)

| Status | Group | Test Case                                  |
| ------ | ----- | ------------------------------------------ |
| 🔲     | main  | Complete onboarding flow through all steps |
| 🔲     | main  | Skip onboarding                            |
| 🔲     | main  | Onboarding not shown after completion      |

### 8.3 Create Index - Sample Data (3 cases)

| Status | Group | Test Case                                                                              |
| ------ | ----- | -------------------------------------------------------------------------------------- |
| 🔲     | main  | Create index with sample data via "Start querying" and verify navigation to query page |
| 🔲     | main  | Open "See index definition" and verify pre-filled schema on create index page          |
| 🔲     | main  | Verify sample queries are seeded after sample data index creation                      |

### 8.4 Create Index - Existing Data (7 cases)

| Status | Group | Test Case                                                 |
| ------ | ----- | --------------------------------------------------------- |
| 🔲     | main  | Select key and verify schema is inferred from key data    |
| 🔲     | main  | Edit key prefix                                           |
| 🔲     | main  | Add field to index schema                                 |
| 🔲     | main  | Remove field from index schema                            |
| 🔲     | main  | Change field indexing type                                |
| 🔲     | main  | Toggle between table view and command view                |
| 🔲     | main  | Submit index creation and verify navigation to query page |

### 8.5 List Indexes (5 cases)

| Status | Group | Test Case                                                     |
| ------ | ----- | ------------------------------------------------------------- |
| 🔲     | main  | View indexes table with columns and create index entry points |
| 🔲     | main  | Query index action navigates to query page                    |
| 🔲     | main  | Browse index action navigates to browser page                 |
| 🔲     | main  | View index details in side panel                              |
| 🔲     | main  | Delete index with confirmation                                |

### 8.6 Query Page (7 cases)

| Status | Group | Test Case                             |
| ------ | ----- | ------------------------------------- |
| 🔲     | main  | Run query and view results            |
| 🔲     | main  | Expand and collapse query result card |
| 🔲     | main  | Re-run query from result card         |
| 🔲     | main  | Delete individual result card         |
| 🔲     | main  | Clear all results                     |
| 🔲     | main  | Explain query action                  |
| 🔲     | main  | Profile query action                  |

### 8.7 Save Query (2 cases)

| Status | Group | Test Case                                         |
| ------ | ----- | ------------------------------------------------- |
| 🔲     | main  | Save query and verify it appears in query library |
| 🔲     | main  | Cancel save query modal                           |

### 8.8 Query Library (4 cases)

| Status | Group | Test Case                                   |
| ------ | ----- | ------------------------------------------- |
| 🔲     | main  | View saved queries and search in library    |
| 🔲     | main  | Run query from library                      |
| 🔲     | main  | Load query into editor from library         |
| 🔲     | main  | Delete query from library with confirmation |

### 8.9 Browser Page Integration (4 cases)

| Status | Group | Test Case                                                                           |
| ------ | ----- | ----------------------------------------------------------------------------------- |
| 🔲     | main  | View index data from indexed key (single and multiple indexes)                      |
| 🔲     | main  | Navigate to create index from non-indexed key header                                |
| 🔲     | main  | Browse index data from browser                                                      |
| 🔲     | main  | Show RQE not available when clicking Make searchable on Redis without search module |

---

## 2. PR Breakdown

### PR 1: Infrastructure + TEST_PLAN.md + Navigation Tests

**Branch:** `e2e/RI-7969/vector-search--base`

This PR sets up everything. Subsequent PRs only add spec files and extend page objects/helpers when needed.

**Scope:**

- **Update TEST_PLAN.md** -- replace section 8 with the ~37 test cases listed above
- **Create page objects** under `pages/vector-search/`:

```
pages/vector-search/
  VectorSearchPage.ts          # Main page (extends InstancePage), composes all components
  index.ts                     # Barrel export
  components/
    WelcomeScreen.ts
    RqeNotAvailable.ts
    IndexList.ts
    CreateIndexForm.ts
    QueryEditor.ts
    QueryLibrary.ts
    QueryResults.ts
    IndexInfoPanel.ts
    DeleteConfirmationModal.ts  # Exports DeleteIndexModal + DeleteQueryModal
    SaveQueryModal.ts
    PickSampleDataModal.ts
```

- **Extend [NavigationTabs](tests/e2e-playwright/pages/components/NavigationTabs.ts)** with:
  - `searchTab` locator: `page.getByRole('tab', { name: 'Search' })`
  - `gotoSearch()` method: clicks Search tab and asserts aria-selected
- **Extend [InstancePage](tests/e2e-playwright/pages/InstancePage.ts)** with:
  - `navigateToSearch()` method
- **Extend [ApiHelper](tests/e2e-playwright/helpers/api.ts)** with:
  - `sendCommand(databaseId, command, args[])` -- generic Redis command execution
  - `createIndex(databaseId, indexName, prefix, schema)` -- convenience wrapper
  - `deleteIndex(databaseId, indexName)` -- convenience wrapper
  - `deleteAllIndexes(databaseId)` -- lists indexes via `FT._LIST` and drops each
- **Add `vectorSearchPage` fixture** to [base.ts](tests/e2e-playwright/fixtures/base.ts)
- **Export** new page from [pages/index.ts](tests/e2e-playwright/pages/index.ts)
- **Add `StandaloneV7ConfigFactory`** to [test-data/databases](tests/e2e-playwright/test-data/databases/index.ts) for no-module testing
- **Write tests:** Section 8.1 (3 test cases) in `tests/main/vector-search/navigation/`

**Navigation pattern** (via navbar tab, not sidebar):

```typescript
async goto(databaseId: string): Promise<void> {
  await this.gotoDatabase(databaseId);
  await this.navigationTabs.gotoSearch();
  await this.waitForLoad();
}
```

**Welcome screen test requires cleanup** -- shared Redis instance may have leftover indexes:

```typescript
test.beforeAll(async ({ apiHelper }) => {
  database = await apiHelper.createDatabase(StandaloneConfigFactory.build());
  await apiHelper.deleteAllIndexes(database.id);
});
```

**RQE not available test uses V7** -- plain Redis without modules:

```typescript
test.beforeAll(async ({ apiHelper }) => {
  databaseNoModules = await apiHelper.createDatabase(
    StandaloneV7ConfigFactory.build(),
  );
});
```

---

### PR 2: List Indexes Tests

**Branch:** `e2e/RI-7969/vector-search-list-indexes`

- Add 5 test cases (section 8.5) in `tests/main/vector-search/list-indexes/`
- Extend page objects/helpers as needed for list-specific interactions
- `beforeAll`: create database + create test indexes via `apiHelper.createIndex`
- `afterAll`: drop indexes + delete database

---

### PR 3: Create Index Tests

**Branch:** `e2e/RI-7969/vector-search-create-index`

- Add 13 test cases (sections 8.2 + 8.3 + 8.4) in `tests/main/vector-search/create-index/`
- Split into: `onboarding.spec.ts`, `sample-data.spec.ts`, `existing-data.spec.ts`
- Extend page objects/helpers as needed for create index interactions
- `beforeAll`: create database + seed test Hash/JSON keys for existing data flow
- `afterAll`: cleanup indexes + keys + database

---

### PR 4: Query + Query Library Tests

**Branch:** `e2e/RI-7969/vector-search-query`

- Add 13 test cases (sections 8.6 + 8.7 + 8.8) in `tests/main/vector-search/query/`
- Split into: `query-editor.spec.ts` (7 cases), `save-query.spec.ts` (2 cases), `query-library.spec.ts` (4 cases)
- Extend page objects/helpers as needed for query interactions
- `beforeAll`: create database + create index + seed sample data
- `afterAll`: cleanup

---

### PR 5: Browser Integration Tests

**Branch:** `e2e/RI-7969/vector-search-browser`

- Add 4 test cases (section 8.9) in `tests/main/vector-search/browser-integration/`
- Extend existing `BrowserPage` and vector search page objects as needed
- `beforeAll`: create database + create index + seed indexed keys
- `afterAll`: cleanup
- **RQE not available from Browser:** Uses `StandaloneV7ConfigFactory` to create a Redis database without Search module, creates a hash key, clicks "Make searchable" button, and asserts the RQE not available screen

---

## 3. Shared Test Infrastructure

### Selector Strategy

Selectors follow Playwright best practices, prioritizing how users interact with the UI:

1. `**getByRole` -- buttons, tabs, headings, links, menu items (preferred)
2. `**getByText` -- visible text content
3. `**getByPlaceholder` -- input fields
4. `**getByLabel` -- labeled form elements
5. `**getByTestId` -- last resort for containers, icons, non-semantic elements

### Page Object Design

- **Split delete modals**: `DeleteIndexModal` and `DeleteQueryModal` are separate classes (exported from `DeleteConfirmationModal.ts`) because they have different button labels ("Delete index" / "Keep index" vs "Delete query" / "Keep query")
- **Getter-based locators for dynamic elements**: `QueryResults` uses getter properties (`firstCardHeader`, `firstCardReRunButton`, etc.) for accessing the first result card's actions
- **Helper methods for parameterized locators**: `IndexList.getCreateIndexMenuItem()`, `QueryLibrary.getItemRunButton(id)`, etc.

### Test Data Strategy

- Use `**StandaloneConfigFactory` (redislabs/redismod, port 8100) for all tests requiring Search module
- Use `**StandaloneV7ConfigFactory` (redis:7.4-rc2, port 8108, no modules) for RQE not available tests
- Create indexes via `FT.CREATE` in `beforeAll` using `apiHelper.createIndex`
- Clean up all indexes via `apiHelper.deleteAllIndexes` when testing welcome screen
- Seed Hash/JSON keys with known data for deterministic query results
- Clean up indexes and keys in `afterAll`
- Use `test-vs-` prefix for all vector search test data

### Redis Commands Used in Tests

- `FT.CREATE` -- create search index
- `FT.DROPINDEX` -- delete search index
- `FT._LIST` -- list all indexes (used by `deleteAllIndexes`)
- `FT.INFO` -- get index info
- `FT.SEARCH` -- search index
- `FT.EXPLAIN` / `FT.PROFILE` -- query analysis

---

## 4. Dependencies and Prerequisites

- **Redis Stack with Search module** must be available in docker-compose test environment (port 8100)
- **Plain Redis without modules** must be available for RQE tests (port 8108, `redis:7.4-rc2`)
- **PR 1 must merge first** -- all other PRs depend on it for page objects, helpers, and fixtures
- **PRs 2-5 are independent** of each other and can be developed in parallel after PR 1
- **RI-7944** completion may affect PR 5 (Browser Integration) scope

---

## 5. Testing Strategy

- All tests go in `tests/main/vector-search/` (parallel execution)
- Use `test.describe` for grouping, avoid `test.describe.serial` unless steps truly depend on each other
- Create index operations that modify state should use serial describes
- Read-only tests (list, view details) can run in parallel
- Each spec file manages its own setup/teardown
- Shared Redis instances require explicit cleanup (e.g., `deleteAllIndexes`) before state-sensitive tests

---

## 6. Implementation Plan

### Files to beCreated/Modified

**Modified (existing files):**

- `tests/e2e-playwright/TEST_PLAN.md` -- Section 8 with ~37 test cases
- `tests/e2e-playwright/fixtures/base.ts` -- Added `vectorSearchPage` fixture
- `tests/e2e-playwright/helpers/api.ts` -- Added `createIndex`, `deleteIndex`, `deleteAllIndexes`
- `tests/e2e-playwright/pages/index.ts` -- Re-exported `VectorSearchPage`
- `tests/e2e-playwright/pages/InstancePage.ts` -- Added `navigateToSearch()`
- `tests/e2e-playwright/pages/components/NavigationTabs.ts` -- Added `searchTab`, `gotoSearch()`
- `tests/e2e-playwright/test-data/databases/index.ts` -- Added `StandaloneV7ConfigFactory`, `StandaloneV8ConfigFactory`

**New (page objects):**

- `pages/vector-search/VectorSearchPage.ts`
- `pages/vector-search/index.ts`
- `pages/vector-search/components/` -- 11 component page objects

**New (test specs):**

- `tests/main/vector-search/navigation/navigation.spec.ts` -- 3 tests
- `tests/main/vector-search/list-indexes/list-indexes.spec.ts` -- 5 tests
- `tests/main/vector-search/create-index/onboarding.spec.ts` -- 3 tests
- `tests/main/vector-search/create-index/sample-data.spec.ts` -- 3 tests
- `tests/main/vector-search/create-index/existing-data.spec.ts` -- 7 tests
- `tests/main/vector-search/query/query-editor.spec.ts` -- 7 tests
- `tests/main/vector-search/query/save-query.spec.ts` -- 2 tests
- `tests/main/vector-search/query/query-library.spec.ts` -- 4 tests
- `tests/main/vector-search/browser-integration/browser-integration.spec.ts` -- 4 tests

**Total: 38 test cases across 9 spec files**
