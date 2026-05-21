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
yarn --cwd tests/e2e-playwright test
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

# Type checking (compares against .tscheck.rec.json baselines for ui/api/desktop + configs)
yarn type-check

# Refresh baselines after intentionally adding or fixing TS errors (do not run casually)
yarn tscheck

# Tests
yarn test              # Frontend tests
yarn test:api          # Backend tests
```

`yarn type-check` is the gate — CI fails if any (file × error-code) TS-error count increases. If you intentionally changed TS-error counts, run `yarn tscheck` to refresh the baselines and commit the updated `.tscheck.rec.json` files. See `.ai/skills/type-check-baselines/SKILL.md` for details (including the `yarn tscheck:force` escape hatch).

**Fix any linting errors, type errors, or test failures before committing.**

## Always-On Rules

These apply to every change in the repo. Skill files contain the full detail; the essentials are listed here so they're never missed.

### Code quality (always)

- Run `yarn lint` and `yarn type-check` before committing — both must pass.
- TypeScript everywhere. Avoid `any`; use `unknown` if you must.
- Naming: `PascalCase` components, `camelCase` functions/variables, `UPPER_SNAKE_CASE` constants, `is/has/should` prefix for booleans.
- No `console.log` in production code (use `console.warn`/`error`).
- Imports: external → built-ins → internal aliases (`uiSrc/*`, `apiClient`, `desktopSrc/*`) → relative → styles last. UI must not import from backend directly — use `apiClient`.
- No magic numbers; extract duplicated strings to constants.

### Git safety (always)

- **Never commit, push, or force-push directly to `main`, `latest`, or `release/*`.** Always create a feature branch first.
- Verify current branch with `git branch --show-current` before any push.
- All changes go through pull requests.

## Skills

All detailed development standards are exposed as skills under `.ai/skills/`. Claude Code auto-discovers them; each skill triggers when its description matches the task.

- **Code Quality**: `.ai/skills/code-quality/SKILL.md` - Linting, TypeScript standards, naming, import order
- **Frontend**: `.ai/skills/frontend/SKILL.md` - React, Redux, UI patterns, styled-components
- **Backend**: `.ai/skills/backend/SKILL.md` - NestJS, API patterns, dependency injection
- **Testing**: `.ai/skills/testing/SKILL.md` - Jest/Testing Library standards, faker, test patterns
- **E2E Testing**: `.ai/skills/e2e-testing/SKILL.md` - Playwright standards, page objects
- **Git Safety**: `.ai/skills/git-safety/SKILL.md` - Protected-branch guardrails (detail)
- **Branches**: `.ai/skills/branches/SKILL.md` - Branch naming conventions
- **Commits**: `.ai/skills/commits/SKILL.md` - Commit message guidelines
- **Pull Requests**: `.ai/skills/pull-requests/SKILL.md` - PR process and review guidelines
- **Feature Flags**: `.ai/skills/feature-flags/SKILL.md` - Adding, promoting, and removing feature flags
- **TS Error Baselines**: `.ai/skills/type-check-baselines/SKILL.md` - Running and refreshing TypeScript error baselines
- **Redis UI Components**: `.ai/skills/redis-ui-components/SKILL.md` - Component API references, props, and usage examples (from `@redis-ui/components` package)

**Refer to these files for comprehensive guidelines on each topic.**

## Boundaries

### ✅ Always Do

- Ensure the current branch name follows `.ai/skills/branches/SKILL.md` before opening a PR; rename it if it doesn't
- Write to `src/` and `tests/` directories
- Run `yarn lint` and `yarn test` before commits
- Follow naming conventions (camelCase, PascalCase, UPPER_SNAKE_CASE)
- Use faker library for test data generation
- Use `renderComponent` helper in component tests
- Extract duplicate strings to constants
- Use semantic colors from theme (not CSS variables)
- Use layout components (Row/Col/FlexGroup) instead of div
- Pass layout props as component props (not hardcoded in styles)
- Consult the `redis-ui-components` skill (`.ai/skills/redis-ui-components/`) for component APIs when writing frontend code

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
