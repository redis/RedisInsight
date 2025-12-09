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

1. Start Redis instances using Docker Compose:
   ```bash
   cd tests/e2e
   docker-compose -f rte.docker-compose.yml up -d
   ```

2. Start RedisInsight application on `http://localhost:8080`

## Installation

```bash
cd tests/e2e-v2
npm install
npx playwright install chromium
```

## Configuration

Copy `.env.example` to `.env` and update values for your environment:
```bash
cp .env.example .env
```

Environment variables:
- `RI_BASE_URL` - RedisInsight UI URL (default: `http://localhost:8080`)
- `RI_API_URL` - RedisInsight API URL (default: `http://localhost:5540`)
- `OSS_STANDALONE_*` - Standalone Redis connection details
- `OSS_CLUSTER_*` - Cluster Redis connection details
- `OSS_SENTINEL_*` - Sentinel Redis connection details

## Running Tests

### Browser Tests (Default)

```bash
# Run all tests
npm test

# Run by tag
npm run test:smoke        # Quick sanity checks
npm run test:critical     # Must-pass tests
npm run test:regression   # Full coverage

# Run in different environments
npm run test:ci           # CI environment
npm run test:staging      # Staging environment
ENV=staging npm test      # Alternative syntax

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests with UI mode
npm run test:ui

# View test report
npm run test:report

# Generate test code
npm run test:codegen
```

### Electron Desktop Tests

Run tests against the Electron desktop build instead of the browser.

#### Prerequisites

1. Build the Electron app from the root directory:
   ```bash
   yarn package:prod
   ```

2. Set the `ELECTRON_EXECUTABLE_PATH` environment variable to point to the built executable.

#### Platform-Specific Paths

| Platform | Executable Path |
|----------|-----------------|
| macOS arm64 | `release/mac-arm64/Redis Insight.app/Contents/MacOS/Redis Insight` |
| macOS x64 | `release/mac-x64/Redis Insight.app/Contents/MacOS/Redis Insight` |
| Linux | `release/linux-unpacked/redisinsight` |
| Windows | `release/win-unpacked/Redis Insight.exe` |

#### Running Electron Tests

```bash
# Run all tests against Electron (macOS arm64 example)
ELECTRON_EXECUTABLE_PATH="../../release/mac-arm64/Redis Insight.app/Contents/MacOS/Redis Insight" npm test

# Run smoke tests against Electron
ELECTRON_EXECUTABLE_PATH="../../release/mac-arm64/Redis Insight.app/Contents/MacOS/Redis Insight" npm run test:smoke

# Run specific test file
ELECTRON_EXECUTABLE_PATH="../../release/mac-arm64/Redis Insight.app/Contents/MacOS/Redis Insight" npm test -- tests/navigation/navigation.spec.ts

# Run with headed mode (watch the app)
ELECTRON_EXECUTABLE_PATH="../../release/mac-arm64/Redis Insight.app/Contents/MacOS/Redis Insight" npm test -- --headed

# Debug mode
ELECTRON_EXECUTABLE_PATH="../../release/mac-arm64/Redis Insight.app/Contents/MacOS/Redis Insight" npm run test:debug
```

#### Using npm Scripts

For convenience, you can also use the dedicated Electron scripts:

```bash
# Set the path once
export ELECTRON_EXECUTABLE_PATH="../../release/mac-arm64/Redis Insight.app/Contents/MacOS/Redis Insight"

# Run Electron tests
npm run test:electron
npm run test:electron:smoke
npm run test:electron:debug
```

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

## Test Tags

Tests can be tagged for selective execution:

```typescript
import { Tags } from '../../../config';

test(`should add database ${Tags.SMOKE} ${Tags.CRITICAL}`, ...);
test(`should handle edge case ${Tags.REGRESSION}`, ...);
```

Available tags:
- `@smoke` - Quick sanity checks
- `@critical` - Must pass for releases
- `@regression` - Full test coverage
- `@slow` - Long-running tests
- `@flaky` - Known unstable tests

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
tests/e2e-v2/
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
├── tests/             # Test files (nested by feature/action)
│   └── databases/
│       └── add-database/
│           ├── standalone.spec.ts
│           └── cluster.spec.ts
├── types/             # TypeScript type definitions
├── global-setup.ts    # Runs before all tests
├── global-teardown.ts # Runs after all tests
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

Tests are organized by feature and action for scalability:

```
tests/
└── databases/
    ├── add-database/       # All "add database" tests
    │   ├── standalone.spec.ts
    │   ├── cluster.spec.ts
    │   └── sentinel.spec.ts
    ├── edit-database/      # All "edit database" tests
    ├── delete-database/    # All "delete database" tests
    └── list/               # Database list tests
```

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

