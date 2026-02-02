# RedisInsight E2E Tests v2

Standalone Playwright E2E test suite for RedisInsight.

## Documentation

| Document | Purpose |
|----------|---------|
| [`TEST_PLAN.md`](./TEST_PLAN.md) | Test coverage status and priorities |
| [`.ai/rules/e2e-testing.md`](../../.ai/rules/e2e-testing.md) | Standards and patterns for writing tests |

### AI Commands

Use these commands with Augment AI to generate and fix tests:

| Command | Description |
|---------|-------------|
| `@e2e-generate <url> [focus]` | Explore UI with Playwright MCP and generate tests |
| `@e2e-fix <test-pattern>` | Run tests and fix failures |

Example:
```
@e2e-generate http://localhost:8080/browser "add key"
@e2e-fix "Analytics > Slow Log"
```

## Prerequisites

### Common Setup (All Projects)

Start Redis Test Environment (RTE) using Docker Compose:
```bash
cd tests/e2e
docker-compose -f rte.docker-compose.yml up -d
```

### Project-Specific Setup

| Project | Setup Command | Run Tests |
|---------|---------------|-----------|
| **Chromium** | `yarn dev:api` + `yarn dev:ui` (two terminals) | `npm run test:chromium` |
| **Electron** | `yarn package:prod` | `npm run test:electron` |

> **Note:** Setup commands run from the repository root. Test commands run from `tests/e2e-playwright/`.

## Installation

```bash
cd tests/e2e-playwright
npm install
npx playwright install chromium
```

## Configuration

Copy `example.env` to `.env` and update values for your environment:
```bash
cp example.env .env
```

Environment variables:
- `RI_CLIENT_URL` - RedisInsight UI URL (default: `http://localhost:8080`)
- `RI_API_URL` - RedisInsight API URL (default: `http://localhost:5540`)
- `OSS_STANDALONE_*` - Standalone Redis connection details
- `OSS_CLUSTER_*` - Cluster Redis connection details
- `OSS_SENTINEL_*` - Sentinel Redis connection details

## Running Tests

### Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (all projects) |
| `npm run test:chromium` | Run Chromium browser tests |
| `npm run test:chromium:headed` | Run with visible browser window |
| `npm run test:chromium:debug` | Run with Playwright Inspector (pause & step through) |
| `npm run test:chromium:ui` | Open interactive UI dashboard |
| `npm run test:electron` | Run Electron desktop tests |
| `npm run test:electron:headed` | Run with visible Electron window |
| `npm run test:electron:debug` | Run with Playwright Inspector |
| `npm run test:report` | View HTML test report |
| `npm run test:codegen` | Record actions and generate test code |

### Chromium Browser Tests

```bash
npm test                      # Run all tests
npm run test:chromium         # Run Chromium project only
npm run test:chromium:headed  # Watch tests run
npm run test:chromium:debug   # Pause and step through tests
npm run test:chromium:ui      # Interactive test runner
```

### Electron Desktop Tests

```bash
npm run test:electron         # Run all Electron tests
npm run test:electron:headed  # Watch the app
npm run test:electron:debug   # Debug with Inspector
```

#### Custom Executable Path

If you need to override the default path (e.g., for a custom build location):

```bash
ELECTRON_EXECUTABLE_PATH="/path/to/your/app" npm run test:electron
```

Default paths by platform:
| Platform | Default Path |
|----------|--------------|
| macOS arm64 | `release/mac-arm64/Redis Insight.app/Contents/MacOS/Redis Insight` |
| macOS x64 | `release/mac-x64/Redis Insight.app/Contents/MacOS/Redis Insight` |
| Linux | `release/linux-unpacked/redisinsight` |
| Windows | `release/win-unpacked/Redis Insight.exe` |

#### Electron Test Considerations

- **Single worker**: Electron tests run with 1 worker (sequential execution)
- **Longer timeouts**: Electron tests have 120s timeout (vs 60s for browser)
- **UI-based navigation**: All navigation uses UI clicks (works for both browser and Electron)
- **Same test files**: Browser and Electron tests use the same test files

#### Navigation Methods

All navigation is UI-based for consistency across platforms. `BasePage` provides:

```typescript
// Available in all page objects:
await this.gotoHome();              // Databases list
await this.gotoSettings();          // Settings page
await this.gotoDatabase('mydb');    // Connect to specific database
await this.gotoBrowser();           // Browser (within connected db)
await this.gotoWorkbench();         // Workbench (within connected db)
await this.gotoPubSub();            // Pub/Sub (within connected db)
await this.gotoAnalytics();         // Analytics (within connected db)
```

Page-specific `goto()` methods use these centralized methods:

```typescript
// SettingsPage.ts
async goto(): Promise<void> {
  await this.gotoSettings();
}
```

## Multi-Environment Support

The framework supports multiple environments via the `ENV` variable:

```bash
# Local (default) - uses .env
npm test

# CI - uses .env.ci
ENV=ci npm test

# Staging - uses .env.staging
ENV=staging npm test
```

Create environment-specific `.env.{name}` files for different environments.

## Folder Structure

```
tests/e2e-playwright/
├── config/            # Environment configuration
├── fixtures/          # Test fixtures (page objects, API helpers)
├── helpers/           # Utility functions
├── pages/             # Page Object Models (component-based)
│   └── databases/
│       ├── DatabasesPage.ts
│       └── components/
│           ├── AddDatabaseDialog.ts
│           └── DatabaseList.ts
├── test-data/         # Test data factories
├── tests/             # Test files organized by project
│   ├── main/          # Main parallel tests (default)
│   │   ├── browser/
│   │   ├── workbench/
│   │   └── databases/
│   ├── auto-update/   # Auto-update tests (serial, special setup)
│   └── electron/      # Electron-specific tests
├── types/             # TypeScript type definitions
├── setup/             # Global setup/teardown per project
│   ├── browser.setup.ts
│   ├── browser.teardown.ts
│   ├── electron.setup.ts
│   └── electron.teardown.ts
└── playwright.config.ts
```

### Page Object Structure

Page objects are organized into component-based POMs for better maintainability:

- **Page-level POMs** (`DatabasesPage`) - High-level page actions
- **Component POMs** (`AddDatabaseDialog`, `DatabaseList`) - Reusable UI components

```typescript
// Access component POMs through the page
await databasesPage.addDatabaseDialog.fillForm(config);
await databasesPage.databaseList.getRow(name);
```

### Test Structure

Tests are organized into **projects** (folders) based on execution requirements, then by feature:

```
tests/
├── main/                   # Default parallel tests
│   ├── browser/
│   │   ├── add-key/
│   │   └── key-details/
│   ├── databases/
│   │   ├── add-database/
│   │   └── edit-database/
│   └── workbench/
├── auto-update/            # Serial tests with special setup
│   └── update-flow.spec.ts
└── electron/               # Electron-only features
    └── deep-links.spec.ts
```

### Playwright Projects

Tests are organized into **projects** that can have different configurations:

| Project | Folder | Parallelism | Use Case |
|---------|--------|-------------|----------|
| `chromium` | `tests/main/` | Parallel | Standard tests in Chromium browser |
| `electron` | `tests/main/` | Serial | Same tests in Electron desktop app |
| `auto-update` | `tests/auto-update/` | Serial | Tests requiring special setup or causing flakiness |

Run specific projects:
```bash
npx playwright test --project=chromium       # Chromium browser tests
npx playwright test --project=electron       # Electron desktop tests
npx playwright test --project=auto-update    # Auto-update tests
npx playwright test                           # All projects
```

**When to create a new project:**
- Tests require different parallelism settings (serial vs parallel)
- Tests need different global setup/teardown
- Tests would cause flakiness when run with other tests
- Tests require special environment configuration

## Writing Tests

Tests are organized by feature area. Each test file should:
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Use Page Object Models for UI interactions
- Use faker for test data generation
- Use test data factories from `test-data/`
- Clean up created data in `afterEach` via API (faster and more reliable)

Example:
```typescript
import { test, expect } from '../../../fixtures/base';
import { getStandaloneConfig } from '../../../test-data/databases';

test.describe('Add Database > Standalone', () => {
  test.afterEach(async ({ apiHelper }) => {
    // Clean up all test databases via API (fast)
    await apiHelper.deleteTestDatabases();
  });

  test('should add standalone database', async ({ databasesPage }) => {
    const config = getStandaloneConfig();

    await databasesPage.goto();
    await databasesPage.addDatabase(config);

    await expect(databasesPage.databaseList.getRow(config.name)).toBeVisible();
  });
});
```

## API Helper

Use the `apiHelper` fixture for test setup/teardown via API (faster than UI):

```typescript
test('should work with pre-created database', async ({ databasesPage, apiHelper }) => {
  // Create database via API (fast)
  const db = await apiHelper.createDatabase(getStandaloneConfig());

  // Test UI behavior
  await databasesPage.goto();
  await expect(databasesPage.getDatabaseRow(db.name)).toBeVisible();

  // Cleanup via API
  await apiHelper.deleteDatabase(db.id);
});
```

