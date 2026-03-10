# RedisInsight AI Agent Instructions

This file provides essential context and instructions for AI coding agents working on RedisInsight.

## Project Overview

**RedisInsight** is a desktop application for Redis database management built with:

- **Frontend**: React 18, TypeScript, Redux Toolkit, styled-components, Monaco Editor, Vite
- **Backend**: NestJS, TypeScript, Node.js
- **Desktop**: Electron for cross-platform distribution
- **Testing**: Jest, Testing Library, Playwright

**Architecture**:

```
redisinsight/
├── ui/          # React frontend (Vite + TypeScript)
├── api/         # NestJS backend (TypeScript)
├── desktop/     # Electron main process
└── tests/       # E2E tests (Playwright)
```

## Setup Commands

### Development

```bash
# Frontend development (web)
yarn dev:ui

# Backend development
yarn dev:api

# Desktop app development (runs all: API + UI + Electron)
yarn dev:desktop

# Frontend with coverage
yarn dev:ui:coverage
```

## Testing Instructions

### Run Tests

```bash
# Frontend tests
yarn test              # Run all UI tests

# Backend tests
yarn test:api          # Run all API tests

# E2E tests
yarn --cwd tests/e2e test
```

### Run Specific Frontend Tests

```bash
# Run a specific test file
node 'node_modules/.bin/jest' 'redisinsight/ui/src/path/to/Component.spec.tsx' -c 'jest.config.cjs'

# Run a specific test by name (use -t flag)
node 'node_modules/.bin/jest' 'redisinsight/ui/src/path/to/Component.spec.tsx' -c 'jest.config.cjs' -t 'test name pattern'

# Example:
node 'node_modules/.bin/jest' 'redisinsight/ui/src/slices/tests/browser/keys.spec.ts' -c 'jest.config.cjs' -t 'refreshKeyInfoAction'
```

### Before Committing

**ALWAYS run these before committing:**

```bash
# Lint check
yarn lint              # All code
yarn lint:ui           # Frontend only
yarn lint:api          # Backend only

# Type checking
yarn type-check:ui     # Frontend TypeScript

# Tests
yarn test              # Frontend tests
yarn test:api          # Backend tests
```

**Fix any linting errors, type errors, or test failures before committing.**

All detailed development standards are maintained in `.ai/rules/`:

- **Code Quality**: `.ai/rules/code-quality.md` - Linting, TypeScript standards
- **Frontend**: `.ai/rules/frontend.md` - React, Redux, UI patterns, styled-components
- **Backend**: `.ai/rules/backend.md` - NestJS, API patterns, dependency injection
- **Testing**: `.ai/rules/testing.md` - Testing standards, faker usage, test patterns
- **Branches**: `.ai/rules/branches.md` - Branch naming conventions
- **Commits**: `.ai/rules/commits.md` - Commit message guidelines
- **Pull Requests**: `.ai/rules/pull-requests.md` - PR process and review guidelines

**Refer to these files for comprehensive guidelines on each topic.**

## Boundaries

### ✅ Always Do

- Write to `src/` and `tests/` directories
- Run `yarn lint` and `yarn test` before commits
- Follow naming conventions (camelCase, PascalCase, UPPER_SNAKE_CASE)
- Use faker library for test data generation
- Use `renderComponent` helper in component tests
- Extract duplicate strings to constants
- Use semantic colors from theme (not CSS variables)
- Use layout components (Row/Col/FlexGroup) instead of div
- Pass layout props as component props (not hardcoded in styles)

### ⚠️ Ask First

- Database schema changes
- Adding new dependencies
- Modifying CI/CD configuration (`.github/workflows/`)
- Changes to build configuration
- Breaking changes to APIs

### 🚫 Never Do

- Commit secrets or API keys
- Edit `node_modules/` or `vendor/` directories
- Use fixed time waits in tests (use `waitFor` instead)
- Use `!important` in styled-components
- Import directly from `@redis-ui/*` (use internal wrappers from `uiSrc/components/ui`)
- Use Elastic UI for new code (migrating to Redis UI)
- Use hardcoded pixel values (use theme spacing)
- Use `any` type without reason

## Learned User Preferences

- Always use the `/theme` skill to verify theme token values instead of guessing paths or values
- Use existing components (e.g., `Divider.tsx`, Redis UI `Title`) rather than creating new files or custom components
- Extract types and interfaces to dedicated `ComponentName.types.ts` files, not inline in component files
- Don't add redundant flex styles to layout components (Row/FlexGroup) since they already have `display: flex`
- Only use styled-components for styling; if a change can't be done as styled-components, discard it
- When migrating SCSS to styled-components, don't add properties that weren't in the original SCSS
- Always call `search()` before `edit()` on database list in E2E tests to ensure row is visible (pagination)
- Use dynamic config from env vars in E2E test fixtures, never hardcoded host/port values
- Each Jira ticket gets its own branch and PR; don't combine multiple tickets
- Prefer concise variable names (e.g., `strictNumbers` over `numbersOnlyFromActualNumbers`)
- Always run relevant tests after making changes before considering work complete
- Prefer plain text lists over markdown tables for PR/ticket summaries

## Learned Workspace Facts

- E2E Playwright tests live in `tests/e2e-playwright/` with page objects in `pages/`, factories in `test-data/databases/`
- Config factories (`StandaloneConfigFactory`, `ClusterConfigFactory`) read host/port from env vars via `redisConfig`
- Cluster Redis (port 8200) is often unavailable locally; use try/catch and `test.skip` in E2E setup
- E2E test cleanup should prefer API-based deletion (`apiHelper.deleteDatabase(id)`) over UI-based deletion
- Use `acceptEula()` (unconditional PATCH) instead of `ensureEulaAccepted()` in `afterAll` cleanup blocks
- TLS cert names must be unique per test invocation; use `createUniqueTlsCerts()` per test
- Port values in test data must be within 0-65535 (backend DTO validates with `@Max(65535)`)
- PRs target `redis/RedisInsight`; the repo moved from `RedisInsight/RedisInsight`
- E2E branch naming pattern: `e2e/RI-XXXX/<feature-name>`
- Bugbot comments on PRs should be checked and addressed before merging
- `exportSelected()` on database list opens a confirmation popover with a second "Export" button
- Flaky tests exist in CI: `local.features-config.repository.spec.ts`, `CommandsView.spec.tsx`
